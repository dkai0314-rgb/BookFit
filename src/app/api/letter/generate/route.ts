import { NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { generateBookFitLetter } from '@/lib/anthropic';
import { searchBookInAladin } from '@/lib/aladin';
import {
    findBookByTitle,
    createBook,
    upsertLetter,
    findLetterBySlug,
    type LetterKind,
} from '@/lib/firestore-models';
import {
    monthlyPickSchema,
    buildMonthlyPickPrompt,
} from '@/lib/prompts/letter-monthly-pick';
import {
    slugifyKo,
    shortHash,
    estimateReadingTime,
} from '@/lib/prompts/curation';
import type { BookMeta } from '@/lib/book-apis';

/**
 * POST /api/letter/generate
 *
 * weekly:
 *   body: { kind: 'weekly', book: BookMeta }
 *   → 알라딘 BookMeta 1건 → Books 컬렉션 upsert → Claude로 frontmatter+본문 → Letter draft 저장
 *
 * monthly_pick:
 *   body: { kind: 'monthly_pick', theme: string }
 *   → Claude로 큐레이션 + 본문 생성 → 책 3권 알라딘 검색 → Books upsert → Letter draft 저장
 *
 * special: 본문/책 자유 — generate UI 없이 admin이 직접 PATCH로 작성. 본 endpoint에서는 weekly와 동일하게 책 메타만 받음.
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            kind?: LetterKind;
            book?: BookMeta;
            theme?: string;
        };
        const kind = body.kind ?? 'weekly';

        if (kind === 'monthly_pick') {
            return await generateMonthlyPick(body.theme ?? '');
        }
        if (kind === 'weekly' || kind === 'special') {
            if (!body.book) {
                return NextResponse.json(
                    { error: 'weekly 회차 생성에는 book 메타데이터가 필요합니다.' },
                    { status: 400 },
                );
            }
            return await generateWeekly(body.book, kind);
        }
        return NextResponse.json({ error: 'invalid kind' }, { status: 400 });
    } catch (error) {
        console.error('POST /api/letter/generate failed', error);
        return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 });
    }
}

async function generateWeekly(book: BookMeta, kind: LetterKind) {
    // 1. 책을 Books 컬렉션에 upsert
    let bookDoc = await findBookByTitle(book.title);
    if (!bookDoc) {
        bookDoc = await createBook({
            title: book.title,
            author: (book.authors ?? []).join(', ') || '저자 미상',
            category: (book.categories ?? [])[0] || 'General',
            description: book.sourceText || '',
            imageUrl: book.coverImageUrl || null,
            purchaseLink: null,
            recommendation: null,
        });
    }

    // 2. Claude로 본문 초안 생성
    const draftMarkdown = await generateBookFitLetter(book);

    // 3. slug 자동 생성 (book.sourceId 우선)
    const baseSlug = book.sourceId
        ? `bookfit-${book.sourceId}`
        : `${slugifyKo(book.title) || 'letter'}-${shortHash()}`;
    const slug = await uniqueLetterSlug(baseSlug);

    const readingTime = estimateReadingTime(draftMarkdown);

    const letter = await upsertLetter(slug, {
        title: `[BookFit] ${book.title}`,
        contentMarkdown: draftMarkdown,
        kind,
        bookIds: [bookDoc.id],
        curatorNote: null,
        category: null,
        status: 'draft',
        isFeatured: false,
        headlineTitle: null,
        metaTitle: null,
        metaDescription: null,
        ogImageUrl: null,
        coverImageUrl: book.coverImageUrl || null,
        readingTime,
        authors: (book.authors ?? []).join(', ') || null,
        publisher: book.publisher || null,
        publishedDate: book.publishedDate || null,
        isbn13: book.isbn13 || null,
        googleVolumeId: book.sourceId || null,
        source: 'aladin',
        tags: null,
    });

    return NextResponse.json({ success: true, letter });
}

async function generateMonthlyPick(theme: string) {
    if (!theme.trim()) {
        return NextResponse.json({ error: '테마(theme)가 필요합니다.' }, { status: 400 });
    }

    // 1. Claude로 회차 메타 + 본문 + 책 3권 생성
    const { object: pick } = await generateObject({
        model: anthropic('claude-haiku-4-5'),
        schema: monthlyPickSchema,
        prompt: buildMonthlyPickPrompt(theme),
    });

    // 2. 책 3권을 알라딘 → Books 컬렉션 upsert
    const bookIds: string[] = [];
    let firstCover: string | null = null;
    for (const item of pick.books) {
        const bestMatch = await searchBookInAladin(item.title);
        if (!bestMatch) continue;

        let bookDoc = await findBookByTitle(bestMatch.title);
        if (!bookDoc) {
            bookDoc = await createBook({
                title: bestMatch.title,
                author: bestMatch.author,
                category: bestMatch.categoryName || 'General',
                description: bestMatch.description || '',
                imageUrl: bestMatch.cover ?? null,
                purchaseLink: bestMatch.link ?? null,
                recommendation: item.reason,
            });
        }
        bookIds.push(bookDoc.id);
        if (!firstCover && bookDoc.imageUrl) firstCover = bookDoc.imageUrl;
    }

    // 3. slug 자동 생성
    const slug = await uniqueLetterSlug(slugifyKo(pick.title) || 'pick');
    const readingTime = estimateReadingTime(
        pick.curatorNote,
        pick.contentMarkdown,
        pick.description,
    );

    const letter = await upsertLetter(slug, {
        title: pick.title,
        contentMarkdown: pick.contentMarkdown,
        kind: 'monthly_pick',
        bookIds,
        curatorNote: pick.curatorNote,
        category: null,
        status: 'draft',
        isFeatured: false,
        headlineTitle: pick.headline,
        metaTitle: pick.seoTitle,
        metaDescription: pick.seoDesc,
        ogImageUrl: firstCover,
        coverImageUrl: firstCover,
        readingTime,
        authors: null,
        publisher: null,
        publishedDate: null,
        isbn13: null,
        googleVolumeId: null,
        source: 'aladin',
        tags: pick.instaCaption,
    });

    return NextResponse.json({ success: true, letter });
}

async function uniqueLetterSlug(base: string): Promise<string> {
    const cleanBase = slugifyKo(base) || 'letter';
    for (let i = 0; i < 5; i += 1) {
        const candidate = i === 0 ? cleanBase : `${cleanBase}-${shortHash()}`;
        const exists = await findLetterBySlug(candidate);
        if (!exists) return candidate;
    }
    return `${cleanBase}-${Date.now().toString(36)}`;
}
