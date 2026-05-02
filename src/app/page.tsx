import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, MessageSquare, BookCheck, Lightbulb, Sparkles, Mail, ListChecks } from 'lucide-react';
import CurationSection from '@/components/CurationSection';
import JsonLd from '@/components/JsonLd';
import Header from '@/components/Header';
import {
    listLetters,
    listCurations,
    getBooksByIds,
    getLatestBestsellerMonth,
    listBestsellersForMonth,
    type Curation,
    type Book,
} from '@/lib/firestore-models';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getLatestLetters() {
    try {
        return await listLetters({ status: 'PUBLISHED', limit: 3 });
    } catch (error) {
        console.error('home/getLatestLetters', error);
        return [];
    }
}

async function getRecentCurations(): Promise<{ curation: Curation; firstBook: Book | null }[]> {
    try {
        const list = await listCurations({
            status: 'published',
            limit: 6,
            requireSlug: true,
            orderBy: [
                { field: 'isFeatured', dir: 'desc' },
                { field: 'publishedAt', dir: 'desc' },
                { field: 'createdAt', dir: 'desc' },
            ],
        });
        const firstBookIds = list.map((c) => c.bookIds[0]).filter((id): id is string => !!id);
        const books = await getBooksByIds(Array.from(new Set(firstBookIds)));
        const bookMap = new Map(books.map((b) => [b.id, b]));
        return list.map((c) => ({
            curation: c,
            firstBook: c.bookIds[0] ? bookMap.get(c.bookIds[0]) ?? null : null,
        }));
    } catch (error) {
        console.error('home/getRecentCurations', error);
        return [];
    }
}

async function getMonthlyBestsellers() {
    try {
        const month = await getLatestBestsellerMonth();
        if (!month) return { month: null, books: [] as Awaited<ReturnType<typeof listBestsellersForMonth>> };
        const books = await listBestsellersForMonth(month, 8);
        return { month, books };
    } catch (error) {
        console.error('home/getMonthlyBestsellers', error);
        return { month: null, books: [] as Awaited<ReturnType<typeof listBestsellersForMonth>> };
    }
}

const FAQ_DATA = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: '북핏(BookFit)은 어떤 서비스인가요?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: '북핏은 사용자의 취향과 현재 감정, 상황을 AI가 분석해 맞춤 책을 추천하는 동시에, 큐레이션 매거진과 주간 북핏레터로 매주 새로운 책 콘텐츠를 만나볼 수 있는 정보 제공형 책 사이트입니다.',
            },
        },
        {
            '@type': 'Question',
            name: '어떤 책을 추천받을 수 있나요?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: '심리 기반 책 추천, 개인의 취향 맞춤 도서, 그리고 최근 인기 있는 베스트셀러 추천까지 나에게 꼭 맞는 단 한 권의 책을 찾아드립니다.',
            },
        },
        {
            '@type': 'Question',
            name: 'AI 책 추천은 어떻게 이루어지나요?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: '간단한 질문을 통해 당신의 목표, 고민, 관심사를 파악하여 핵심 키워드를 추출하고, 이를 기반으로 가장 적합한 취향책추천과 추천 근거를 함께 제공합니다.',
            },
        },
    ],
};

export default async function Home() {
    const [letters, curations, bestsellers] = await Promise.all([
        getLatestLetters(),
        getRecentCurations(),
        getMonthlyBestsellers(),
    ]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center overflow-x-hidden">
            <JsonLd data={FAQ_DATA} />
            <Header />

            <main className="flex-1 w-full flex flex-col items-center" id="main-content">
                {/* Hero */}
                <section
                    className="relative w-full py-32 md:py-48 text-center flex flex-col items-center space-y-8 overflow-hidden"
                    aria-labelledby="hero-title"
                >
                    <div className="absolute inset-0 z-0" aria-hidden="true">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: "url('/images/library_background.png')" }}
                        />
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center space-y-6 px-4 max-w-4xl mx-auto">
                        <div className="inline-flex items-center rounded-full border border-primary/10 bg-white/80 backdrop-blur-md px-4 py-2 text-base font-semibold text-primary transition-colors shadow-sm">
                            매주 새로운 큐레이션과 레터, 그리고 나에게 딱 맞는 한 권 📚
                        </div>
                        <h1
                            id="hero-title"
                            className="text-4xl md:text-7xl font-extrabold tracking-tight text-primary break-keep drop-shadow-sm leading-tight relative"
                        >
                            <span className="sr-only">BookFit(북핏) - AI 책 추천, 큐레이션 매거진, 주간 북핏레터</span>
                            지금 당신에게 필요한 <br className="md:hidden" />
                            <span className="text-accent italic">딱 한 권</span>
                        </h1>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl break-keep leading-relaxed drop-shadow-sm font-medium">
                            취향도, 기분도 다른 당신에게 딱 맞는 한 권을 골라드려요.
                        </p>
                        <div className="flex flex-col gap-4 pt-6 w-full max-w-sm mx-auto">
                            <Link href="/recommend" className="w-full">
                                <Button
                                    size="lg"
                                    className="w-full rounded-md bg-accent text-white hover:bg-primary font-extrabold px-8 py-8 text-xl shadow-lg shadow-accent/20 transition-all hover:scale-105 border border-transparent"
                                    aria-label="지금 내 책 찾기"
                                >
                                    지금 내 책 찾기 🔍
                                </Button>
                            </Link>
                            <Link href="/curation" className="w-full">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full rounded-md border-primary/20 bg-white/50 text-primary hover:bg-primary/5 px-8 py-6 text-lg backdrop-blur-sm transition-all hover:border-primary/40 shadow-sm"
                                    aria-label="큐레이션 매거진 보기"
                                >
                                    <BookCheck className="mr-2 h-5 w-5" />
                                    큐레이션 매거진 보기
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Section 1: 이번 주 북핏레터 */}
                {letters.length > 0 && (
                    <section className="w-full py-24 px-6 bg-secondary/30 border-y border-border" aria-labelledby="letter-title">
                        <div className="max-w-6xl mx-auto space-y-10">
                            <div className="text-center space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                                    <Mail className="w-3 h-3" /> Weekly Letter
                                </div>
                                <h2 id="letter-title" className="text-3xl md:text-4xl font-bold font-serif text-primary">
                                    이번 주 북핏레터
                                </h2>
                                <p className="text-base text-muted-foreground">한 권의 책에 담긴 인사이트를 매주 정리해 보내드려요.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {letters.map((l) => (
                                    <Link
                                        key={l.id}
                                        href={`/bookfit-letter/${l.slug}`}
                                        className="group block bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-accent transition-all"
                                    >
                                        <div className="relative aspect-[16/10] w-full bg-muted">
                                            {l.coverImageUrl ? (
                                                <Image
                                                    src={l.coverImageUrl}
                                                    alt={l.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <BookOpen className="w-8 h-8 opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 space-y-2">
                                            <h3 className="text-lg font-bold font-serif text-primary leading-tight group-hover:text-accent transition-colors break-keep line-clamp-2">
                                                {l.headlineTitle || l.title}
                                            </h3>
                                            {l.metaDescription && (
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 break-keep">
                                                    {l.metaDescription}
                                                </p>
                                            )}
                                            <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
                                                <span>
                                                    {l.publishedAt
                                                        ? new Date(l.publishedAt).toLocaleDateString('ko-KR')
                                                        : ''}
                                                </span>
                                                {l.readingTime ? <span>약 {l.readingTime}분</span> : null}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="text-center">
                                <Link href="/bookfit-letter" className="inline-flex items-center gap-1 text-accent hover:underline font-semibold">
                                    레터 전체 보기 <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 2: 최근 큐레이션 */}
                {curations.length > 0 && (
                    <section className="w-full py-24 px-6" aria-labelledby="curation-section-title">
                        <div className="max-w-6xl mx-auto space-y-10">
                            <div className="text-center space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                                    <Sparkles className="w-3 h-3" /> Curation Magazine
                                </div>
                                <h2 id="curation-section-title" className="text-3xl md:text-4xl font-bold font-serif text-primary">
                                    최근 큐레이션
                                </h2>
                                <p className="text-base text-muted-foreground">테마별로 묶인 책 3권으로 이번 주의 독서 흐름을 잡아보세요.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {curations.map(({ curation: c, firstBook }) => {
                                    const cover = c.ogImage || c.cardImageUrl || firstBook?.imageUrl;
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
                                                {c.isFeatured && (
                                                    <div className="absolute top-3 left-3 bg-accent text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">
                                                        Featured
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 space-y-2">
                                                {c.category && (
                                                    <div className="text-[10px] text-accent font-bold uppercase tracking-widest">
                                                        {c.category}
                                                    </div>
                                                )}
                                                <h3 className="text-lg font-bold font-serif text-primary leading-tight group-hover:text-accent transition-colors break-keep line-clamp-2">
                                                    {c.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 break-keep">
                                                    {c.description}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="text-center">
                                <Link href="/curation" className="inline-flex items-center gap-1 text-accent hover:underline font-semibold">
                                    큐레이션 전체 보기 <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Legacy: BookFit Choice (Google Sheets / JSON) */}
                <CurationSection id="curation" />

                {/* Section 3: 베스트셀러 */}
                {bestsellers.books.length > 0 && (
                    <section className="w-full py-24 px-6 bg-secondary/30 border-y border-border" aria-labelledby="bestseller-title">
                        <div className="max-w-6xl mx-auto space-y-10">
                            <div className="text-center space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                                    <ListChecks className="w-3 h-3" /> Bestseller
                                </div>
                                <h2 id="bestseller-title" className="text-3xl md:text-4xl font-bold font-serif text-primary">
                                    {bestsellers.month ? `${bestsellers.month} 베스트셀러` : '베스트셀러'}
                                </h2>
                                <p className="text-base text-muted-foreground">알라딘 기준 이번 달 상위 도서</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {bestsellers.books.map((b) => (
                                    <a
                                        key={b.id}
                                        href={b.link || `https://www.coupang.com/np/search?q=${encodeURIComponent(`${b.title} ${b.author}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-accent transition-all"
                                    >
                                        <div className="relative aspect-[1/1.5] w-full bg-muted">
                                            {b.coverUrl ? (
                                                <Image
                                                    src={b.coverUrl.replace('coversum', 'cover500').replace(/^http:/i, 'https:')}
                                                    alt={b.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-accent text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                                                #{b.rank}
                                            </div>
                                        </div>
                                        <div className="p-3 space-y-1">
                                            <h3 className="text-sm font-semibold leading-tight line-clamp-2 break-keep">{b.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{b.author}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                            <div className="text-center">
                                <Link href="/bestsellers" className="inline-flex items-center gap-1 text-accent hover:underline font-semibold">
                                    베스트셀러 전체 보기 <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 4: Your BookFit Journey */}
                <section className="w-full py-24 px-6 relative bg-white border-t border-border" aria-labelledby="journey-title">
                    <div className="max-w-6xl mx-auto text-center space-y-16">
                        <div className="space-y-4">
                            <h2 id="journey-title" className="text-3xl md:text-4xl font-bold text-primary font-serif">
                                Your BookFit Journey
                            </h2>
                            <div className="w-12 h-0.5 bg-accent/50 mx-auto" aria-hidden="true"></div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                            <article className="flex flex-col items-center text-center space-y-4 group">
                                <div className="mb-2 p-4 rounded-full bg-secondary group-hover:bg-accent/10 transition-colors" aria-hidden="true">
                                    <MessageSquare className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-primary">상황 분석</h3>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto break-keep">
                                    당신의 목표, 고민, 관심사를 짧은 질문으로 정리해 핵심 키워드를 뽑아냅니다.
                                </p>
                            </article>
                            <article className="flex flex-col items-center text-center space-y-4 group">
                                <div className="mb-2 p-4 rounded-full bg-secondary group-hover:bg-accent/10 transition-colors" aria-hidden="true">
                                    <BookCheck className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-primary">딱 맞는 추천</h3>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto break-keep">
                                    분석된 키워드로 지금 당신에게 가장 필요한 책 한 권을 정밀하게 추천합니다.
                                </p>
                            </article>
                            <article className="flex flex-col items-center text-center space-y-4 group">
                                <div className="mb-2 p-4 rounded-full bg-secondary group-hover:bg-accent/10 transition-colors" aria-hidden="true">
                                    <Lightbulb className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-primary">추천 근거</h3>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto break-keep">
                                    &lsquo;왜 이 책인지&rsquo;를 한눈에 이해하도록, 추천 이유와 적용 포인트를 함께 제공합니다.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
