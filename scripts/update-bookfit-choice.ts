import { fetchCurationFromSheet } from '../src/lib/google-sheets';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function generateCurationJson() {
    console.log("Fetching curation data from Google Sheets...");
    try {
        const curation = await fetchCurationFromSheet();

        if (curation) {
            console.log("Saving to Database...");
            // Save to Database
            for (const item of curation.books) {
                let book = await prisma.book.findFirst({
                    where: { title: item.title }
                });

                if (!book) {
                    book = await prisma.book.create({
                        data: {
                            title: item.title,
                            author: item.author,
                            category: item.category,
                            description: '',
                            recommendation: item.recommendation,
                            imageUrl: item.imageUrl,
                            purchaseLink: item.coupangLink,
                            isChoice: true
                        }
                    });
                } else {
                    await prisma.book.update({
                        where: { id: book.id },
                        data: {
                            author: item.author,
                            category: item.category,
                            recommendation: item.recommendation,
                            imageUrl: item.imageUrl,
                            purchaseLink: item.coupangLink,
                            isChoice: true
                        }
                    });
                }
            }

            let dbCuration = await prisma.curation.findFirst({
                where: { theme: curation.theme }
            });

            const bookRecords = await prisma.book.findMany({
                where: { title: { in: curation.books.map(b => b.title) } }
            });

            if (!dbCuration) {
                dbCuration = await prisma.curation.create({
                    data: {
                        theme: curation.theme,
                        title: curation.title || "BookFit Choice",
                        description: curation.description || "이번 달 북핏 큐레이션",
                        isPublished: true,
                        books: {
                            connect: bookRecords.map(b => ({ id: b.id }))
                        }
                    }
                });
            } else {
                await prisma.curation.update({
                    where: { id: dbCuration.id },
                    data: {
                        title: curation.title || dbCuration.title,
                        description: curation.description || dbCuration.description,
                        isPublished: true,
                        books: {
                            set: bookRecords.map(b => ({ id: b.id }))
                        }
                    }
                });
            }

            // Save to JSON for fast client fetching
            const jsonPath = path.join(process.cwd(), 'public/data/bookfit-choice.json');
            const dir = path.dirname(jsonPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(jsonPath, JSON.stringify(curation, null, 2), 'utf8');

            console.log(`✅ Successfully updated BookFit Choice data in Database and JSON at ${jsonPath}`);
            console.log(`Total books: ${curation.books.length}`);
        } else {
            console.error("❌ Failed to fetch curation data: null returned.");
        }
    } catch (error) {
        console.error("❌ Error generating curation DB/JSON:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

generateCurationJson();
