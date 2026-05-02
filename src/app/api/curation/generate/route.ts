import { NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { searchBookInAladin } from '@/lib/aladin';
import {
    findBookByTitle,
    createBook,
    createCuration,
    findCurationBySlug,
    getBooksByIds,
} from '@/lib/firestore-models';
import {
    buildCurationPrompt,
    curationSchema,
    buildCurationSlug,
    estimateReadingTime,
} from '@/lib/prompts/curation';

export async function POST(request: Request) {
    try {
        const { theme } = await request.json();

        if (!theme) {
            return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
        }

        // 1. Generate Content with Claude
        const { object: curationData } = await generateObject({
            model: anthropic('claude-haiku-4-5'),
            schema: curationSchema,
            prompt: buildCurationPrompt(theme),
        });

        // 2. Fetch Real Book Data from Aladin → upsert into Firestore
        const finalizedBookIds: string[] = [];
        for (const item of curationData.books) {
            const bestMatch = await searchBookInAladin(item.title);
            if (!bestMatch) continue;

            let book = await findBookByTitle(bestMatch.title);
            if (!book) {
                book = await createBook({
                    title: bestMatch.title,
                    author: bestMatch.author,
                    category: bestMatch.categoryName || 'General',
                    description: bestMatch.description || '',
                    imageUrl: bestMatch.cover ?? null,
                    purchaseLink: bestMatch.link ?? null,
                    recommendation: item.reason,
                });
            }
            finalizedBookIds.push(book.id);
        }

        // 3. Generate slug + reading time
        const slug = await uniqueSlug(curationData.title);
        const readingTime = estimateReadingTime(
            curationData.description,
            curationData.curatorNote,
            ...curationData.books.map((b) => b.reason),
        );

        // 4. Create Curation Record (status=draft, admin이 published 전환)
        const curation = await createCuration({
            theme,
            title: curationData.title,
            description: curationData.description,
            instaCaption: curationData.instaCaption,
            slug,
            curatorNote: curationData.curatorNote,
            seoTitle: curationData.seoTitle,
            seoDesc: curationData.seoDesc,
            readingTime,
            bookIds: finalizedBookIds,
        });

        const books = await getBooksByIds(curation.bookIds);
        return NextResponse.json({ ...curation, books });
    } catch (error) {
        console.error('Curation generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate curation' }, { status: 500 });
    }
}

async function uniqueSlug(title: string): Promise<string> {
    for (let i = 0; i < 5; i += 1) {
        const candidate = buildCurationSlug(title);
        const exists = await findCurationBySlug(candidate);
        if (!exists) return candidate;
    }
    return buildCurationSlug(title) + '-' + Date.now().toString(36);
}
