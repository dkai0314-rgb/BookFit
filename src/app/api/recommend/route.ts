
import { NextResponse } from 'next/server';
import { getRecommendations, RecommendationRequest } from '@/lib/anthropic';
import { searchBookInAladin } from '@/lib/aladin';
import { getCoupangLink } from '@/lib/coupang';

export async function POST(request: Request) {
    try {
        const body: RecommendationRequest = await request.json();

        // 1. Get AI Recommendations
        const aiRecommendations = await getRecommendations(body);
        console.log(`[recommend] AI returned ${aiRecommendations?.length ?? 0} books`);

        if (!aiRecommendations || aiRecommendations.length === 0) {
            return NextResponse.json(
                { error: "AI failed to generate recommendations." },
                { status: 500 },
            );
        }

        // 2. Fetch Metadata from Aladin (Parallel) — 견고한 매칭 + 자세한 로깅
        const enrichedBooksPromises = aiRecommendations.map(async (rec) => {
            const aladinData = await searchBookInAladin(rec.title, rec.author);

            if (!aladinData) {
                console.warn(`[recommend] Aladin miss: "${rec.title}" by ${rec.author}`);
                return null;
            }

            const verifiedTitle = aladinData.title || rec.title;
            const coupangSearchFallback = `https://www.coupang.com/np/search?q=${encodeURIComponent(verifiedTitle)}`;
            const coupangLink = (await getCoupangLink(verifiedTitle)) || coupangSearchFallback;

            return {
                ...rec,
                thumbnail: aladinData.cover || null,
                imageUrl: aladinData.cover || null,
                link: aladinData.link || null,
                viewerUrl: aladinData.viewerUrl || null,
                category: aladinData.categoryName || "General",
                displayTitle: aladinData.title || rec.title,
                displayAuthor: aladinData.author || rec.author,
                coupangLink,
            };
        });

        const enrichedBooksResults = await Promise.all(enrichedBooksPromises);
        const validBooks = enrichedBooksResults.filter((book) => book !== null);
        console.log(
            `[recommend] Aladin verified ${validBooks.length}/${aiRecommendations.length} books`,
        );

        // 3. 검증 0권: AI가 추천한 제목 그대로라도 노출 (쿠팡 검색 링크는 만들어줌)
        //    완전 빈 페이지보다 유저에게 단서를 주는 편이 낫다.
        if (validBooks.length === 0) {
            console.warn('[recommend] All Aladin verifications failed → returning AI raw output as fallback');
            const fallbackBooks = await Promise.all(
                aiRecommendations.slice(0, 5).map(async (rec) => {
                    const coupangLink =
                        (await getCoupangLink(rec.title)) ||
                        `https://www.coupang.com/np/search?q=${encodeURIComponent(`${rec.title} ${rec.author}`)}`;
                    return {
                        ...rec,
                        thumbnail: null,
                        imageUrl: null,
                        link: null,
                        viewerUrl: null,
                        category: 'General',
                        displayTitle: rec.title,
                        displayAuthor: rec.author,
                        coupangLink,
                    };
                }),
            );
            return NextResponse.json(fallbackBooks);
        }

        return NextResponse.json(validBooks.slice(0, 5));
    } catch (error) {
        console.error("Recommendation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
