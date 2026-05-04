import BookfitLetterForm from "@/components/BookfitLetterForm";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function NewsletterPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                    <div className="text-xl font-bold font-sans tracking-tight">
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">BookFit Letter</span>
                    </div>
                    <div className="w-16"></div> {/* Spacer */}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24">
                <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold uppercase tracking-widest">
                            <Mail className="w-4 h-4" /> Weekly Newsletter
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-sans leading-tight text-primary">
                            사유의 조각을<br />
                            매주 받아보세요
                        </h1>
                        <p className="text-lg text-muted-foreground font-light leading-relaxed">
                            바쁜 일상 속, 북핏 큐레이터들이<br />
                            엄선한 책과 문장들을 놓치지 마세요.<br />
                            가장 먼저 새로운 큐레이션을 만나볼 수 있습니다.
                        </p>
                    </div>

                    {/* Right: Form */}
                    <div className="flex justify-center md:justify-end">
                        <BookfitLetterForm />
                    </div>
                </div>
            </main>
        </div>
    );
}
