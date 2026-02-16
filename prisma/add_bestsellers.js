
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const TTB_KEY = process.env.ALADIN_API_KEY || 'ttblovefire03141750001';

async function addBestsellers() {
    console.log("Fetching Top 2 Bestsellers from Aladin...");

    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemList.aspx', {
            params: {
                ttbkey: TTB_KEY,
                QueryType: 'Bestseller',
                MaxResults: 2,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            }
        });

        const items = response.data.item;
        if (!items || items.length === 0) {
            console.log("No bestsellers found.");
            return;
        }

        for (const bookData of items) {
            console.log(`Found Bestseller: ${bookData.title} by ${bookData.author}`);

            const authorClean = bookData.author.split('(')[0].trim();

            const newBook = {
                title: bookData.title,
                author: authorClean,
                category: bookData.categoryName.split('>')[1] || "Bestseller",
                description: bookData.description || "No description available.",
                summary: bookData.description || "No summary available.",
                imageUrl: bookData.cover,
                purchaseLink: bookData.link,
                isChoice: true
            };

            const existing = await prisma.book.findFirst({
                where: { title: newBook.title }
            });

            if (existing) {
                console.log(`Skipped (Exists): ${newBook.title}`);
            } else {
                await prisma.book.create({ data: newBook });
                console.log(`Created: ${newBook.title}`);
            }
        }

    } catch (error) {
        console.error("Error fetching/saving bestsellers:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

addBestsellers();
