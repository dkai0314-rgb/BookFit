import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthUser } from '@/lib/auth';

const ALLOWED_STATUS = new Set(['want', 'reading', 'done']);

export async function GET(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    const url = new URL(request.url);
    const bookId = url.searchParams.get('bookId');

    if (bookId) {
        const entry = await prisma.userBookShelf.findUnique({
            where: { userId_bookId: { userId: user.uid, bookId } },
            include: { book: true },
        });
        return NextResponse.json({ entry: entry ?? null });
    }

    const entries = await prisma.userBookShelf.findMany({
        where: { userId: user.uid },
        orderBy: { updatedAt: 'desc' },
        include: { book: true },
    });
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

    if (!body.bookId || !body.status || !ALLOWED_STATUS.has(body.status)) {
        return NextResponse.json(
            { error: 'bookId 와 유효한 status(want|reading|done)가 필요합니다.' },
            { status: 400 },
        );
    }

    const book = await prisma.book.findUnique({ where: { id: body.bookId } });
    if (!book) {
        return NextResponse.json({ error: 'book not found' }, { status: 404 });
    }

    const updated = await prisma.userBookShelf.upsert({
        where: { userId_bookId: { userId: user.uid, bookId: body.bookId } },
        update: {
            status: body.status,
            rating: body.rating ?? null,
            oneLiner: body.oneLiner ?? null,
        },
        create: {
            userId: user.uid,
            bookId: body.bookId,
            status: body.status,
            rating: body.rating ?? null,
            oneLiner: body.oneLiner ?? null,
        },
        include: { book: true },
    });

    return NextResponse.json({ entry: updated });
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
        await prisma.userBookShelf.delete({
            where: { userId_bookId: { userId: user.uid, bookId } },
        });
    } catch {
        return NextResponse.json({ error: '존재하지 않는 항목입니다.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
}
