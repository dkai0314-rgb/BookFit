
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

async function aladinSearch(query: string, queryType: 'Title' | 'Keyword'): Promise<AladinBook | null> {
    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
            params: {
                ttbkey: TTB_KEY,
                Query: query,
                QueryType: queryType,
                MaxResults: 3,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            }
        });

        const items = response.data.item;
        if (!items || items.length === 0) return null;

        return parseAladinItem(items[0]);
    } catch (error) {
        console.error(`Aladin ${queryType} Search Error:`, error);
        return null;
    }
}

export async function searchBookInAladin(title: string, author?: string): Promise<AladinBook | null> {
    if (!title) return null;

    // 1차: 제목으로 검색
    const byTitle = await aladinSearch(title, 'Title');
    if (byTitle) return byTitle;

    // 2차 폴백: 제목 + 저자로 키워드 검색
    const keyword = author ? `${title} ${author}` : title;
    return await aladinSearch(keyword, 'Keyword');
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
