
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const TTB_KEY = process.env.ALADIN_API_KEY;

async function testAladinSearch(query) {
    if (!TTB_KEY) {
        console.error("ALADIN_API_KEY is missing in .env");
        return;
    }

    console.log(`Searching for: ${query}`);
    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
            params: {
                ttbkey: TTB_KEY,
                Query: query,
                QueryType: 'Title',
                MaxResults: 1,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            }
        });

        const items = response.data.item;
        if (items && items.length > 0) {
            const book = items[0];
            console.log("--- Book Found ---");
            console.log(`Title: ${book.title}`);
            console.log(`Cover URL: ${book.cover}`);
            console.log(`Link: ${book.link}`);
            console.log(`ISBN: ${book.isbn}`);
            console.log(`ItemId: ${book.itemId}`); // Note: itemId might not be in the TTB response directly, usually in 'link'
        } else {
            console.log("No items found.");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testAladinSearch('린 분석');
