import axios from 'axios';

// 표준 책 메타데이터 모델 (어댑터 출력 결과)
export interface BookMeta {
    title: string;
    authors: string[];
    publisher: string;
    publishedDate: string;
    isbn13: string | null;
    categories: string[];
    coverImageUrl: string;
    sourceId: string; // Aladin's itemId
    sourceText: string; // Description, TOC, Publisher Review 결합본
    raw?: unknown;
}

const ALADIN_API_KEY = process.env.ALADIN_API_KEY || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = any;

/**
 * Aladin OpenAPI 검색 및 상세 정보 조합 어댑터
 */
export async function searchAladinBooks(query: string): Promise<BookMeta[]> {
    if (!ALADIN_API_KEY) {
        console.error('ALADIN_API_KEY is not configured');
        return [];
    }

    try {
        // 1. ItemSearch: 검색어로 책 리스트 조회
        const searchUrl = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_API_KEY}&Query=${encodeURIComponent(query)}&QueryType=Keyword&MaxResults=3&start=1&SearchTarget=Book&output=js&Version=20131101`;
        const searchRes = await axios.get(searchUrl);
        const items = searchRes.data.item;

        if (!items || !Array.isArray(items)) {
            return [];
        }

        const bookMetaPromises = items.map(async (item: AnyObject): Promise<BookMeta | null> => {
            const itemId = item.itemId;
            const isbn13 = item.isbn13 || null;

            // 2. ItemLookUp: 상세 정보 조회
            let sourceText = '';

            try {
                const lookupUrl = `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_API_KEY}&ItemId=${itemId}&ItemIdType=ItemId&output=js&Version=20131101&OptResult=Toc`;
                const lookupRes = await axios.get(lookupUrl);
                const detailItem = lookupRes.data.item && lookupRes.data.item[0];

                if (detailItem) {
                    const desc = detailItem.description || '';
                    const toc = detailItem.subInfo?.toc || '';
                    const pubReview = detailItem.subInfo?.publisherReview || '';

                    sourceText = [
                        desc ? `[책소개]\n${desc}` : '',
                        pubReview ? `[출판사 리뷰]\n${pubReview}` : '',
                        toc ? `[목차]\n${toc}` : ''
                    ].filter(Boolean).join('\n\n');
                }
            } catch (err) {
                console.error(`ItemLookUp failed for item ${itemId}`, err);
                sourceText = item.description || '';
            }

            return {
                title: item.title,
                authors: item.author ? item.author.split(',').map((a: string) => a.trim()) : [],
                publisher: item.publisher || '',
                publishedDate: item.pubDate || '',
                isbn13,
                categories: item.categoryName ? item.categoryName.split('>') : [],
                coverImageUrl: item.cover ? item.cover.replace('coversum', 'cover500').replace(/^http:/i, 'https:') : '',
                sourceId: String(itemId),
                sourceText: sourceText || item.description || '',
                raw: item
            };
        });

        const results = await Promise.all(bookMetaPromises);
        return results.filter((b): b is BookMeta => b !== null);

    } catch (error) {
        console.error('Aladin API search error:', error);
        return [];
    }
}
