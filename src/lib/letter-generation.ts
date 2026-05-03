/**
 * 회차 자동 생성 로직 — admin UI(/api/letter/generate)와 cron(/api/cron/weekly-draft) 양쪽에서 호출.
 *
 * weekly: BookMeta(알라딘에서 검색된 책 1권) → Claude 단권 letter draft
 * monthly_pick: theme(string) → Claude가 책 3권 + 본문 작성 → 알라딘 검증 → letter draft
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { generateBookFitLetter } from './anthropic';
import { searchBookInAladin } from './aladin';
import {
    findBookByTitle,
    createBook,
    upsertLetter,
    findLetterBySlug,
    type Letter,
    type LetterKind,
} from './firestore-models';
import { monthlyPickSchema, buildMonthlyPickPrompt } from './prompts/letter-monthly-pick';
import { slugifyKo, shortHash, estimateReadingTime } from './prompts/curation';
import type { BookMeta } from './book-apis';

export async function uniqueLetterSlug(base: string): Promise<string> {
    const cleanBase = slugifyKo(base) || 'letter';
    for (let i = 0; i < 5; i += 1) {
        const candidate = i === 0 ? cleanBase : `${cleanBase}-${shortHash()}`;
        const exists = await findLetterBySlug(candidate);
        if (!exists) return candidate;
    }
    return `${cleanBase}-${Date.now().toString(36)}`;
}

export async function generateWeeklyLetterDraft(
    book: BookMeta,
    kind: LetterKind = 'weekly',
): Promise<Letter> {
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

    const draftMarkdown = await generateBookFitLetter(book);

    const baseSlug = book.sourceId
        ? `bookfit-${book.sourceId}`
        : `${slugifyKo(book.title) || 'letter'}-${shortHash()}`;
    const slug = await uniqueLetterSlug(baseSlug);

    const readingTime = estimateReadingTime(draftMarkdown);

    return upsertLetter(slug, {
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
}

export async function generateMonthlyPickDraft(theme: string): Promise<Letter> {
    if (!theme.trim()) {
        throw new Error('테마(theme)가 필요합니다.');
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

    return upsertLetter(slug, {
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
}
