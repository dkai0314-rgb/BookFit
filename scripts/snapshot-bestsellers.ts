import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Get TTBKey from environment
const ALADIN_TTB_KEY = process.env.ALADIN_TTB_KEY;

// Target Month: Default to current month YYYY-MM
// Can be overridden via command line: npx ts-node script.ts 2024-01
const TARGET_MONTH = process.argv[2] || new Date().toISOString().slice(0, 7);

async function main() {
    if (!ALADIN_TTB_KEY) {
        console.error("❌ ERROR: ALADIN_TTB_KEY is missing in environment variables.");
        process.exit(1);
    }

    console.log(`🚀 Starting Monthly Bestseller Snapshot for [${TARGET_MONTH}]...`);

    try {
        // 1. Fetch Data from Aladin API
        // QueryType=Bestseller, SearchTarget=Book, MaxResults=50 (to ensure enough valid items)
        const apiUrl = 'http://www.aladin.co.kr/ttb/api/ItemList.aspx';
        const response = await axios.get(apiUrl, {
            params: {
                ttbkey: ALADIN_TTB_KEY,
                QueryType: 'Bestseller',
                MaxResults: 50,
                start: 1,
                SearchTarget: 'Book',
                output: 'js', // Returns JSON
                Version: '20131101'
            }
        });

        const items = response.data.item;
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error("No items returned from Aladin API. Check your TTBKey or API status.");
        }

        console.log(`📦 Fetched ${items.length} raw items from Aladin.`);

        // 2. Process and Store Data (Transaction)
        // We only take the top 30 valid books.
        let storedCount = 0;
        const top30 = items.slice(0, 30);

        await prisma.$transaction(async (tx) => {
            for (const [index, item] of top30.entries()) {
                const rank = index + 1;

                // Basic validation
                if (!item.title || !item.isbn13) {
                    console.warn(`⚠️ Skipping rank ${rank}: Missing Title or ISBN13`);
                    continue;
                }

                // Upsert to DB
                // If (snapshotMonth + isbn13) exists, update it. Otherwise create.
                await tx.monthlyBestseller.upsert({
                    where: {
                        snapshotMonth_isbn13: {
                            snapshotMonth: TARGET_MONTH,
                            isbn13: item.isbn13
                        }
                    },
                    update: {
                        rank: rank,
                        title: item.title,
                        author: item.author,
                        publisher: item.publisher,
                        coverUrl: item.cover || '',
                        categoryName: item.categoryName || '',
                        description: item.description || '',
                        link: item.link || '',
                        // We usually don't update 'source' or 'createdAt' on update
                    },
                    create: {
                        snapshotMonth: TARGET_MONTH,
                        rank: rank,
                        isbn13: item.isbn13,
                        title: item.title,
                        author: item.author,
                        publisher: item.publisher,
                        coverUrl: item.cover || '',
                        categoryName: item.categoryName || '',
                        description: item.description || '',
                        link: item.link || '',
                        source: 'aladin'
                    }
                });
                storedCount++;
            }
        });

        console.log(`✅ Successfully archived ${storedCount} bestsellers for ${TARGET_MONTH}`);

    } catch (error) {
        console.error("❌ Snapshot failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
