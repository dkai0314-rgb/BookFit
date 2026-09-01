import { NextResponse } from 'next/server';
import {
    getBook,
    listHighlights,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    type HighlightPriority,
} from '@/lib/firestore-models';
import { requireAuthUser } from '@/lib/auth';

const ALLOWED_PRIORITY = new Set<HighlightPriority>(['P0', 'P1', 'P2']);

export async function GET(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    const url = new URL(request.url);
    const bookId = url.searchParams.get('bookId') ?? undefined;

    const highlights = await listHighlights(user.uid, bookId);
    return NextResponse.json({ highlights });
}

export async function POST(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    let body: {
        bookId?: string;
        quote?: string;
        note?: string | null;
        priority?: string | null;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    if (!body.bookId || !body.quote?.trim()) {
        return NextResponse.json(
            { error: 'bookId 와 quote(문장)가 필요합니다.' },
            { status: 400 },
        );
    }

    const book = await getBook(body.bookId);
    if (!book) {
        return NextResponse.json({ error: 'book not found' }, { status: 404 });
    }

    const priority =
        body.priority && ALLOWED_PRIORITY.has(body.priority as HighlightPriority)
            ? (body.priority as HighlightPriority)
            : null;

    const created = await createHighlight(user.uid, {
        bookId: body.bookId,
        quote: body.quote.trim(),
        note: body.note?.trim() || null,
        priority,
    });

    return NextResponse.json({ highlight: { ...created, book } });
}

export async function PATCH(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    let body: {
        id?: string;
        quote?: string;
        note?: string | null;
        priority?: string | null;
        isFavorite?: boolean;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    if (!body.id) {
        return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
    }

    const updated = await updateHighlight(user.uid, body.id, {
        ...(body.quote !== undefined ? { quote: body.quote.trim() } : {}),
        ...(body.note !== undefined ? { note: body.note?.trim() || null } : {}),
        ...(body.priority !== undefined
            ? {
                  priority:
                      body.priority && ALLOWED_PRIORITY.has(body.priority as HighlightPriority)
                          ? (body.priority as HighlightPriority)
                          : null,
              }
            : {}),
        ...(body.isFavorite !== undefined ? { isFavorite: body.isFavorite } : {}),
    });

    return NextResponse.json({ highlight: updated });
}

export async function DELETE(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'id query is required' }, { status: 400 });
    }

    try {
        await deleteHighlight(user.uid, id);
    } catch (error) {
        console.error('highlight delete failed', error);
        return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
