
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

export default function CurationSection() {
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
            <div className="w-full py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!curation) return null;

    return (
        <section className="w-full py-24 px-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                {/* Left: Curation Info */}
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> BookFit Choice
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-white font-serif leading-tight">
                            {curation.title}
                        </h2>
                        <p className="text-xl text-gray-400 font-light leading-relaxed whitespace-pre-line">
                            {curation.description}
                        </p>
                    </div>
                    <div className="pt-4">
                        <div className="text-sm text-gray-500 font-medium">Theme: {curation.theme}</div>
                    </div>
                </div>

                {/* Right: Books Grid */}
                <div className="flex-[1.5] grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {curation.books.map((book, i) => (
                        <Link key={book.id} href={`/books/${book.id}`} className="group space-y-4 block">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="text-[10px] text-accent font-bold uppercase tracking-tighter mb-1">Pick {i + 1}</div>
                                    <div className="text-white font-bold text-sm line-clamp-1">{book.title}</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-blue-400 font-medium bg-blue-400/10 p-2 rounded line-clamp-3 leading-relaxed">
                                    {book.recommendation}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
