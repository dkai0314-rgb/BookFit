import { NextResponse } from 'next/server';
import { createCustomBook } from '@/lib/firestore-models';
import { requireAuthUser } from '@/lib/auth';

// POST /api/books/manual — 사용자가 직접 입력한 책을 그 사용자의 개인 책(users/{uid}/customBooks)으로 등록.
// 공용 books 컬렉션에는 넣지 않는다: 그곳은 로그인 없이 읽히는 목록·상세 페이지의 원천이다.
export async function POST(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

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

    const book = await createCustomBook(user.uid, { title, author });

    return NextResponse.json({ book });
}
