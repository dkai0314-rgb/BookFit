import { getCuration, getBooksByIds } from '@/lib/firestore-models';
import { notFound } from 'next/navigation';
import AdminCurationEditClient from './AdminCurationEditClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Props = { params: Promise<{ id: string }> };

export default async function AdminCurationEditPage({ params }: Props) {
    const { id } = await params;
    const c = await getCuration(id);
    if (!c) notFound();
    const books = await getBooksByIds(c.bookIds);

    return (
        <AdminCurationEditClient
            initial={{
                id: c.id,
                title: c.title,
                theme: c.theme,
                description: c.description,
                instaCaption: c.instaCaption || '',
                slug: c.slug || '',
                category: c.category || '',
                curatorNote: c.curatorNote || '',
                seoTitle: c.seoTitle || '',
                seoDesc: c.seoDesc || '',
                ogImage: c.ogImage || '',
                cardImageUrl: c.cardImageUrl || '',
                readingTime: c.readingTime ?? null,
                isFeatured: c.isFeatured,
                status: c.status,
                publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
                createdAt: c.createdAt.toISOString(),
                books: books.map((b) => ({
                    id: b.id,
                    title: b.title,
                    author: b.author,
                    imageUrl: b.imageUrl,
                    recommendation: b.recommendation,
                })),
            }}
        />
    );
}
