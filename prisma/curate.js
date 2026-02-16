
/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load env vars
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();
const TTB_KEY = process.env.ALADIN_API_KEY || 'ttblovefire03141750001';
const GEN_AI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_BOOKS_API_KEY;

const genAI = new GoogleGenerativeAI(GEN_AI_KEY);

async function generateRecommendation(title, author, description) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        책 제목: ${title}
        저자: ${author}
        책 소개: ${description}

        이 책을 "지금 읽어야 하는 이유"와 "추천 대상"을 포함하여 3~4문장의 매력적인 추천사(큐레이션 멘트)를 작성해줘. 
        독자에게 말을 건네는 듯한 부드럽고 설득력 있는 어조로(해요체).
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Generation Error:", error.message);
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
        if (GEN_AI_KEY) {
            console.log("Generating AI Recommendation...");
            recommendation = await generateRecommendation(bookData.title, authorClean, bookData.description);
            console.log("AI Recommendation Generated!");
        } else {
            console.log("Skipping AI Recommendation (No API Key)");
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
