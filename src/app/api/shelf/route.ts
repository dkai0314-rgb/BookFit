import { NextResponse } from 'next/server';
import {
    getBook,
    getShelfEntry,
    listShelfEntries,
    upsertShelfEntry,
    deleteShelfEntry,
    type ShelfStatus,
} from '@/lib/firestore-models';
import { requireAuthUser } from '@/lib/auth';

const ALLOWED_STATUS = new Set<ShelfStatus>(['want', 'reading', 'done']);

export async function GET(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    const url = new URL(request.url);
    const bookId = url.searchParams.get('bookId');

    if (bookId) {
        const entry = await getShelfEntry(user.uid, bookId);
        if (!entry) return NextResponse.json({ entry: null });
        const book = await getBook(bookId);
        return NextResponse.json({ entry: { ...entry, book } });
    }

    const entries = await listShelfEntries(user.uid);
    return NextResponse.json({ entries });
}

export async function POST(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    let body: {
        bookId?: string;
        status?: string;
        rating?: number | null;
        oneLiner?: string | null;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    if (!body.bookId || !body.status || !ALLOWED_STATUS.has(body.status as ShelfStatus)) {
        return NextResponse.json(
            { error: 'bookId 와 유효한 status(want|reading|done)가 필요합니다.' },
            { status: 400 },
        );
    }

    const book = await getBook(body.bookId);
    if (!book) {
        return NextResponse.json({ error: 'book not found' }, { status: 404 });
    }

    const updated = await upsertShelfEntry(user.uid, body.bookId, {
        status: body.status as ShelfStatus,
        rating: body.rating ?? null,
        oneLiner: body.oneLiner ?? null,
    });

    return NextResponse.json({ entry: { ...updated, book } });
}

export async function DELETE(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    const url = new URL(request.url);
    const bookId = url.searchParams.get('bookId');
    if (!bookId) {
        return NextResponse.json({ error: 'bookId query is required' }, { status: 400 });
    }

    try {
        await deleteShelfEntry(user.uid, bookId);
    } catch (error) {
        console.error('shelf delete failed', error);
        return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
