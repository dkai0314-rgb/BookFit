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

interface CategoryBestseller {
    category: string;
    books: AladinBook[];
}

export default function BestsellersPage() {
    const [categoryBestsellers, setCategoryBestsellers] = useState<CategoryBestseller[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestsellers = async () => {
            try {
                const res = await fetch('/api/bestsellers');
                const data = await res.json();
                setCategoryBestsellers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBestsellers();
    }, []);

    const scrollToCategory = (index: number) => {
        const element = document.getElementById(`category-${index}`);
        if (element) {

            const headerOffset = 180;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#061A14] text-white flex flex-col items-center py-10 px-4">
            <header role="banner" className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2" aria-label="메인 페이지로 돌아가기">
                    <ArrowLeft size={20} aria-hidden="true" /> 홈으로
                </Link>
                <div className="text-xl font-bold font-serif tracking-tight text-white hover:text-accent transition-colors">
                    BookFit Bestsellers
                </div>
                <div className="w-20" aria-hidden="true"></div>
            </header>

            <main role="main" className="w-full max-w-[1400px] mt-24 pb-20">
                <div className="text-center mb-12 space-y-3">
                    <h1 id="bestseller-title" className="text-3xl md:text-5xl font-bold font-serif">
                        분야별 <span className="text-accent">베스트셀러</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        지금 가장 사랑받는 카테고리별 Top 10
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40" role="status" aria-live="polite">
                        <Loader2 size={48} className="text-accent animate-spin mb-4" aria-hidden="true" />
                        <p className="text-gray-500 text-lg">실시간 베스트셀러를 불러오고 있습니다...</p>
                    </div>
                ) : (
                    <>
                        <div className="sticky top-[72px] z-40 bg-[#061A14]/95 backdrop-blur-md py-4 border-b border-white/5 flex flex-wrap justify-center gap-3 shadow-sm">
                            {categoryBestsellers.map((item, idx) => (
                                <button
                                    key={`nav-${idx}`}
                                    onClick={() => scrollToCategory(idx)}
                                    className="px-4 py-2 rounded-full border border-white/10 hover:border-accent hover:text-accent hover:bg-accent/5 bg-white/5 text-sm text-gray-300 transition-all duration-300"
                                >
                                    {item.category}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-24 mt-16">
                            {categoryBestsellers.map((categoryItem, sectionIdx) => (
                                <section key={`section-${sectionIdx}`} id={`category-${sectionIdx}`}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white border-l-4 border-accent pl-4">
                                            {categoryItem.category}
                                        </h2>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mb-12">
                                        {categoryItem.books.map((book, i) => (
                                            <article key={i} className="flex flex-col h-full bg-[#0B2A1F]/20 rounded-xl overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-300 hover:-translate-y-2 group">
                                                <div className="flex flex-col h-full">
                                                    <div className="aspect-[1/1.5] w-full relative overflow-hidden bg-black/50">
                                                        {book.cover ? (
                                                            <Image
                                                                src={book.cover.replace("coversum", "cover500")}
                                                                alt={`${book.title} 표지`}
                                                                fill
                                                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-base" aria-hidden="true">No Image</div>
                                                        )}
                                                        <div className="absolute top-0 left-0 bg-accent text-[#061A14] px-3 py-1.5 text-lg font-bold shadow-lg z-10 rounded-br-lg" aria-label={`순위: ${i + 1}위`}>
                                                            {i + 1}
                                                        </div>
                                                    </div>

                                                    <div className="p-5 flex flex-col flex-1">
                                                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                                                            {book.title}
                                                        </h3>
                                                        <p className="text-base text-gray-400 mb-3 font-medium">
                                                            {book.author}
                                                        </p>
                                                        <div className="flex-1">
                                                            <p className="text-base text-gray-500 line-clamp-5 leading-relaxed">
                                                                {book.description || "책 소개가 없습니다."}
                                                            </p>
                                                        </div>
                                                        <div className="pt-4 mt-auto border-t border-white/5">
                                                            <p className="text-[10px] text-gray-600 uppercase tracking-widest text-right">{categoryItem.category} Top 10</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    <div className="w-full max-w-3xl mx-auto flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/10 mt-8 shadow-sm">
                                        <p className="text-gray-300 mb-4 font-medium text-center text-lg">💡 지금 읽기 딱 좋은 {categoryItem.category} 책, 쿠팡에서 바로 찾아보세요!</p>
                                        <div className="w-full overflow-hidden rounded-lg bg-white/80 p-1">
                                            <iframe src="https://coupa.ng/clGXS1" width="100%" height="44" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url"></iframe>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-4 text-center">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
