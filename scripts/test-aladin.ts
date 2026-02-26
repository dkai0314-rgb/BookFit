import { searchBookInAladin } from '../src/lib/aladin';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    const titles = ['사피엔스', '포지셔닝', '마케팅 설계자'];
    for (const title of titles) {
        const book = await searchBookInAladin(title);
        console.log(`Title: ${title} -> Found: ${book ? book.title : 'NO MATCH'}, Image: ${book?.cover}`);
    }
}
test();
