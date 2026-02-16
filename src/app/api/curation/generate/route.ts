
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { searchBookInAladin } from '@/lib/aladin';

// Schema for Gemini Output
const curationSchema = z.object({
    title: z.string().describe("A catchy, emotional title for the book collection"),
    description: z.string().describe("A warm, empathetic introduction to the collection (approx. 2-3 sentences)"),
    books: z.array(z.object({
        title: z.string(),
        reason: z.string().describe("Why this book fits the theme (1 sentence)"),
    })).length(3),
    instaCaption: z.string().describe("An engaging Instagram caption with emojis and hashtags"),
});

export async function POST(request: Request) {
    try {
        const { theme } = await request.json();

        if (!theme) {
            return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
        }

        // 1. Generate Content with Gemini
        const { object: curationData } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: curationSchema,
            prompt: `
        You are an expert book curator for "BookFit", an AI book prescription service.
        Create a curated collection of 3 books for the following theme: "${theme}".
        
        The tone should be:
        - Empathetic, warm, and professional.
        - Like a close friend recommending books.
        - Korean language only.

        For the Instagram caption:
        - Use line breaks for readability.
        - Include hashtags like #북핏 #BookFit #책추천 #[ThemeKeywords].
        - Use emojis relevant to the theme.
      `,
        });

        // 2. Fetch Real Book Data from Aladin
        const finalizedBooks = [];

        // Process books sequentially to avoid race conditions in DB creation if parallels
        for (const item of curationData.books) {
            const bestMatch = await searchBookInAladin(item.title);

            if (!bestMatch) {
                continue;
            }

            // Check existence by title (semantically unique for our purpose)
            let book = await prisma.book.findFirst({
                where: { title: bestMatch.title }
            });

            if (!book) {
                book = await prisma.book.create({
                    data: {
                        title: bestMatch.title,
                        author: bestMatch.author, // Aladin author is already cleaned in lib
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

        // 4. Return Result (Frontend will generate image using Satori endpoint)
        return NextResponse.json(curation);

    } catch (error) {
        console.error('Curation generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate curation' }, { status: 500 });
    }
}
