
"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";


export interface CurationBook {
    id: string;
    title: string;
    imageUrl?: string;
    category?: string;
    recommendation?: string;
    coupangLink?: string;
    [key: string]: unknown;
}

export function CategoryCarousel({ category, books }: { category: string, books: CurationBook[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [books]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = current.clientWidth * 0.8;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-lg md:text-xl font-bold text-accent font-serif tracking-tight bg-accent/10 border border-accent/20 px-4 py-2 rounded-md inline-block">
                    {category}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`p-2 rounded-full transition-colors ${canScrollLeft ? 'bg-secondary hover:bg-accent/10 text-foreground' : 'bg-transparent text-muted-foreground cursor-not-allowed'}`}
                        aria-label="이전"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`p-2 rounded-full transition-colors ${canScrollRight ? 'bg-secondary hover:bg-accent/10 text-foreground' : 'bg-transparent text-muted-foreground cursor-not-allowed'}`}
                        aria-label="다음"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {books.map((book, i) => (
                    <div key={book.id} className="w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] shrink-0 snap-start">
                        <Link href={`/books/${book.id}`} className="group space-y-4 block">
                            <div className="aspect-[1/1.5] relative rounded-sm overflow-hidden shadow-md border border-border group-hover:shadow-accent/40 transition-all duration-500 group-hover:-translate-y-2">
                                {typeof book.imageUrl === 'string' && book.imageUrl ? (
                                    <Image
                                        src={book.imageUrl.replace("coversum", "cover500").replace(/^http:/i, "https:")}
                                        alt={book.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        referrerPolicy="no-referrer"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-90" />
                                <div className="absolute bottom-4 left-4 right-4 text-left pr-10">
                                    <div className="text-[10px] text-accent font-bold uppercase tracking-tighter mb-1">Pick {i + 1}</div>
                                    <div className="text-foreground font-bold text-sm leading-tight drop-shadow-md">{book.title}</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="bg-background border border-border rounded-md p-3 hover:bg-secondary transition-colors shadow-sm">
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                        {book.recommendation}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface Curation {
    id: string;
    theme: string;
    title: string;
    description: string;
    books: CurationBook[];
}

interface CurationProps {
    id?: string;
}

export default function CurationSection({ id }: CurationProps = {}) {
    const [curation, setCuration] = useState<Curation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLatestCuration() {
            try {
                // Fetch from static JSON file generated by sync pipeline
                const response = await fetch("/data/bookfit-choice.json");
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.books && data.books.length > 0) {
                        setCuration(data);
                    }
                } else {
                    // Fallback to API if JSON is not found yet
                    const apiResponse = await fetch("/api/curation");
                    if (apiResponse.ok) {
                        const apiData = await apiResponse.json();
                        if (apiData && apiData.length > 0) {
                            setCuration(apiData[0]);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch curation", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLatestCuration();
    }, []);

    if (loading) {
        return (
            <div id={id} className="w-full py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!curation) {
        return (
            <section id={id} className="w-full py-24 px-6 max-w-6xl mx-auto text-center border-y border-border bg-secondary/30">
                <div className="space-y-6">
                    <h2 className="text-3xl font-serif text-foreground opacity-50">BookFit Choice</h2>
                    <p className="text-muted-foreground font-light">곧 새로운 큐레이션이 공개됩니다. 잠시만 기다려 주세요!</p>
                    <div className="flex justify-center gap-8 opacity-20 grayscale pointer-events-none">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[1/1.5] w-32 bg-secondary rounded shadow-sm" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id={id} className="w-full py-24 px-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-10">
                {/* Header: Title & Description */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-2">
                        Monthly Selection
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-primary font-serif leading-tight">
                        BookFit Choice
                    </h2>
                    <p className="text-lg text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                        이번 달, 북핏의 큐레이터들이 선정한 깊이 있는 사유의 조각들입니다.
                    </p>
                </div>

                {/* Books Grouped by Category (Swiper) */}
                <div className="space-y-12">
                    {Object.entries(
                        curation.books.reduce((acc, book) => {
                            const category = book.category || '기타';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(book);
                            return acc;
                        }, {} as Record<string, CurationBook[]>)
                    ).map(([category, books]) => (
                        <CategoryCarousel key={category} category={category} books={books as CurationBook[]} />
                    ))}
                </div>
            </div>

            {/* View All Button */}
            <div className="mt-12 flex justify-center">
                <Link href="/curation">
                    <button className="px-8 py-3 rounded-full border border-border bg-background hover:bg-secondary text-foreground font-medium transition-all group flex items-center gap-2 shadow-sm">
                        View All Collection
                    </button>
                </Link>
            </div>
        </section>
    );
}
