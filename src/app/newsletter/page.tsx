import BeehiivEmbed from "@/components/BeehiivEmbed";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function NewsletterPage() {
    return (
        <div className="min-h-screen bg-[#061A14] text-white flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                    <div className="text-xl font-bold font-serif tracking-tight">
                        <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent">BookFit Letter</span>
                    </div>
                    <div className="w-16"></div> {/* Spacer */}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24">
                <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-base font-bold uppercase tracking-widest">
                            <Mail className="w-4 h-4" /> Weekly Newsletter
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-serif leading-tight">
                            ?�유??조각??br />
                            매주 받아보세??
                        </h1>
                        <p className="text-lg text-gray-400 font-light leading-relaxed">
                            바쁜 ?�상 ?? 북핏 ?�레?�터?�이<br />
                            ?�선??책과 문장?�을 ?�치지 마세??<br />
                            가??먼�? ?�로???�레?�션??만나�????�습?�다.
                        </p>
                    </div>

                    {/* Right: Form */}
                    <div>
                        <BeehiivEmbed />
                    </div>
                </div>
            </main>
        </div>
    );
}
