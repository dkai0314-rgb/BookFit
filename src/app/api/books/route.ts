import { NextResponse } from 'next/server';
import { listIsChoiceBooks, createBook } from '@/lib/firestore-models';
import { tryDb } from '@/lib/db';

// GET /api/books?choice=true
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isChoice = searchParams.get('choice') === 'true';

    try {
        if (isChoice) {
            const books = await listIsChoiceBooks(200);
            return NextResponse.json(books);
        }
        const db = tryDb();
        if (!db) return NextResponse.json([], { status: 200 });
        const snap = await db.collection('books').orderBy('createdAt', 'desc').limit(200).get();
        const books = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return NextResponse.json(books);
    } catch (error) {
        const err = error as Error;
        console.error('books query error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch books', details: err.message },
            { status: 500 },
        );
    }
}

// POST /api/books (Admin)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const book = await createBook({
            title: body.title,
            author: body.author,
            category: body.category,
            description: body.description,
            imageUrl: body.imageUrl ?? null,
            purchaseLink: body.purchaseLink ?? null,
            recommendation: body.recommendation ?? null,
        });
        return NextResponse.json(book);
    } catch (error) {
        console.error('book create error', error);
        return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
    }
}
