import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShoppingBag, Info, ArrowLeft, BookOpen } from 'lucide-react';

type Props = { params: Promise<{ slug: string }> };

const SITE_ORIGIN = 'https://bookfit.kr';

async function getCuration(slug: string) {
    return prisma.curation.findUnique({
        where: { slug },
        include: { books: true },
    });
}

function isVisible(curation: { status: string | null } | null): boolean {
    if (!curation) return false;
    return curation.status === 'published';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const curation = await getCuration(slug);
    if (!isVisible(curation) || !curation) return { title: '큐레이션을 찾을 수 없어요 | 북핏' };

    const title = curation.seoTitle || `${curation.title} | 북핏`;
    const description = curation.seoDesc || curation.description;
    const ogImage =
        curation.ogImage || curation.cardImageUrl || curation.books[0]?.imageUrl || undefined;

    return {
        title,
        description,
        alternates: { canonical: `${SITE_ORIGIN}/curation/${curation.slug}` },
        openGraph: {
            type: 'article',
            title,
            description,
            url: `${SITE_ORIGIN}/curation/${curation.slug}`,
            siteName: 'BookFit',
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

function buildVendorLinks(book: { title: string; author: string }) {
    const q = encodeURIComponent(`${book.title} ${book.author}`);
    return [
        { name: '쿠팡', href: `https://www.coupang.com/np/search?q=${q}`, primary: true },
        { name: '알라딘', href: `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&KeyWord=${q}` },
        { name: '예스24', href: `https://www.yes24.com/Product/Search?domain=BOOK&query=${q}` },
        { name: '교보문고', href: `https://search.kyobobook.co.kr/search?keyword=${q}&gbCode=TOT&target=total` },
    ];
}

export default async function CurationDetailPage({ params }: Props) {
    const { slug } = await params;
    const curation = await getCuration(slug);
    if (!isVisible(curation) || !curation) notFound();

    const ogImage = curation.ogImage || curation.cardImageUrl || curation.books[0]?.imageUrl;
    const publishedDate = curation.publishedAt
        ? new Date(curation.publishedAt).toLocaleDateString('ko-KR')
        : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: curation.title,
        description: curation.description,
        url: `${SITE_ORIGIN}/curation/${curation.slug}`,
        numberOfItems: curation.books.length,
        itemListElement: curation.books.map((b, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
                '@type': 'Book',
                name: b.title,
                author: { '@type': 'Person', name: b.author },
                image: b.imageUrl || undefined,
                url: `${SITE_ORIGIN}/books/${b.id}`,
            },
        })),
    };

    return (
        <article className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 h-[64px] flex items-center bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                    <Link href="/curation" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">큐레이션 목록</span>
                    </Link>
                    <Link href="/" className="text-base font-bold tracking-tight">
                        BookFit
                    </Link>
                    <div className="w-32" />
                </div>
            </header>

            <main className="pt-28 pb-24 px-6 max-w-3xl mx-auto space-y-12">
                <section className="space-y-6 text-center">
                    {curation.category && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                            {curation.category}
                        </div>
                    )}
                    <h1 className="text-4xl md:text-5xl font-black font-serif leading-tight text-primary break-keep">
                        {curation.title}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line break-keep max-w-2xl mx-auto">
                        {curation.description}
                    </p>
                    {(publishedDate || curation.readingTime) && (
                        <div className="text-xs text-muted-foreground">
                            {publishedDate}
                            {publishedDate && curation.readingTime ? ' · ' : ''}
                            {curation.readingTime ? `약 ${curation.readingTime}분 읽음` : ''}
                        </div>
                    )}
                </section>

                {ogImage && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border shadow-md">
                        <Image src={ogImage} alt={curation.title} fill className="object-cover" unoptimized />
                    </div>
                )}

                {curation.curatorNote && (
                    <section className="bg-secondary/40 border border-border rounded-2xl p-8 space-y-3 shadow-sm">
                        <div className="text-xs font-bold uppercase tracking-widest text-accent">
                            큐레이터 노트
                        </div>
                        <p className="text-base leading-relaxed whitespace-pre-line break-keep text-foreground/90">
                            {curation.curatorNote}
                        </p>
                    </section>
                )}

                <section className="space-y-12">
                    <h2 className="text-2xl font-bold font-serif text-primary text-center">
                        이번 큐레이션의 책 {curation.books.length}권
                    </h2>
                    {curation.books.map((book, idx) => (
                        <article
                            key={book.id}
                            className="bg-background border border-border rounded-xl p-6 md:p-8 space-y-5 shadow-sm"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                <Link href={`/books/${book.id}`} className="md:w-40 shrink-0 self-start">
                                    <div className="aspect-[1/1.5] relative rounded-md overflow-hidden bg-muted shadow-md border border-border">
                                        {book.imageUrl ? (
                                            <Image
                                                src={book.imageUrl
                                                    .replace('coversum', 'cover500')
                                                    .replace(/^http:/i, 'https:')}
                                                alt={book.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <BookOpen className="w-8 h-8 opacity-30" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1 space-y-3">
                                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                        Book {idx + 1}
                                    </div>
                                    <Link href={`/books/${book.id}`} className="block group">
                                        <h3 className="text-2xl font-bold font-serif text-primary leading-tight group-hover:text-accent transition-colors break-keep">
                                            {book.title}
                                        </h3>
                                        <p className="text-base text-muted-foreground mt-1">{book.author}</p>
                                    </Link>
                                    <p className="text-foreground/90 leading-relaxed break-keep">
                                        {book.recommendation || book.description}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-border pt-5 space-y-3">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" /> 이 책을 구할 수 있는 곳
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {buildVendorLinks(book).map((v) => (
                                        <a
                                            key={v.name}
                                            href={v.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-center px-3 py-2 rounded-md border text-sm font-semibold transition-all ${
                                                v.primary
                                                    ? 'bg-accent text-primary-foreground border-accent hover:bg-accent/90'
                                                    : 'bg-background border-border text-foreground hover:bg-secondary'
                                            }`}
                                        >
                                            {v.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="pt-8 border-t border-border space-y-4 text-center">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <Info className="w-3 h-3" />
                        구매처 링크는 정보 제공용입니다. 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받을 수 있습니다.
                    </p>
                    <Link
                        href="/curation"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-secondary hover:bg-accent/5 hover:border-accent text-foreground font-medium transition-all"
                    >
                        다른 큐레이션 보기
                    </Link>
                </section>
            </main>
        </article>
    );
}
