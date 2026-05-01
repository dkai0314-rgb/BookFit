import { prisma } from '@/lib/db';
import { fetchCurationFromSheet } from '@/lib/google-sheets';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryCarousel, CurationBook } from '@/components/CurationSection';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getPublishedCurations() {
    return prisma.curation.findMany({
        where: { status: 'published' },
        orderBy: [
            { isFeatured: 'desc' },
            { publishedAt: 'desc' },
            { createdAt: 'desc' },
        ],
        take: 24,
        include: { books: { take: 3 } },
    });
}

async function getBookFitChoice() {
    const jsonPath = path.join(process.cwd(), 'public/data/bookfit-choice.json');
    try {
        if (fs.existsSync(jsonPath)) {
            const fileContent = fs.readFileSync(jsonPath, 'utf8');
            return JSON.parse(fileContent);
        }
    } catch (error) {
        console.error('Failed to read bookfit-choice.json', error);
    }
    try {
        return await fetchCurationFromSheet();
    } catch (error) {
        console.error('Failed to fetch curation from Google Sheets', error);
        return null;
    }
}

export default async function CurationListPage() {
    const [curations, bookfitChoice] = await Promise.all([
        getPublishedCurations(),
        getBookFitChoice(),
    ]);

    const booksByCategory: Record<string, CurationBook[]> = bookfitChoice?.books
        ? bookfitChoice.books.reduce(
              (acc: Record<string, CurationBook[]>, book: CurationBook & { category?: string }) => {
                  const category = book.category || 'Uncategorized';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(book);
                  return acc;
              },
              {},
          )
        : {};
    const categories = Object.keys(booksByCategory);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 h-[64px] flex justify-between items-center bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                    <div className="text-xl font-bold font-serif tracking-tight">
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            BookFit Curation
                        </span>
                    </div>
                    <div className="w-16" />
                </div>
            </header>

            <main className="pt-24 pb-24 px-6 md:px-0">
                <div className="max-w-6xl mx-auto space-y-24">
                    <section className="text-center space-y-6 max-w-3xl mx-auto px-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold uppercase tracking-widest">
                            Curation Magazine
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-serif leading-tight text-primary">
                            큐레이션
                        </h1>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                            테마별로 깊이 있는 책 3권을 묶어, 이번 주의 독서 흐름을 제안해요.
                        </p>
                    </section>

                    {curations.length > 0 && (
                        <section className="space-y-8">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-accent mb-2">
                                        Latest
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold font-serif text-primary">
                                        최근 큐레이션
                                    </h2>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {curations.length}건
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {curations.map((c) => {
                                    const cover =
                                        c.ogImage || c.cardImageUrl || c.books[0]?.imageUrl;
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
                                                        src={cover
                                                            .replace('coversum', 'cover500')
                                                            .replace(/^http:/i, 'https:')}
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
                            </div>
                        </section>
                    )}

                    {categories.length > 0 && (
                        <section className="space-y-12">
                            <div className="text-center space-y-4 max-w-2xl mx-auto">
                                <div className="text-xs font-bold uppercase tracking-widest text-accent">
                                    BookFit Choice
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary">
                                    이번 달의 픽
                                </h2>
                                <p className="text-base text-muted-foreground">
                                    북핏 큐레이터들이 매월 한 번 선정하는 BookFit Choice — 카테고리별로 살펴보세요.
                                </p>
                            </div>
                            <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur-md py-4 border-b border-border flex flex-wrap justify-center gap-3 shadow-sm px-4">
                                {categories.map((category) => (
                                    <Link
                                        key={category}
                                        href={`#category-${category}`}
                                        className="px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent hover:bg-accent/5 bg-secondary text-sm text-muted-foreground transition-all duration-300"
                                    >
                                        {category}
                                    </Link>
                                ))}
                            </div>
                            {categories.map((category) => (
                                <div
                                    key={category}
                                    id={`category-${category}`}
                                    className="scroll-mt-28"
                                >
                                    <CategoryCarousel
                                        category={category}
                                        books={booksByCategory[category]}
                                    />
                                </div>
                            ))}
                        </section>
                    )}

                    {curations.length === 0 && categories.length === 0 && (
                        <section className="text-center space-y-6 py-24">
                            <h2 className="text-2xl font-bold text-foreground">
                                아직 발행된 큐레이션이 없어요
                            </h2>
                            <p className="text-muted-foreground">곧 새로운 큐레이션이 공개됩니다.</p>
                            <Link href="/">
                                <Button
                                    variant="outline"
                                    className="mt-4 border-border text-foreground hover:bg-secondary"
                                >
                                    홈으로
                                </Button>
                            </Link>
                        </section>
                    )}

                    <section className="text-center pt-12 border-t border-border">
                        <Link
                            href="/recommend"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-primary-foreground font-bold hover:bg-accent/90 transition-all"
                        >
                            나에게 맞는 책 추천받기 <ArrowRight className="w-4 h-4" />
                        </Link>
                    </section>
                </div>
            </main>
        </div>
    );
}
