import { NextResponse } from 'next/server';
import { searchAladinBooks } from '@/lib/book-apis';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ error: '검색어(q) 파라미터가 필요합니다.' }, { status: 400 });
    }

    try {
        const books = await searchAladinBooks(q);

        return NextResponse.json({
            success: true,
            data: books
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('[API] /api/bookfit-letter/search error:', err);
        return NextResponse.json({ error: err.message || '도서 검색 중 서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
