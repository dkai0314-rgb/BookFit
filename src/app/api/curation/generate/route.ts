import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { searchBookInAladin } from '@/lib/aladin';
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

        // 2. Fetch Real Book Data from Aladin
        const finalizedBooks = [];
        for (const item of curationData.books) {
            const bestMatch = await searchBookInAladin(item.title);
            if (!bestMatch) continue;

            let book = await prisma.book.findFirst({ where: { title: bestMatch.title } });
            if (!book) {
                book = await prisma.book.create({
                    data: {
                        title: bestMatch.title,
                        author: bestMatch.author,
                        category: bestMatch.categoryName || 'General',
                        description: bestMatch.description || '',
                        imageUrl: bestMatch.cover,
                        purchaseLink: bestMatch.link,
                        recommendation: item.reason,
                    },
                });
            }
            finalizedBooks.push(book);
        }

        // 3. Generate slug + reading time
        const slug = await uniqueSlug(curationData.title);
        const readingTime = estimateReadingTime(
            curationData.description,
            curationData.curatorNote,
            ...curationData.books.map((b) => b.reason),
        );

        // 4. Create Curation Record (status=draft, admin이 published 전환)
        const curation = await prisma.curation.create({
            data: {
                theme,
                title: curationData.title,
                description: curationData.description,
                instaCaption: curationData.instaCaption,
                slug,
                curatorNote: curationData.curatorNote,
                seoTitle: curationData.seoTitle,
                seoDesc: curationData.seoDesc,
                readingTime,
                status: 'draft',
                books: { connect: finalizedBooks.map((b) => ({ id: b.id })) },
            },
            include: { books: true },
        });

        return NextResponse.json(curation);
    } catch (error) {
        console.error('Curation generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate curation' }, { status: 500 });
    }
}

async function uniqueSlug(title: string): Promise<string> {
    for (let i = 0; i < 5; i += 1) {
        const candidate = buildCurationSlug(title);
        const exists = await prisma.curation.findUnique({ where: { slug: candidate } });
        if (!exists) return candidate;
    }
    return buildCurationSlug(title) + '-' + Date.now().toString(36);
}
