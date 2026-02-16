
import { prisma } from '@/lib/db';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

async function getBook(id: string) {
    const book = await prisma.book.findUnique({
        where: { id },
    });
    return book;
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const book = await getBook(id);

    if (!book) {
        return <div className="text-center py-20 text-white">Book not found</div>;
    }

    return (
        <div className="min-h-screen bg-[#061A14] flex flex-col items-center">
            {/* Detailed Page Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold font-serif tracking-tight text-white hover:text-accent transition-colors">
                        BookFit
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto pt-32 px-6 flex flex-col md:flex-row gap-12 pb-20">
                {/* Left: Image */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="w-full aspect-[1/1.5] relative rounded-md overflow-hidden shadow-2xl border border-white/10 mb-6">
                        {book.imageUrl && (
                            <img
                                src={book.imageUrl.replace("coversum", "cover500")}
                                alt={book.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        )}
                    </div>

                    <div className="w-full bg-[#0B2A1F]/50 border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-gray-400 text-center leading-relaxed">
                            ℹ️ 이 게시물은 쿠팡 파트너스 활동의 일환으로,<br />
                            이에 따른 일정액의 수수료를 제공받습니다.
                        </p>
                    </div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-2/3 space-y-8 text-white">
                    <div className="space-y-2 border-b border-white/10 pb-6">
                        <div className="text-accent text-sm font-semibold tracking-wider uppercase mb-1">{book.category}</div>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">{book.title}</h1>
                        <p className="text-xl text-gray-400 font-light">{book.author}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                📖 책 소개
                            </h3>
                            <p className="text-gray-300 leading-relaxed font-light">
                                {book.description}
                            </p>
                        </div>

                        {/* AI Recommendation */}
                        <div className="bg-[#0B2A1F] p-6 rounded-lg border border-accent/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-accent mb-3 flex items-center gap-2">
                                ✨ BookFit 큐레이터의 추천사
                            </h3>
                            <div className="text-gray-200 leading-relaxed whitespace-pre-line font-medium">
                                {book.recommendation || book.summary}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <a href={book.purchaseLink || "#"} target="_blank" rel="noopener noreferrer" className="w-full block">
                            <Button size="lg" className="w-full rounded-md bg-accent text-[#061A14] hover:bg-white font-bold text-lg py-6 transition-all shadow-lg hover:shadow-accent/20">
                                구매하기 (최저가 확인)
                            </Button>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
