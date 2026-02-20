
import { NextResponse } from 'next/server';
import { fetchCurationFromSheet } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic'; // Disable caching to see Sheet updates
export const runtime = 'nodejs'; // Ensure Node.js runtime for Google libraries

// GET /api/curation - Fetch curation from Google Sheets
export async function GET() {
    try {
        console.log("Attempting to fetch curation...");
        const curation = await fetchCurationFromSheet();

        if (!curation) {
            console.error("Fetch returned null");
            // Return debug info if failed (Temporary for debugging)
            return NextResponse.json({
                error: 'Fetch failed',
                debug: {
                    hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
                    hasSheetId: !!process.env.GOOGLE_SHEET_ID,
                    keyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
                }
            }, { status: 500 });
        }

        // Return as array (single item) to match previous API structure
        return NextResponse.json([curation]);
    } catch (error: any) {
        console.error('Failed to fetch curations:', error);
        return NextResponse.json({
            error: 'Failed to fetch curations',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

