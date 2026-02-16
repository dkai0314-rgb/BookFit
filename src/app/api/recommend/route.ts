
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
        const enrichedBooks = await Promise.all(aiRecommendations.map(async (rec) => {
            const aladinData = await searchBookInAladin(rec.title);
            return {
                ...rec,
                imageUrl: aladinData?.cover || null,
                link: aladinData?.link || null,
                category: aladinData?.categoryName || "General",
                // If Aladin found a slightly different title/author, use ours or keep Aladin's?
                // Visual consistency implies using Aladin's if we show its cover.
                // But Gemini's reason is tied to its chosen title.
                // Let's rely on Aladin's title if found, as it matches the image.
                displayTitle: aladinData?.title || rec.title,
                displayAuthor: aladinData?.author || rec.author
            };
        }));

        return NextResponse.json(enrichedBooks);

    } catch (error) {
        console.error("Recommendation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
