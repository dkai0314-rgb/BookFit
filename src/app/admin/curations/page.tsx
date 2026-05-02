import { listCurations, getBooksByIds, type Curation } from '@/lib/firestore-models';
import AdminCurationsClient from './AdminCurationsClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminCurationsPage() {
    const list = await listCurations({ orderBy: [{ field: 'createdAt', dir: 'desc' }] });
    const allBookIds = Array.from(new Set(list.flatMap((c) => c.bookIds)));
    const allBooks = await getBooksByIds(allBookIds);
    const bookMap = new Map(allBooks.map((b) => [b.id, b]));
    const initial = list.map((c) => serializeCuration(c, bookMap));
    return <AdminCurationsClient initial={initial} />;
}

type SerializedCuration = ReturnType<typeof serializeCuration>;
export type { SerializedCuration };

function serializeCuration(
    c: Curation,
    bookMap: Map<string, { id: string; title: string }>,
) {
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
        books: c.bookIds.map((id) => bookMap.get(id)).filter((b): b is { id: string; title: string } => !!b),
    };
}
