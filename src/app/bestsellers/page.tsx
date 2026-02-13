import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ShoppingBag } from "lucide-react";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma
const prisma = new PrismaClient();

// Force dynamic rendering to ensure fresh data on monthly change
export const dynamic = 'force-dynamic';

async function getMonthlyBestsellers() {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // 1. Try to fetch current month's snapshot
    let books = await prisma.monthlyBestseller.findMany({
        where: { snapshotMonth: currentMonth },
        orderBy: { rank: 'asc' }
    });

    // 2. Fallback: If empty, find the most recent snapshot
    if (books.length === 0) {
        const latestSnapshot = await prisma.monthlyBestseller.findFirst({
            orderBy: { snapshotMonth: 'desc' },
            select: { snapshotMonth: true }
        });

        if (latestSnapshot) {
            books = await prisma.monthlyBestseller.findMany({
                where: { snapshotMonth: latestSnapshot.snapshotMonth },
                orderBy: { rank: 'asc' }
            });
        }
    }

    return books;
}

export default async function BestsellersPage() {
    const books = await getMonthlyBestsellers();
    const displayMonth = books.length > 0 ? books[0].snapshotMonth : new Date().toISOString().slice(0, 7);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center overflow-x-hidden">
            {/* Header (Reuse) */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <Link href="/">
                        <div className="text-2xl font-bold flex items-center gap-2 font-serif tracking-tight cursor-pointer">
                            <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm">BookFit</span>
                        </div>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
                        <Link href="/" className="hover:text-accent transition-colors">이달의북핏</Link>
                        <Link href="/bestsellers" className="text-accent font-semibold transition-colors">베스트셀러</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">Login</Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-6xl px-6 pt-32 pb-20 flex flex-col space-y-12">
                {/* Page Title */}
                <section className="text-center space-y-4">
                    <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-2">
                        <Sparkles className="w-3 h-3 mr-2" />
                        {displayMonth} Collection
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-serif">Monthly Bestsellers</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        대한민국 독자들이 가장 사랑한 이달의 책 Top 30.<br />
                        데이터가 검증한 시대의 흐름을 확인하세요.
                    </p>
                </section>

                {/* Book Grid */}
                <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {books.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-gray-500 text-lg">이번 달 컬렉션 준비 중입니다. 잠시만 기다려주세요! 📚</p>
                            <p className="text-xs text-gray-600 mt-2">(관리자: 스크립트를 실행하여 데이터를 수집해주세요)</p>
                        </div>
                    ) : (
                        books.map((book) => (
                            <div key={book.id} className="group relative bg-[#0B2A1F]/40 border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden hover:bg-[#0B2A1F]/60 transition-all hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 flex flex-col">
                                {/* Book Cover Area */}
                                <div className="aspect-[1.5/1] w-full bg-[#061A14] relative overflow-hidden p-6 flex items-center justify-center">
                                    {/* Gradient Background */}
                                    <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-[#0B2A1F] to-black"></div>

                                    {/* Real Image */}
                                    {book.coverUrl ? (
                                        <img
                                            src={book.coverUrl}
                                            alt={book.title}
                                            className="relative h-48 w-auto h-full object-contain shadow-2xl transform group-hover:scale-105 transition-all duration-500 rounded-sm"
                                        />
                                    ) : (
                                        <div className="relative w-32 h-48 bg-gray-700 rounded-sm flex items-center justify-center">
                                            <span className="text-xs text-gray-400">No Cover</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex-1 flex flex-col space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <div className="text-xs text-accent font-semibold tracking-wide uppercase truncate max-w-[70%]">{book.categoryName?.split('>')[1] || 'General'}</div>
                                            <div className="text-xs font-mono text-gray-500">Rank {book.rank}</div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white font-serif line-clamp-2 leading-tight h-[3rem]">{book.title}</h3>
                                        <p className="text-sm text-gray-400 truncate">{book.author}</p>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        {book.description && (
                                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                <p className="text-xs text-gray-400 leading-relaxed font-light line-clamp-3">
                                                    {book.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Link href={book.link || '#'} target="_blank">
                                            <Button className="w-full bg-white text-[#061A14] hover:bg-gray-100 font-bold transition-transform hover:-translate-y-0.5 shadow-lg">
                                                <ShoppingBag className="w-4 h-4 mr-2" />
                                                구매하기
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>

            {/* Footer Reuse */}
            <footer className="w-full py-8 text-center text-sm text-gray-600 border-t border-[rgba(255,255,255,0.05)] bg-[#04120e]">
                <p>© 2026 BookFit. All rights reserved.</p>
            </footer>
        </div>
    );
}
