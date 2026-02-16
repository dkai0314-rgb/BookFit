/* eslint-disable @typescript-eslint/no-require-imports */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const TTB_KEY = process.env.ALADIN_API_KEY;

if (!TTB_KEY) {
    console.error("ALADIN_API_KEY is missing");
    process.exit(1);
}

const targets = [
    { title: "알간지", link: "https://link.coupang.com/a/dNto4A" }
];

async function search(title) {
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
        return response.data.item?.[0];
    } catch (e) {
        console.error(`Error searching ${title}:`, e.message);
        return null;
    }
}

async function run() {
    const results = [];
    for (const t of targets) {
        const data = await search(t.title);
        if (data) {
            results.push({
                title: data.title,
                author: data.author.split('(')[0].trim(),
                category: data.categoryName.split('>')[1] || "General",
                description: data.description || "No description",
                summary: data.description ? data.description.substring(0, 150) + "..." : "No summary",
                imageUrl: data.cover,
                purchaseLink: t.link, // Use the provided Coupang link
                isChoice: true
            });
        }
    }
    console.log(JSON.stringify(results, null, 2));
}

run();
