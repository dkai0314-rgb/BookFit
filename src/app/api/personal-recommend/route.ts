import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthUser } from '@/lib/auth';
import {
    getPersonalRecommendations,
    MIN_BOOKS_FOR_PERSONAL_RECOMMEND,
} from '@/lib/personal-recommend';

export async function GET(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    const shelf = await prisma.userBookShelf.findMany({
        where: { userId: user.uid },
        include: { book: true },
        orderBy: { updatedAt: 'desc' },
    });

    if (shelf.length < MIN_BOOKS_FOR_PERSONAL_RECOMMEND) {
        return NextResponse.json({
            eligible: false,
            shelfCount: shelf.length,
            minRequired: MIN_BOOKS_FOR_PERSONAL_RECOMMEND,
            recommendations: [],
        });
    }

    const books = shelf.map((s) => ({
        bookId: s.bookId,
        title: s.book.title,
        author: s.book.author,
        category: s.book.category,
        status: s.status,
    }));

    const result = await getPersonalRecommendations(user.uid, books);

    return NextResponse.json({
        eligible: result.eligible,
        cached: result.cached,
        shelfCount: shelf.length,
        recommendations: result.recommendations,
    });
}
