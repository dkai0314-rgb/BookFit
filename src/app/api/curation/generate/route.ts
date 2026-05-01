import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { searchBookInAladin } from '@/lib/aladin';
import { buildCurationPrompt, curationSchema } from '@/lib/prompts/curation';

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

            if (!bestMatch) {
                continue;
            }

            let book = await prisma.book.findFirst({
                where: { title: bestMatch.title }
            });

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
                    }
                });
            }
            finalizedBooks.push(book);
        }

        // 3. Create Curation Record
        const curation = await prisma.curation.create({
            data: {
                theme,
                title: curationData.title,
                description: curationData.description,
                instaCaption: curationData.instaCaption,
                books: {
                    connect: finalizedBooks.map(b => ({ id: b.id }))
                }
            },
            include: {
                books: true
            }
        });

        return NextResponse.json(curation);

    } catch (error) {
        console.error('Curation generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate curation' }, { status: 500 });
    }
}
