import { getLetterWithBooks } from '@/lib/firestore-models';
import { notFound } from 'next/navigation';
import AdminLetterEditClient from './AdminLetterEditClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Props = { params: Promise<{ slug: string }> };

export default async function AdminLetterEditPage({ params }: Props) {
    const { slug } = await params;
    const letter = await getLetterWithBooks(decodeURIComponent(slug));
    if (!letter) notFound();

    return (
        <AdminLetterEditClient
            initial={{
                slug: letter.slug,
                title: letter.title,
                headlineTitle: letter.headlineTitle ?? '',
                metaTitle: letter.metaTitle ?? '',
                metaDescription: letter.metaDescription ?? '',
                ogImageUrl: letter.ogImageUrl ?? '',
                coverImageUrl: letter.coverImageUrl ?? '',
                kind: letter.kind,
                category: letter.category ?? '',
                curatorNote: letter.curatorNote ?? '',
                contentMarkdown: letter.contentMarkdown,
                isFeatured: letter.isFeatured,
                status: letter.status,
                readingTime: letter.readingTime ?? null,
                publishedAt: letter.publishedAt ? letter.publishedAt.toISOString() : null,
                createdAt: letter.createdAt.toISOString(),
                authors: letter.authors ?? '',
                publisher: letter.publisher ?? '',
                publishedDate: letter.publishedDate ?? '',
                isbn13: letter.isbn13 ?? '',
                bookIds: letter.bookIds,
                books: letter.books.map((b) => ({
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
