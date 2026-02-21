import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const ALADIN_API_KEY = process.env.ALADIN_API_KEY;

if (!SHEET_ID) {
    console.error('❌ GOOGLE_SHEET_ID is missing');
    process.exit(1);
}

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/bookfit-choice.json');

// Ensure directory exists
const dir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

async function searchBookInAladin(title) {
    if (!ALADIN_API_KEY) return null;
    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
            params: {
                ttbkey: ALADIN_API_KEY,
                Query: title,
                QueryType: 'Title',
                MaxResults: 1,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            },
            timeout: 5000
        });
        return response.data.item?.[0] || null;
    } catch (e) {
        console.warn(`⚠️ Aladin search failed for "${title}":`, e.message);
        return null;
    }
}

function parseCSV(csvText) {
    const result = [];
    let row = [];
    let cur = '';
    let inQuote = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"') {
            if (inQuote && nextChar === '"') {
                cur += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            row.push(cur.trim());
            cur = '';
        } else if ((char === '\r' || char === '\n') && !inQuote) {
            if (char === '\r' && nextChar === '\n') i++;
            row.push(cur.trim());
            if (row.length > 1 || row[0] !== '') {
                result.push(row);
            }
            row = [];
            cur = '';
        } else {
            cur += char;
        }
    }
    if (cur || row.length > 0) {
        row.push(cur.trim());
        result.push(row);
    }
    return result;
}

async function sync() {
    console.log('🚀 Starting BookFit Choice sync...');
    try {
        const response = await axios.get(CSV_URL);
        const data = parseCSV(response.data);

        // Metadata extraction
        // Row 1: 대카테고리,책 제목,저자,한줄 요약,쿠팡링크 (Header)
        // Row 2-4: Metadata usually

        // Based on debug-csv output, the header is index 0.
        // Let's check where the actual data starts.
        // Usually Row 6 (index 5) is the first book.

        const theme = data[0]?.[1] || ''; // Placeholder or actual theme
        const title = "BookFit Choice";
        const description = "이번 달, 북핏의 큐레이터들이 선정한 깊이 있는 사유의 조각들입니다.";

        console.log(`📊 Title: ${title}`);

        const books = [];
        let lastCategory = "";

        // Row 6 is where "자기계발,아주 작은 습관의 힘..." starts (based on debug output)
        // In the debug output, there are 4 empty rows before Row 6.
        // Header(0), empty(1), empty(2), empty(3), empty(4), Data(5)
        for (let i = 5; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 2) continue;

            const category = row[0] || lastCategory;
            if (row[0]) lastCategory = row[0];

            const bookTitle = row[1];
            if (!bookTitle || bookTitle === '책 제목') continue;

            const author = row[2] || '';
            const recommendation = (row[3] || '').replace(/\r?\n/g, ' '); // Clean newlines
            const coupangLink = row[4] || '';

            console.log(`🔍 Processing: ${bookTitle}`);

            // Enrich with Aladin
            const aladinData = await searchBookInAladin(bookTitle);

            books.push({
                id: `choice-${i}`,
                title: aladinData?.title || bookTitle,
                author: aladinData?.author || author,
                category: category,
                recommendation: recommendation,
                coupangLink: coupangLink,
                imageUrl: aladinData?.cover || null,
                viewerUrl: aladinData?.viewerUrl || null
            });
        }

        if (books.length === 0) {
            throw new Error('No books found in CSV');
        }

        const choiceData = {
            id: SHEET_ID,
            theme,
            title,
            description,
            books,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(choiceData, null, 2));
        console.log('✅ Sync complete! Saved to:', OUTPUT_PATH);

    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        process.exit(1);
    }
}

sync();
