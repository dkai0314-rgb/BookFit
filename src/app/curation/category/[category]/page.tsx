import { listCurations, getBooksByIds } from '@/lib/firestore-models';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE_ORIGIN = 'https://bookfit.kr';

type Props = { params: Promise<{ category: string }> };

async function getCurations(category: string) {
    const list = await listCurations({
        status: 'published',
        category,
        requireSlug: true,
        orderBy: [
            { field: 'isFeatured', dir: 'desc' },
            { field: 'publishedAt', dir: 'desc' },
            { field: 'createdAt', dir: 'desc' },
        ],
    });
    const ids = Array.from(new Set(list.map((c) => c.bookIds[0]).filter((id): id is string => !!id)));
    const books = await getBooksByIds(ids);
    const bookMap = new Map(books.map((b) => [b.id, b]));
    return list.map((c) => ({
        ...c,
        firstBook: c.bookIds[0] ? bookMap.get(c.bookIds[0]) ?? null : null,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const decoded = decodeURIComponent(category);
    return {
        title: `${decoded} 큐레이션 모음 | 북핏`,
        description: `'${decoded}' 카테고리에 묶인 북핏의 큐레이션 모음입니다.`,
        alternates: {
            canonical: `${SITE_ORIGIN}/curation/category/${encodeURIComponent(decoded)}`,
        },
    };
}

export default async function CurationCategoryPage({ params }: Props) {
    const { category } = await params;
    const decoded = decodeURIComponent(category);
    const curations = await getCurations(decoded);

    if (curations.length === 0) notFound();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 h-[64px] flex items-center bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <Link
                        href="/curation"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">큐레이션 목록</span>
                    </Link>
                    <Link href="/" className="text-base font-bold tracking-tight">
                        BookFit
                    </Link>
                    <div className="w-32" />
                </div>
            </header>

            <main className="pt-28 pb-24 px-6 max-w-6xl mx-auto space-y-12">
                <section className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                        Category
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black font-serif leading-tight text-primary break-keep">
                        {decoded}
                    </h1>
                    <p className="text-base text-muted-foreground">
                        이 카테고리로 분류된 큐레이션 {curations.length}편
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {curations.map((c) => {
                        const cover = c.ogImage || c.cardImageUrl || c.firstBook?.imageUrl;
                        const href = c.slug ? `/curation/${c.slug}` : '#';
                        return (
                            <Link
                                key={c.id}
                                href={href}
                                className="group block bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-accent transition-all"
                            >
                                <div className="relative aspect-[16/9] w-full bg-muted">
                                    {cover ? (
                                        <Image
                                            src={cover.replace('coversum', 'cover500').replace(/^http:/i, 'https:')}
                                            alt={c.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 space-y-2">
                                    <h3 className="text-lg font-bold font-serif text-primary leading-tight group-hover:text-accent transition-colors break-keep line-clamp-2">
                                        {c.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 break-keep">
                                        {c.description}
                                    </p>
                                    <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
                                        <span>
                                            {c.publishedAt
                                                ? new Date(c.publishedAt).toLocaleDateString('ko-KR')
                                                : ''}
                                        </span>
                                        {c.readingTime ? <span>약 {c.readingTime}분</span> : null}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </section>
            </main>
        </div>
    );
}
