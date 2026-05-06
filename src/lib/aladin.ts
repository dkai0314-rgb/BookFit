
import axios from 'axios';

const TTB_KEY = process.env.ALADIN_API_KEY!;

export interface AladinBook {
    title: string;
    author: string;
    description: string;
    cover: string;
    link: string;
    categoryName: string;
    viewerUrl?: string;
}

function parseAladinItem(bookData: any): AladinBook { // eslint-disable-line @typescript-eslint/no-explicit-any
    const authorClean = bookData.author.split('(')[0].trim();

    let itemId = bookData.itemId;
    if (!itemId && bookData.link) {
        const match = bookData.link.match(/ItemId=(\d+)/);
        if (match) {
            itemId = match[1];
        }
    }

    const coverUrl = bookData.cover ? bookData.cover.replace('coversum', 'cover500').replace(/^http:/i, 'https:') : "";
    const viewerUrl = itemId ? `https://www.aladin.co.kr/shop/book/wletslookViewer.aspx?ItemId=${itemId}` : undefined;

    return {
        title: bookData.title,
        author: authorClean,
        description: bookData.description,
        cover: coverUrl,
        link: bookData.link,
        categoryName: bookData.categoryName,
        viewerUrl: viewerUrl
    };
}

async function aladinSearch(
    query: string,
    queryType: 'Title' | 'Keyword',
    maxResults = 5,
): Promise<AladinBook[]> {
    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
            params: {
                ttbkey: TTB_KEY,
                Query: query,
                QueryType: queryType,
                MaxResults: maxResults,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            }
        });

        const items = response.data.item;
        if (!items || items.length === 0) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return items.map((it: any) => parseAladinItem(it));
    } catch (error) {
        console.error(`Aladin ${queryType} Search Error for "${query}":`, error);
        return [];
    }
}

/** 제목에서 부제·시리즈·괄호·구두점 제거하여 매칭 정확도 향상. */
function normalizeTitle(t: string): string {
    return t
        .replace(/\([^)]*\)/g, '')          // (...) 괄호 안 통째 제거
        .replace(/\[[^\]]*\]/g, '')         // [...] 대괄호 제거
        .replace(/[:：·]/g, ' ')            // 콜론·중점 → 공백
        .replace(/\s+/g, ' ')
        .trim();
}

/** 두 제목이 비슷한지 — 관대한 매칭(완전일치/부분포함/단어 절반 이상 공유). */
function titleMatches(a: string, b: string): boolean {
    const na = normalizeTitle(a).toLowerCase();
    const nb = normalizeTitle(b).toLowerCase();
    if (!na || !nb) return false;
    if (na === nb) return true;

    // 한쪽이 다른 쪽을 포함 (짧은 쪽이 3자 이상)
    if (na.length >= 3 && nb.includes(na)) return true;
    if (nb.length >= 3 && na.includes(nb)) return true;

    // 단어 단위 매칭: 짧은 제목 기준 절반 이상의 단어가 공통이면 OK
    const wa = na.split(/\s+/).filter((w) => w.length >= 2);
    const wb = nb.split(/\s+/).filter((w) => w.length >= 2);
    if (wa.length === 0 || wb.length === 0) return false;
    const shared = wa.filter((w) => wb.includes(w)).length;
    const minLen = Math.min(wa.length, wb.length);
    if (minLen >= 2 && shared / minLen >= 0.5) return true;

    return false;
}

/**
 * 알라딘 검색: 폭넓고 관대한 매칭.
 *
 * 정책: AI가 추천한 제목/저자가 알라딘에서 비슷하기만 하면 검색 결과를 채택.
 * 사용자에게 책 풀을 풍성하게 보여주는 것이 우선이고, 큐레이터 reason이
 * 다리 역할을 하므로 매칭은 후하게.
 *
 * 단계:
 *  1) 정확한 Title 검색 — 첫 결과가 비슷하면 채택, 아니면 첫 결과 그대로 채택
 *  2) 정규화된 Title 검색
 *  3) 제목 + 저자 Keyword 검색
 *  4) 정규화 제목 + 저자 Keyword 검색
 *  5) 제목 단독 Keyword 검색 (마지막 보루, 첫 결과 채택)
 */
export async function searchBookInAladin(title: string, author?: string): Promise<AladinBook | null> {
    if (!title) return null;

    const candidates: { query: string; type: 'Title' | 'Keyword' }[] = [
        { query: title, type: 'Title' },
        { query: normalizeTitle(title), type: 'Title' },
        { query: author ? `${title} ${author}` : title, type: 'Keyword' },
        { query: author ? `${normalizeTitle(title)} ${author}` : normalizeTitle(title), type: 'Keyword' },
    ];

    const seen = new Set<string>();
    for (const c of candidates) {
        const key = `${c.type}:${c.query}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const results = await aladinSearch(c.query, c.type, 5);
        if (results.length === 0) continue;

        // 1순위: 제목이 충분히 비슷한 결과
        const matched = results.find((r) => titleMatches(r.title, title));
        if (matched) return matched;

        // 모든 모드에서 첫 결과 채택 허용 — 알라딘이 결과를 줬다면 관련 분야 도서로 간주
        return results[0];
    }

    // 모두 실패 → 마지막 보루: 제목 단독 키워드 검색 첫 결과
    const last = await aladinSearch(title, 'Keyword', 1);
    return last[0] ?? null;
}

export async function getBestsellers(categoryId: number = 0): Promise<AladinBook[]> {
    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemList.aspx', {
            params: {
                ttbkey: TTB_KEY,
                QueryType: 'Bestseller',
                MaxResults: 10,
                CategoryId: categoryId,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            }
        });

        const items = response.data.item;
        if (!items || items.length === 0) {
            return [];
        }

        return items.map((book: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            title: book.title,
            author: book.author.split('(')[0].trim(),
            description: book.description,
            cover: book.cover,
            link: book.link,
            categoryName: book.categoryName
        }));

    } catch (error) {
        console.error("Aladin Bestseller Error:", error);
        return [];
    }
}
