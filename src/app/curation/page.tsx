
import { fetchCurationFromSheet } from "@/lib/google-sheets";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function CurationPage() {
    const curation = await fetchCurationFromSheet();

    if (!curation) {
        return (
            <div className="min-h-screen bg-[#061A14] flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">No Curation Found</h2>
                    <p className="text-gray-400">Please check back later.</p>
                    <Link href="/">
                        <Button variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10">
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Group books by category
    const booksByCategory = curation.books.reduce((acc, book) => {
        const category = book.category || "Uncategorized";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(book);
        return acc;
    }, {} as Record<string, typeof curation.books>);


    // Order categories? For now, just Object.keys or specific order if needed.
    // Let's rely on the order they appear or simple sort.
    const categories = Object.keys(booksByCategory);

    return (
        <div className="min-h-screen bg-[#061A14] text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <Link href="/#curation" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                    <div className="text-xl font-bold font-serif tracking-tight">
                        <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent">BookFit Choice</span>
                    </div>
                    <div className="w-16"></div> {/* Spacer for center alignment */}
                </div>
            </header>

            <main className="pt-32 pb-24 px-6">
                <div className="max-w-6xl mx-auto space-y-24">
                    {/* Hero Section of Curation */}
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" /> Monthly Curation
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-serif leading-tight">
                            북핏초이스
                        </h1>
                        <p className="text-xl text-gray-300 font-light leading-relaxed whitespace-pre-line">
                            북핏 큐레이터들이 선정한 베스트셀러
                        </p>

                        {/* Category Navigation Buttons */}
                        <div className="flex flex-wrap justify-center gap-3 pt-4">
                            {categories.map((category) => (
                                <Link
                                    key={category}
                                    href={`#category-${category}`}
                                    className="px-4 py-2 rounded-full border border-white/10 hover:border-accent hover:text-accent hover:bg-accent/5 bg-white/5 text-sm text-gray-300 transition-all duration-300"
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Books grouped by Category */}
                    {categories.map((category) => (
                        <div key={category} id={`category-${category}`} className="space-y-8 scroll-mt-28">
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-accent border-b border-white/10 pb-4 inline-block pr-12">
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {booksByCategory[category].map((book, i) => (
                                    <Link key={book.id} href={book.coupangLink || "#"} target="_blank" rel="noopener noreferrer" className="group space-y-4 block">
                                        <div className="aspect-[1/1.5] relative rounded-md overflow-hidden shadow-2xl border border-white/5 group-hover:shadow-accent/20 transition-all duration-500 group-hover:-translate-y-2">
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
                                            {/* Category Badge removed from image as it is now a section header */}
                                            {/* but user might still want it? Plan said "Group books by category", likely section header is better than badge everywhere if grouped. 
                                                Actually user "이미지아래 설명란이 중요한데 잘리면 안돼. 그래서 /curation 이 페이지는 책을 4개씩 배치하면 어때? 그리고 카테고리별로 섹션 구분이 있으면 좋겠어~"
                                                So Section grouping is key. I will keep the badge OFF the image in this view since it's grouped by section to avoid redundancy? 
                                                Or keep it? Let's keep it clean since it's under a category header. */}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-md mb-1">{book.title}</div>
                                                <div className="text-gray-400 text-sm line-clamp-1">{book.author}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-1">
                                            <div className="bg-white/5 border border-white/10 rounded-md p-4 hover:bg-white/10 transition-colors">
                                                <p className="text-sm text-gray-300 font-light leading-relaxed whitespace-pre-line">
                                                    {book.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
