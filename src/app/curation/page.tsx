
import { fetchCurationFromSheet } from "@/lib/google-sheets";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCarousel, CurationBook } from "@/components/CurationSection";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure Node.js runtime for Google libraries

export default async function CurationPage() {
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(process.cwd(), 'public/data/bookfit-choice.json');

    let curation = null;

    if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        curation = JSON.parse(fileContent);
    } else {
        // Fallback to Google Sheets
        curation = await fetchCurationFromSheet();
    }

    if (!curation) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">No Curation Found</h2>
                    <p className="text-muted-foreground">Please check back later.</p>
                    <Link href="/">
                        <Button variant="outline" className="mt-4 border-border text-foreground hover:bg-secondary">
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Group books by category
    const booksByCategory = curation.books.reduce((acc: Record<string, CurationBook[]>, book: any) => {
        const category = (book.category as string) || "Uncategorized";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(book as CurationBook);
        return acc;
    }, {} as Record<string, CurationBook[]>);


    // Order categories? For now, just Object.keys or specific order if needed.
    // Let's rely on the order they appear or simple sort.
    const categories = Object.keys(booksByCategory);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 h-[64px] flex justify-between items-center bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <Link href="/#curation" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                    <div className="text-xl font-bold font-serif tracking-tight">
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">BookFit Choice</span>
                    </div>
                    <div className="w-16"></div> {/* Spacer for center alignment */}
                </div>
            </header>

            <main className="pt-24 pb-24 px-6 md:px-0">
                <div className="max-w-6xl mx-auto space-y-24">
                    {/* Hero Section of Curation */}
                    <div className="text-center space-y-6 max-w-3xl mx-auto px-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" /> Monthly Curation
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-serif leading-tight text-primary">
                            북핏초이스
                        </h1>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                            북핏 큐레이터들이 선정한 베스트셀러
                        </p>
                    </div>

                    {/* Category Navigation Buttons (Sticky) */}
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

                    {/* Books grouped by Category */}
                    {categories.map((category) => (
                        <div key={category} id={`category-${category}`} className="scroll-mt-28">
                            <CategoryCarousel category={category} books={booksByCategory[category]} />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
