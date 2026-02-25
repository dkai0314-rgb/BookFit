import { fetchCurationFromSheet } from '../src/lib/google-sheets';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function generateCurationJson() {
    console.log("Fetching curation data from Google Sheets...");
    try {
        const curation = await fetchCurationFromSheet();

        if (curation) {
            const jsonPath = path.join(process.cwd(), 'public/data/bookfit-choice.json');

            // Ensure directory exists
            const dir = path.dirname(jsonPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(jsonPath, JSON.stringify(curation, null, 2), 'utf8');
            console.log(`✅ Successfully updated BookFit Choice data at ${jsonPath}`);
            console.log(`Total books: ${curation.books.length}`);
        } else {
            console.error("❌ Failed to fetch curation data: null returned.");
        }
    } catch (error) {
        console.error("❌ Error generating curation JSON:", error);
        process.exit(1);
    }
}

generateCurationJson();
