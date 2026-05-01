import { prisma } from '@/lib/db';
import AdminCurationsClient from './AdminCurationsClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminCurationsPage() {
    const list = await prisma.curation.findMany({
        orderBy: [{ createdAt: 'desc' }],
        include: { books: { select: { id: true, title: true } } },
    });

    return <AdminCurationsClient initial={list.map(serializeCuration)} />;
}

type SerializedCuration = ReturnType<typeof serializeCuration>;
export type { SerializedCuration };

function serializeCuration(c: {
    id: string;
    title: string;
    theme: string;
    description: string;
    slug: string | null;
    category: string | null;
    status: string;
    isFeatured: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    books: { id: string; title: string }[];
}) {
    return {
        id: c.id,
        title: c.title,
        theme: c.theme,
        description: c.description,
        slug: c.slug,
        category: c.category,
        status: c.status,
        isFeatured: c.isFeatured,
        publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
        books: c.books,
    };
}
