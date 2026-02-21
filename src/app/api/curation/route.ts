
import { NextResponse } from 'next/server';
import { fetchCurationFromSheet } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic'; // Disable caching to see Sheet updates
export const runtime = 'nodejs'; // Ensure Node.js runtime for Google libraries

// GET /api/curation - Fetch curation from static JSON or fallback to Google Sheets
export async function GET() {
    try {
        const fs = require('fs');
        const path = require('path');
        const jsonPath = path.join(process.cwd(), 'public/data/bookfit-choice.json');

        if (fs.existsSync(jsonPath)) {
            const fileContent = fs.readFileSync(jsonPath, 'utf8');
            const data = JSON.parse(fileContent);
            return NextResponse.json([data]);
        }

        // Fallback to Google Sheets if JSON doesn't exist (e.g. first run)
        const curation = await fetchCurationFromSheet();
        if (!curation) {
            return NextResponse.json([]);
        }
        return NextResponse.json([curation]);
    } catch (error: any) {
        console.error('Failed to fetch curations:', error);
        return NextResponse.json({
            error: 'Failed to fetch curations',
            details: error.message
        }, { status: 500 });
    }
}

