
import { getBook } from '@/lib/firestore-models';
import { Info, BookOpen, ShoppingBag } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ShelfButton from '@/components/ShelfButton';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE_ORIGIN = 'https://bookfit.kr';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const book = await getBook(id);
    if (!book) return { title: '책을 찾을 수 없어요 | 북핏' };

    const title = `${book.title} - ${book.author} | 북핏`;
    const description = book.summary || book.recommendation || book.description?.slice(0, 140) || `${book.title}에 대한 북핏 큐레이션 정보`;
    const image = book.imageUrl?.replace('coversum', 'cover500').replace(/^http:/i, 'https:') || undefined;

    return {
        title,
        description,
        alternates: { canonical: `${SITE_ORIGIN}/books/${book.id}` },
        openGraph: {
            type: 'book',
            title,
            description,
            url: `${SITE_ORIGIN}/books/${book.id}`,
            siteName: 'BookFit',
            images: image ? [{ url: image }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [image] : undefined,
        },
    };
}

type Vendor = { name: string; href: string; primary?: boolean };

function buildVendorLinks(book: { title: string; author: string; purchaseLink: string | null }): Vendor[] {
    const q = encodeURIComponent(`${book.title} ${book.author}`);
    return [
        { name: '쿠팡', href: `https://www.coupang.com/np/search?q=${q}`, primary: true },
        { name: '알라딘', href: book.purchaseLink || `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&KeyWord=${q}` },
        { name: '예스24', href: `https://www.yes24.com/Product/Search?domain=BOOK&query=${q}` },
        { name: '교보문고', href: `https://search.kyobobook.co.kr/search?keyword=${q}&gbCode=TOT&target=total` },
    ];
}

export default async function BookDetailPage({ params }: Props) {
    const { id } = await params;
    const book = await getBook(id);

    if (!book) notFound();

    const vendors = buildVendorLinks(book);

    const bookJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: book.title,
        author: { '@type': 'Person', name: book.author },
        image: book.imageUrl?.replace('coversum', 'cover500').replace(/^http:/i, 'https:') || undefined,
        description: book.summary || book.recommendation || book.description?.slice(0, 280) || undefined,
        url: `${SITE_ORIGIN}/books/${book.id}`,
        genre: book.category,
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
            />
            {/* Detailed Page Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-primary/90 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold font-serif tracking-tight text-foreground hover:text-accent transition-colors">
                        BookFit
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto pt-32 px-6 flex flex-col md:flex-row gap-12 pb-20">
                {/* Left: Image */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="w-full aspect-[1/1.5] relative rounded-md overflow-hidden shadow-2xl border border-black/5 mb-6">
                        {book.imageUrl && (
                            <Image
                                src={book.imageUrl.replace("coversum", "cover500").replace(/^http:/i, "https:")}
                                alt={book.title}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                                unoptimized
                            />
                        )}
                    </div>

                </div>

                {/* Right: Content */}
                <div className="w-full md:w-2/3 space-y-8 text-foreground">
                    <div className="space-y-2 border-b border-border pb-6">
                        <div className="text-accent text-sm font-semibold tracking-wider uppercase mb-1">{book.category}</div>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight text-primary">{book.title}</h1>
                        <p className="text-xl text-muted-foreground font-medium">{book.author}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" /> 책 소개
                            </h3>
                            <p className="text-foreground/90 leading-relaxed font-medium">
                                {book.description}
                            </p>
                        </div>

                        {/* AI Recommendation */}
                        <div className="bg-secondary p-6 rounded-lg border border-accent/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-accent">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-accent mb-3 flex items-center gap-2">
                                ✨ BookFit 큐레이터의 추천사
                            </h3>
                            <div className="text-foreground/90 leading-relaxed whitespace-pre-line font-medium">
                                {book.recommendation || book.summary}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 space-y-3">
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                            <BookOpen className="w-5 h-5" /> 내 서재에 담기
                        </h3>
                        <ShelfButton bookId={book.id} />
                    </div>

                    <div className="pt-6 space-y-3">
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" /> 이 책을 구할 수 있는 곳
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {vendors.map((vendor) => (
                                <a
                                    key={vendor.name}
                                    href={vendor.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-center px-4 py-3 rounded-md border font-semibold text-sm transition-all ${
                                        vendor.primary
                                            ? 'bg-accent text-primary-foreground border-accent hover:bg-accent/90'
                                            : 'bg-background border-border text-foreground hover:bg-secondary'
                                    }`}
                                >
                                    {vendor.name}
                                </a>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                            <Info className="w-3 h-3 shrink-0 mt-0.5" />
                            구매처 링크는 정보 제공용입니다. 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받을 수 있습니다.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
