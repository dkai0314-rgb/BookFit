import {
    getLetterWithBooks,
    type LetterWithBooks,
} from '@/lib/firestore-models';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { ShoppingBag, Info, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE_ORIGIN = 'https://bookfit.kr';

interface Props {
    params: Promise<{ slug: string }>;
}

const KIND_LABELS = {
    weekly: '이주의 한 권',
    monthly_pick: '이달의 픽',
    special: '스페셜',
} as const;

function isPublished(status: string): boolean {
    return status === 'PUBLISHED' || status === 'published';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const letter = await getLetterWithBooks(slug);

    if (!letter || !isPublished(letter.status)) {
        return { title: '레터를 찾을 수 없어요 | 북핏' };
    }

    const title = letter.metaTitle || letter.title;
    const description =
        letter.metaDescription || letter.headlineTitle || letter.title;
    const ogImage =
        letter.ogImageUrl ||
        letter.coverImageUrl ||
        letter.books[0]?.imageUrl ||
        undefined;

    return {
        title,
        description,
        alternates: { canonical: `${SITE_ORIGIN}/bookfit-letter/${letter.slug}` },
        openGraph: {
            type: 'article',
            title,
            description,
            url: `${SITE_ORIGIN}/bookfit-letter/${letter.slug}`,
            siteName: 'BookFit',
            images: ogImage ? [{ url: ogImage }] : undefined,
            publishedTime: letter.publishedAt?.toISOString(),
            modifiedTime: letter.updatedAt.toISOString(),
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

export default async function LetterDetailPage({ params }: Props) {
    const { slug } = await params;
    const letter = await getLetterWithBooks(slug);

    if (!letter || !isPublished(letter.status)) notFound();

    let displayContent = letter.contentMarkdown;
    displayContent = displayContent.replace(/<!--META_INFO_START-->[\s\S]*?<!--META_INFO_END-->/g, '');

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: letter.headlineTitle || letter.title,
        description: letter.metaDescription || undefined,
        image:
            letter.ogImageUrl ||
            letter.coverImageUrl ||
            letter.books[0]?.imageUrl ||
            undefined,
        datePublished: letter.publishedAt?.toISOString() || letter.createdAt.toISOString(),
        dateModified: letter.updatedAt.toISOString(),
        author: { '@type': 'Organization', name: 'BookFit' },
        publisher: {
            '@type': 'Organization',
            name: 'BookFit',
            logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo-square.png` },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_ORIGIN}/bookfit-letter/${letter.slug}`,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
            <Header />
            <article className="max-w-3xl mx-auto p-6 md:p-10 font-sans mt-32 bg-white shadow-sm rounded-xl mb-20">
                <LetterHeader letter={letter} />

                {letter.curatorNote && (
                    <section className="bg-secondary/30 border border-border rounded-2xl p-6 md:p-8 mb-10 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-widest text-accent">
                            큐레이터 노트
                        </div>
                        <p className="text-base leading-relaxed whitespace-pre-line break-keep text-foreground/90">
                            {letter.curatorNote}
                        </p>
                    </section>
                )}

                <div className="prose prose-lg prose-primary max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-slate-800
          prose-h3:text-xl prose-h3:text-slate-700
          prose-a:text-accent hover:prose-a:text-accent/80
          prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-gray-50 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-slate-800 prose-blockquote:rounded-r-lg
          prose-img:rounded-xl prose-img:shadow-md
          prose-ul:list-disc prose-ol:list-decimal">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ ...props }) => {
                                const linkText = String(props.children);
                                const isCta =
                                    linkText.includes('이 책 확인하고') ||
                                    linkText.includes('적용해보기');
                                if (isCta) {
                                    return (
                                        <a
                                            {...props}
                                            className="not-prose block w-full sm:w-10/12 md:w-8/12 mx-auto my-12 bg-accent text-primary-foreground text-center font-bold text-lg md:text-xl py-5 px-6 rounded-2xl hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {props.children}
                                        </a>
                                    );
                                }
                                return <a {...props} target="_blank" rel="noopener noreferrer" />;
                            },
                        }}
                    >
                        {displayContent}
                    </ReactMarkdown>
                </div>

                {letter.books.length > 0 && (
                    <section className="mt-16 space-y-8 not-prose border-t border-border pt-12">
                        <h2 className="text-2xl font-bold font-serif text-primary text-center">
                            {letter.kind === 'weekly' ? '이번 회차의 책' : `이번 회차의 책 ${letter.books.length}권`}
                        </h2>
                        <div className="space-y-8">
                            {letter.books.map((book, idx) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    index={idx}
                                    showIndex={letter.books.length > 1}
                                />
                            ))}
                        </div>

                        <p className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed pt-4 border-t border-border">
                            <Info className="w-3 h-3 shrink-0 mt-0.5" />
                            구매처 링크는 정보 제공용입니다. 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받을 수 있습니다.
                        </p>
                    </section>
                )}

                <div className="mt-16 text-center pt-8 border-t border-border">
                    <Link
                        href="/bookfit-letter"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-secondary hover:bg-accent/5 hover:border-accent text-foreground font-medium transition-all"
                    >
                        다른 레터 보기
                    </Link>
                </div>
            </article>
        </>
    );
}

function LetterHeader({ letter }: { letter: LetterWithBooks }) {
    const dateStr = new Date(
        letter.publishedAt || letter.createdAt,
    ).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <header className="mb-10 text-center border-b pb-8 space-y-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                    {KIND_LABELS[letter.kind]}
                </span>
                {letter.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground">
                        {letter.category}
                    </span>
                )}
            </div>

            {letter.kind === 'weekly' && letter.coverImageUrl && (
                <div className="w-32 h-44 mx-auto shadow-md rounded-md overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={letter.coverImageUrl
                            .replace('coversum', 'cover500')
                            .replace(/^http:/i, 'https:')}
                        alt={letter.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {letter.kind === 'monthly_pick' && letter.books.length > 0 && (
                <div className="flex justify-center gap-3 px-4">
                    {letter.books.slice(0, 3).map((b) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            key={b.id}
                            src={(b.imageUrl ?? '')
                                .replace('coversum', 'cover500')
                                .replace(/^http:/i, 'https:')}
                            alt={b.title}
                            className="w-24 md:w-28 aspect-[2/3] object-cover rounded shadow-md"
                        />
                    ))}
                </div>
            )}

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight break-keep">
                {letter.headlineTitle || letter.title}
            </h1>

            {letter.authors && (
                <div className="text-sm text-gray-500 font-medium">
                    저자: {letter.authors}
                    {(letter.publisher || letter.publishedDate) && (
                        <> · {letter.publisher} {letter.publishedDate}</>
                    )}
                </div>
            )}

            <p className="text-sm text-gray-400">
                {dateStr} 북핏 발행
                {letter.readingTime ? ` · 약 ${letter.readingTime}분` : ''}
            </p>
        </header>
    );
}

function BookCard({
    book,
    index,
    showIndex,
}: {
    book: { id: string; title: string; author: string; imageUrl: string | null; recommendation: string | null };
    index: number;
    showIndex: boolean;
}) {
    return (
        <article className="bg-background border border-border rounded-xl p-5 md:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-5">
                <Link href={`/books/${book.id}`} className="md:w-32 shrink-0 self-start">
                    <div className="aspect-[1/1.5] relative rounded-md overflow-hidden bg-muted shadow-md border border-border">
                        {book.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={book.imageUrl
                                    .replace('coversum', 'cover500')
                                    .replace(/^http:/i, 'https:')}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <BookOpen className="w-6 h-6 opacity-30" />
                            </div>
                        )}
                    </div>
                </Link>
                <div className="flex-1 space-y-2">
                    {showIndex && (
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Book {index + 1}
                        </div>
                    )}
                    <Link href={`/books/${book.id}`} className="block group">
                        <h3 className="text-xl font-bold font-serif text-primary group-hover:text-accent transition-colors break-keep leading-tight">
                            {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                    </Link>
                    {book.recommendation && (
                        <p className="text-sm text-foreground/80 leading-relaxed break-keep">
                            {book.recommendation}
                        </p>
                    )}
                </div>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
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
    );
}
