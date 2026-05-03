import {
    listLetters,
    type LetterKind,
} from '@/lib/firestore-models';
import AdminLettersClient from './AdminLettersClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminLettersPage() {
    const list = await listLetters({
        orderBy: [
            { field: 'isFeatured', dir: 'desc' },
            { field: 'createdAt', dir: 'desc' },
        ],
    });

    return (
        <AdminLettersClient
            initial={list.map((l) => ({
                id: l.id,
                slug: l.slug,
                title: l.title,
                headlineTitle: l.headlineTitle,
                kind: l.kind as LetterKind,
                category: l.category,
                status: l.status,
                isFeatured: l.isFeatured,
                bookCount: l.bookIds.length,
                publishedAt: l.publishedAt ? l.publishedAt.toISOString() : null,
                createdAt: l.createdAt.toISOString(),
            }))}
        />
    );
}

export type SerializedLetterRow = {
    id: string;
    slug: string;
    title: string;
    headlineTitle: string | null;
    kind: LetterKind;
    category: string | null;
    status: string;
    isFeatured: boolean;
    bookCount: number;
    publishedAt: string | null;
    createdAt: string;
};
