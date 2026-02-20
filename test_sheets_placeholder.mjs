
import { fetchCurationFromSheet } from './src/lib/google-sheets';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function runTest() {
    console.log("--- Testing Google Sheets Integration ---");
    const curation = await fetchCurationFromSheet();

    if (curation) {
        console.log(`[SUCCESS] Fetched Curation: ${curation.title}`);
        console.log(`- Theme: ${curation.theme}`);
        console.log(`- Books Found: ${curation.books.length}`);
        curation.books.forEach(book => {
            console.log(`  * ${book.title} (Author: ${book.author})`);
            console.log(`    - Image: ${book.imageUrl ? 'Found' : 'Missing'}`);
            console.log(`    - 3D Viewer: ${book.viewerUrl ? 'Found' : 'Missing'}`);
        });
    } else {
        console.error("[FAILED] Could not fetch curation from sheet.");
    }
}

// Mocking aladin search to avoid import issues if ts-node is not setup
// We will rely on the real file but we need to run this with ts-node or compile it.
// Actually, since the project is Next.js (TypeScript), running a random .mjs file importing .ts files won't work easily without ts-node.
// Instead, let's create a route or just rely on the build check and manual verification via browser?
// "test_verification.mjs" worked because it only imported standard modules or fully valid JS.
// src/lib/google-sheets.ts is a TS file.
// 
// Plan B: Create a temporary route for testing or just rely on `npm run dev` and manual check?
// I'll try to run `npm run dev` and then curl the API endpoint.

console.log("Note: This script cannot run directly because it imports TypeScript files.");
console.log("Please verify by running the app and checking /api/curation");
