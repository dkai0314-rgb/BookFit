
import { NextResponse } from 'next/server';
import { getRecommendations, RecommendationRequest } from '@/lib/gemini';
import { searchBookInAladin } from '@/lib/aladin';

export async function POST(request: Request) {
    try {
        const body: RecommendationRequest = await request.json();

        // 1. Get AI Recommendations
        const aiRecommendations = await getRecommendations(body);

        if (!aiRecommendations || aiRecommendations.length === 0) {
            return NextResponse.json({ error: "AI failed to generate recommendations." }, { status: 500 });
        }

        // 2. Fetch Metadata from Aladin (Parallel)
        // 2. Fetch Metadata from Aladin (Parallel)
        const enrichedBooksPromises = aiRecommendations.map(async (rec) => {
            const aladinData = await searchBookInAladin(rec.title);

            // Verification Step: If Aladin returns null, this book does not exist or title is wrong.
            if (!aladinData) {
                console.warn(`Verification Failed: "${rec.title}" not found in Aladin.`);
                return null;
            }

            return {
                ...rec,
                thumbnail: aladinData.cover || null,
                imageUrl: aladinData.cover || null,
                link: aladinData.link || null,
                viewerUrl: aladinData.viewerUrl || null,
                category: aladinData.categoryName || "General",
                displayTitle: aladinData.title || rec.title,
                displayAuthor: aladinData.author || rec.author
            };
        });

        const enrichedBooksResults = await Promise.all(enrichedBooksPromises);

        // 3. Filter Verified Books & Limit to 3
        const validBooks = enrichedBooksResults.filter((book) => book !== null && book.thumbnail); // Must have thumbnail

        if (validBooks.length === 0) {
            // Fallback: If strict verification kills all books, what to do?
            // For now, return error to trigger retry or handle gracefully.
            return NextResponse.json({ error: "No verified books found matching your request." }, { status: 404 });
        }

        return NextResponse.json(validBooks.slice(0, 3));

    } catch (error) {
        console.error("Recommendation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
