import { NextResponse } from 'next/server';
import { createBook } from '@/lib/firestore-models';
import { requireAuthUser } from '@/lib/auth';

// POST /api/books/manual — 사용자가 직접 입력한 책(알라딘 미검증)을 books 컬렉션에 최소 정보로 등록.
// 인증만 요구하고 별도 소유자 표시는 두지 않는다 — books는 전역 카탈로그이며, 여기 등록되는
// 항목은 큐레이션 대상이 아니므로(isChoice: false) 추천·베스트셀러 등 다른 화면에는 노출되지 않는다.
export async function POST(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;

    let body: { title?: string; author?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    const title = body.title?.trim();
    const author = body.author?.trim();
    if (!title || !author) {
        return NextResponse.json({ error: '책 제목과 저자가 필요합니다.' }, { status: 400 });
    }

    const book = await createBook({
        title,
        author,
        category: '직접 추가',
        description: '',
        imageUrl: null,
        purchaseLink: null,
        recommendation: null,
    });

    return NextResponse.json({ book });
}
