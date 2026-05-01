/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk').default;

// Load env vars
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();
const TTB_KEY = process.env.ALADIN_API_KEY || 'ttblovefire03141750001';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const client = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;
const MODEL = 'claude-haiku-4-5';

async function generateRecommendation(title, author, description) {
    if (!client) {
        return "AI 추천사를 생성하지 못했습니다.";
    }

    try {
        const prompt = `
        책 제목: ${title}
        저자: ${author}
        책 소개: ${description}

        이 책을 "지금 읽어야 하는 이유"와 "추천 대상"을 포함하여 3~4문장의 매력적인 추천사(큐레이션 멘트)를 작성해줘.
        독자에게 말을 건네는 듯한 부드럽고 설득력 있는 어조로(해요체).
        추천사 본문만 출력하고, 다른 부연 설명은 하지 마세요.
        `;

        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        });

        const textBlock = response.content.find(block => block.type === 'text');
        return textBlock ? textBlock.text.trim() : "AI 추천사를 생성하지 못했습니다.";
    } catch (error) {
        console.error("Anthropic Generation Error:", error.message);
        return "AI 추천사를 생성하지 못했습니다."; // Fallback
    }
}

async function searchAndAddBook(title) {
    if (!title) {
        console.error("Please provide a book title.");
        return;
    }

    console.log(`Searching Aladin for: "${title}"...`);

    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
            params: {
                ttbkey: TTB_KEY,
                Query: title,
                QueryType: 'Title',
                MaxResults: 1,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            }
        });

        const items = response.data.item;
        if (!items || items.length === 0) {
            console.log("No books found.");
            return;
        }

        const bookData = items[0];
        console.log(`Found: ${bookData.title} by ${bookData.author}`);

        const authorClean = bookData.author.split('(')[0].trim();

        let recommendation = "";
        if (ANTHROPIC_KEY) {
            console.log("Generating AI Recommendation (Claude Haiku)...");
            recommendation = await generateRecommendation(bookData.title, authorClean, bookData.description);
            console.log("AI Recommendation Generated!");
        } else {
            console.log("Skipping AI Recommendation (No ANTHROPIC_API_KEY)");
        }

        const newBook = {
            title: bookData.title,
            author: authorClean,
            category: bookData.categoryName.split('>')[1] || "General",
            description: bookData.description || "No description available.",
            summary: bookData.description ? bookData.description.substring(0, 150) + "..." : "No summary.",
            recommendation: recommendation,
            imageUrl: bookData.cover,
            purchaseLink: bookData.link,
            isChoice: true
        };

        const existing = await prisma.book.findFirst({
            where: { title: newBook.title }
        });

        if (existing) {
            console.log("Book already exists. Updating with AI recommendation...");
            await prisma.book.update({
                where: { id: existing.id },
                data: newBook
            });
            console.log("Updated!");
        } else {
            await prisma.book.create({ data: newBook });
            console.log("Book added to Curation list!");
        }

    } catch (error) {
        console.error("Error fetching/saving book:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

const titleArg = process.argv.slice(2).join(' ');
searchAndAddBook(titleArg);
