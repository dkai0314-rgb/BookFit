import Link from 'next/link';
import { getLetterWithBooks, type LetterWithBooks } from '@/lib/firestore-models';
import { notFound } from 'next/navigation';
import AdminLetterEditClient from './AdminLetterEditClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Props = { params: Promise<{ slug: string }> };

export default async function AdminLetterEditPage({ params }: Props) {
    const { slug } = await params;
    let letter: LetterWithBooks | null = null;
    try {
        letter = await getLetterWithBooks(decodeURIComponent(slug));
    } catch (error) {
        const err = error as Error;
        console.error('admin/letters/[slug] query failed', err);
        return (
            <div className="p-8 max-w-2xl mx-auto space-y-4 font-sans text-gray-900">
                <Link href="/admin/letters" className="text-sm text-gray-500 hover:underline">
                    ← 레터 목록
                </Link>
                <h1 className="text-2xl font-bold text-red-600">Firestore 연결 실패</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm font-mono text-red-900 break-all">
                    {err.message || 'unknown error'}
                </div>
                <p className="text-sm text-gray-600">
                    /admin/letters 메인 화면에서 점검 단계를 확인해주세요.
                </p>
            </div>
        );
    }
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
                hasStructuredContent: !!letter.structuredContent,
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
