
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface Curation {
    id: string;
    theme: string;
    title: string;
    description: string;
    books: any[];
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
                const response = await fetch("/api/curation");
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setCuration(data[0]); // Get the latest one
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
            <section id={id} className="w-full py-24 px-6 max-w-6xl mx-auto text-center border-y border-white/5 bg-white/2">
                <div className="space-y-6">
                    <h2 className="text-3xl font-serif text-white opacity-50">BookFit Choice</h2>
                    <p className="text-gray-500 font-light">곧 새로운 큐레이션이 공개됩니다. 잠시만 기다려 주세요!</p>
                    <div className="flex justify-center gap-8 opacity-20 grayscale pointer-events-none">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[1/1.5] w-32 bg-slate-800 rounded shadow-2xl" />
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
                        <Sparkles className="w-3 h-3" /> Monthly Selection
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white font-serif leading-tight">
                        BookFit Choice
                    </h2>
                    <p className="text-lg text-gray-400 font-light leading-relaxed whitespace-pre-line">
                        이번 달, 북핏의 큐레이터들이 선정한 깊이 있는 사유의 조각들입니다.
                    </p>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {curation.books.slice(0, 10).map((book, i) => (
                        <Link key={book.id} href={book.coupangLink || "#"} target="_blank" rel="noopener noreferrer" className="group space-y-4 block">
                            <div className="aspect-[1/1.5] relative rounded-sm overflow-hidden shadow-2xl border border-white/5 group-hover:shadow-accent/20 transition-all duration-500 group-hover:-translate-y-2">
                                {book.imageUrl ? (
                                    <Image
                                        src={book.imageUrl.replace("coversum", "cover500")}
                                        alt={book.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-500">No Image</div>
                                )}
                                {book.category && (
                                    <div className="absolute top-0 left-0 bg-accent text-[#061A14] text-[10px] font-bold px-3 py-1 rounded-br-lg rounded-tl-sm z-10 shadow-md">
                                        {book.category}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
                                <div className="absolute bottom-4 left-4 right-4 text-left">
                                    <div className="text-[10px] text-accent font-bold uppercase tracking-tighter mb-1">Pick {i + 1}</div>
                                    <div className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">{book.title}</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="bg-white/5 border border-white/10 rounded-md p-3 hover:bg-white/10 transition-colors">
                                    <p className="text-xs text-gray-300 font-light leading-relaxed line-clamp-3">
                                        {book.recommendation}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* View All Button */}
            <div className="mt-12 flex justify-center">
                <Link href="/curation">
                    <button className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white font-medium transition-all group flex items-center gap-2">
                        View All Collection
                        <Sparkles className="w-4 h-4 text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                </Link>
            </div>
        </section>
    );
}
