
import axios from 'axios';

const TTB_KEY = process.env.ALADIN_API_KEY!;

export interface AladinBook {
    title: string;
    author: string;
    description: string;
    cover: string;
    link: string;
    categoryName: string;
}

export async function searchBookInAladin(title: string): Promise<AladinBook | null> {
    if (!title) return null;

    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
            params: {
                ttbkey: TTB_KEY,
                Query: title,
                QueryType: 'Title',
                MaxResults: 1,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            }
        });

        const items = response.data.item;
        if (!items || items.length === 0) {
            return null;
        }

        const bookData = items[0];
        // Clean author name "Author (Author)" -> "Author"
        const authorClean = bookData.author.split('(')[0].trim();

        return {
            title: bookData.title,
            author: authorClean,
            description: bookData.description,
            cover: bookData.cover,
            link: bookData.link,
            categoryName: bookData.categoryName
        };

    } catch (error) {
        console.error("Aladin Search Error:", error);
        return null;
    }
}

export async function getBestsellers(): Promise<AladinBook[]> {
    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemList.aspx', {
            params: {
                ttbkey: TTB_KEY,
                QueryType: 'Bestseller',
                MaxResults: 30,
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
