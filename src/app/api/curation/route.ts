
import { NextResponse } from 'next/server';
import { fetchCurationFromSheet } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic'; // Disable caching to see Sheet updates
export const runtime = 'nodejs'; // Ensure Node.js runtime for Google libraries

// GET /api/curation - Fetch curation from Google Sheets
export async function GET() {
    try {
        const curation = await fetchCurationFromSheet();

        if (!curation) {
            return NextResponse.json([]);
        }

        // Return as array (single item) to match previous API structure
        return NextResponse.json([curation]);
    } catch (error: any) {
        console.error('Failed to fetch curations:', error);
        return NextResponse.json({
            error: 'Failed to fetch curations',
            details: error.message
        }, { status: 500 });
    }
}

