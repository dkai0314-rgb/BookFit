
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/books?choice=true
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isChoice = searchParams.get('choice') === 'true';

    try {
        const books = await prisma.book.findMany({
            where: isChoice ? { isChoice: true } : {},
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(books);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}

// POST /api/books (Admin)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const book = await prisma.book.create({
            data: {
                title: body.title,
                author: body.author,
                category: body.category,
                description: body.description,
                summary: body.summary,
                imageUrl: body.imageUrl,
                purchaseLink: body.purchaseLink,
                isChoice: body.isChoice || false
            }
        });
        return NextResponse.json(book);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
    }
}
