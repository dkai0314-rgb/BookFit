"use client";

import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';

interface AladinBook {
    title: string;
    author: string;
    description: string;
    cover: string;
    link: string;
    categoryName: string;
}

export default function BestsellersPage() {
    const [books, setBooks] = useState<AladinBook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestsellers = async () => {
            try {
                const res = await fetch('/api/bestsellers');
                const data = await res.json();
                setBooks(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBestsellers();
    }, []);

    return (
        <div className="min-h-screen bg-[#061A14] text-white flex flex-col items-center py-10 px-4">
            <header role="banner" className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2" aria-label="메인 페이지로 돌아가기">
                    <ArrowLeft size={20} aria-hidden="true" /> 홈으로
                </Link>
                <div className="text-xl font-bold font-serif tracking-tight text-white hover:text-accent transition-colors">
                    BookFit Bestsellers
                </div>
                <div className="w-20" aria-hidden="true"></div> {/* Spacer for center alignment */}
            </header>

            <main role="main" className="w-full max-w-[1400px] mt-16 pb-20">
                <div className="text-center mb-12 space-y-3">
                    <h1 id="bestseller-title" className="text-3xl md:text-5xl font-bold font-serif">
                        지금 가장 <span className="text-accent">사랑받는 책</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        알라딘 종합 베스트셀러 Top 30
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40" role="status" aria-live="polite">
                        <Loader2 size={48} className="text-accent animate-spin mb-4" aria-hidden="true" />
                        <p className="text-gray-500 text-lg">실시간 베스트셀러를 불러오고 있습니다...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10" aria-labelledby="bestseller-title">
                        {books.map((book, i) => (
                            <article key={i} className="flex flex-col h-full bg-[#0B2A1F]/20 rounded-xl overflow-hidden hover:bg-[#0B2A1F]/40 transition-all duration-300 hover:-translate-y-2 border border-white/5 hover:border-accent/30 group">
                                <a
                                    href={book.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col h-full"
                                    aria-label={`${book.title} 상세 보기 (새 창으로 열림)`}
                                >
                                    {/* Cover Image Container */}
                                    <div className="aspect-[1/1.5] w-full relative overflow-hidden bg-black/50">
                                        {book.cover ? (
                                            <Image
                                                src={book.cover.replace("coversum", "cover500")}
                                                alt={`${book.title} 도서 표지`}
                                                fill
                                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs" aria-hidden="true">No Image</div>
                                        )}

                                        {/* Rank Badge */}
                                        <div className="absolute top-0 left-0 bg-accent text-[#061A14] px-3 py-1.5 text-lg font-bold shadow-lg z-10 rounded-br-lg" aria-label={`순위: ${i + 1}위`}>
                                            {i + 1}
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" aria-hidden="true">
                                            <span className="text-white border border-white/30 px-4 py-2 rounded-full backdrop-blur-md text-sm hover:bg-accent hover:text-[#061A14] hover:border-accent transition-all font-bold">
                                                상세보기
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h2 className="font-bold text-white text-lg mb-2 line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                                            {book.title}
                                        </h2>
                                        <p className="text-sm text-gray-400 mb-3 font-medium">
                                            {book.author}
                                        </p>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                                {book.description || "책 소개가 없습니다."}
                                            </p>
                                        </div>
                                        <div className="pt-4 mt-auto border-t border-white/5">
                                            <p className="text-[10px] text-gray-600 uppercase tracking-widest text-right">Best Seller</p>
                                        </div>
                                    </div>
                                </a>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
