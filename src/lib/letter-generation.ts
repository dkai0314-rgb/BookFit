/**
 * 회차 자동 생성 로직
 * single: BookMeta → Claude 구조화 단권 레터 draft
 * theme:  theme(string) → Claude 구조화 테마 레터(3권) draft
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { searchBookInAladin } from './aladin';
import {
    findBookByTitle,
    createBook,
    upsertLetter,
    findLetterBySlug,
    type Letter,
    type StructuredContent,
} from './firestore-models';
import { singleLetterSchema, buildSingleLetterPrompt } from './prompts/letter-single';
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

// structuredContent → 마크다운 파생 (fallback용 + SEO)
function deriveMarkdown(sc: StructuredContent): string {
    const lines: string[] = [];
    lines.push(`# ${sc.headline}`);
    lines.push('');
    lines.push(sc.subheadline);
    lines.push('');
    lines.push(`> ${sc.curatorNote}`);
    lines.push('');

    if (sc.type === 'single') {
        if (sc.keyQuote) {
            lines.push(`> *"${sc.keyQuote}"*`);
            lines.push('');
        }
        if (sc.insights) {
            lines.push('## 읽고 나면 달라지는 것');
            for (const ins of sc.insights) {
                lines.push(`### ${ins.title}`);
                lines.push(ins.body);
                lines.push('');
                lines.push(`> 🤔 ${ins.reflection}`);
                lines.push('');
            }
        }
        if (sc.twoWeekChallenge) {
            lines.push('## 2주 적용 실험');
            for (const rule of sc.twoWeekChallenge.rules) {
                lines.push(`- ${rule}`);
            }
            lines.push('');
            lines.push(`**목표:** ${sc.twoWeekChallenge.goal}`);
            lines.push('');
        }
    } else {
        if (sc.themeBooks) {
            for (let i = 0; i < sc.themeBooks.length; i++) {
                const b = sc.themeBooks[i];
                lines.push(`## ${i + 1}. ${b.title} — ${b.author}`);
                lines.push(`**이런 분께:** ${b.forWhom}`);
                lines.push('');
                lines.push(b.curatorPick);
                lines.push('');
                lines.push(`**읽고 나면:** ${b.afterReading}`);
                lines.push('');
                lines.push(`> 🤔 ${b.reflection}`);
                lines.push('');
            }
        }
        if (sc.themeConclusion) {
            lines.push('## 마무리');
            lines.push(sc.themeConclusion);
            lines.push('');
        }
    }

    lines.push('## 이런 분께 특히 추천해요');
    for (const r of sc.recommendation) {
        lines.push(`- ${r}`);
    }
    lines.push('');
    lines.push('## 읽고 나면');
    for (const a of sc.afterReading) {
        lines.push(`- ${a}`);
    }

    return lines.join('\n');
}

export async function generateSingleLetterDraft(book: BookMeta): Promise<Letter> {
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

    const { object: pick } = await generateObject({
        model: anthropic('claude-sonnet-4-5'),
        schema: singleLetterSchema,
        prompt: buildSingleLetterPrompt(book),
    });

    const structuredContent: StructuredContent = {
        type: 'single',
        metaTitle: pick.metaTitle,
        metaDescription: pick.metaDescription,
        ogTitle: pick.ogTitle,
        ogDescription: pick.ogDescription,
        tags: pick.tags,
        headline: pick.headline,
        subheadline: pick.subheadline,
        curatorNote: pick.curatorNote,
        keyQuote: pick.keyQuote,
        insights: pick.insights,
        twoWeekChallenge: pick.twoWeekChallenge,
        recommendation: pick.recommendation,
        afterReading: pick.afterReading,
        instagramCaption: pick.instagramCaption,
    };

    const contentMarkdown = deriveMarkdown(structuredContent);
    const baseSlug = book.sourceId ? `bookfit-${book.sourceId}` : `${slugifyKo(book.title) || 'letter'}-${shortHash()}`;
    const slug = await uniqueLetterSlug(baseSlug);
    const readingTime = estimateReadingTime(contentMarkdown);

    return upsertLetter(slug, {
        title: `[북핏레터] ${book.title}`,
        headlineTitle: pick.headline,
        contentMarkdown,
        structuredContent,
        kind: 'letter',
        bookIds: [bookDoc.id],
        curatorNote: pick.curatorNote,
        category: null,
        status: 'draft',
        isFeatured: false,
        metaTitle: pick.metaTitle,
        metaDescription: pick.metaDescription,
        ogImageUrl: book.coverImageUrl || null,
        coverImageUrl: book.coverImageUrl || null,
        readingTime,
        authors: (book.authors ?? []).join(', ') || null,
        publisher: book.publisher || null,
        publishedDate: book.publishedDate || null,
        isbn13: book.isbn13 || null,
        googleVolumeId: book.sourceId || null,
        source: 'aladin',
        tags: pick.instagramCaption,
    });
}

export async function generateThemeLetterDraft(theme: string): Promise<Letter> {
    if (!theme.trim()) throw new Error('테마(theme)가 필요합니다.');

    const { object: pick } = await generateObject({
        model: anthropic('claude-haiku-4-5'),
        schema: monthlyPickSchema,
        prompt: buildMonthlyPickPrompt(theme),
    });

    // 책 3권 알라딘 검증 + Firestore upsert
    const bookIds: string[] = [];
    let firstCover: string | null = null;

    for (const item of pick.books) {
        const bestMatch = await searchBookInAladin(item.title);
        if (!bestMatch) {
            continue;
        }
        let bookDoc = await findBookByTitle(bestMatch.title);
        if (!bookDoc) {
            bookDoc = await createBook({
                title: bestMatch.title,
                author: bestMatch.author,
                category: bestMatch.categoryName || 'General',
                description: bestMatch.description || '',
                imageUrl: bestMatch.cover ?? null,
                purchaseLink: bestMatch.link ?? null,
                recommendation: item.forWhom,
            });
        }
        bookIds.push(bookDoc.id);
        if (!firstCover && bookDoc.imageUrl) firstCover = bookDoc.imageUrl;
    }

    const structuredContent: StructuredContent = {
        type: 'theme',
        metaTitle: pick.metaTitle,
        metaDescription: pick.metaDescription,
        ogTitle: pick.ogTitle,
        ogDescription: pick.ogDescription,
        tags: pick.tags,
        headline: pick.headline,
        subheadline: pick.subheadline,
        curatorNote: pick.curatorNote,
        theme,
        themeBooks: pick.books.map((b) => ({
            title: b.title,
            author: b.author,
            forWhom: b.forWhom,
            curatorPick: b.curatorPick,
            afterReading: b.afterReading,
            reflection: b.reflection,
        })),
        themeConclusion: pick.themeConclusion,
        recommendation: pick.recommendation,
        afterReading: pick.afterReading,
        instagramCaption: pick.instagramCaption,
    };

    const contentMarkdown = deriveMarkdown(structuredContent);
    const slug = await uniqueLetterSlug(slugifyKo(pick.headline) || 'letter');
    const readingTime = estimateReadingTime(contentMarkdown);

    return upsertLetter(slug, {
        title: pick.headline,
        headlineTitle: pick.headline,
        contentMarkdown,
        structuredContent,
        kind: 'letter',
        bookIds,
        curatorNote: pick.curatorNote,
        category: null,
        status: 'draft',
        isFeatured: false,
        metaTitle: pick.metaTitle,
        metaDescription: pick.metaDescription,
        ogImageUrl: firstCover,
        coverImageUrl: firstCover,
        readingTime,
        authors: null,
        publisher: null,
        publishedDate: null,
        isbn13: null,
        googleVolumeId: null,
        source: 'aladin',
        tags: pick.instagramCaption,
    });
}

// 하위호환: 기존 호출부가 generateMonthlyPickDraft를 쓰던 곳
export const generateMonthlyPickDraft = generateThemeLetterDraft;
// 하위호환: generateWeeklyLetterDraft
export const generateWeeklyLetterDraft = generateSingleLetterDraft;
