
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const TTB_KEY = process.env.ALADIN_API_KEY;

async function searchBookInAladin(title) {
    if (!title) return null;
    if (!TTB_KEY) {
        console.error("ALADIN_API_KEY missing");
        return null;
    }

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
            console.log(`[VERIFICATION FAILED] '${title}' not found.`);
            return null;
        }

        const bookData = items[0];
        console.log(`[VERIFIED] '${title}' -> Found: '${bookData.title}'`);
        return bookData;

    } catch (error) {
        console.error("Aladin Search Error:", error.message);
        return null;
    }
}

async function runTest() {
    console.log("--- Testing Verification Logic ---");
    // Test 1: Real book
    await searchBookInAladin("린 분석");

    // Test 2: The problematic book
    await searchBookInAladin("철학은 어떻게 삶의 질문에 답하는가");

    // Test 3: Completely fake book
    await searchBookInAladin("이 세상에 절대로 없을법한 아주 긴 제목의 이상한 책 12345");
}

runTest();
