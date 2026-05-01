import { NextResponse } from 'next/server';
import { generateBookFitLetter } from '@/lib/anthropic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { book } = body;

        if (!book || !book.title) {
            return NextResponse.json({ error: '필수 도서 정보가 누락되었습니다.' }, { status: 400 });
        }

        const draftMarkdown = await generateBookFitLetter(book);

        return NextResponse.json({
            success: true,
            content: draftMarkdown
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('[API] /api/bookfit-letter/generate error:', err);
        return NextResponse.json({ error: err.message || '콘텐츠 생성 중 서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
