import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsletterThanksPage() {
    return (
        <div className="min-h-screen bg-[#061A14] flex flex-col items-center justify-center text-white p-6">
            <div className="max-w-lg w-full text-center space-y-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mb-4">
                    <Sparkles className="w-8 h-8 text-accent" />
                </div>

                <h1 className="text-3xl md:text-4xl font-black font-serif text-white leading-tight">
                    êµ¬ë…?´ì£¼?”ì„œ ê°ì‚¬?©ë‹ˆ??
                </h1>

                <p className="text-gray-400 text-lg leading-relaxed">
                    ë¶í•???´ìŠ¤?ˆí„° êµ¬ë…???„ë£Œ?˜ì—ˆ?µë‹ˆ??<br />
                    ë§¤ì£¼ ?„ì„ ??ì±…ê³¼ ê¹Šì´ ?ˆëŠ” ?¬ìœ ??ì¡°ê°?¤ì„<br />
                    ë©”ì¼?¨ìœ¼ë¡?ë³´ë‚´?œë¦´ê²Œìš”.
                </p>

                <div className="pt-8 space-y-4">
                    <Link href="/">
                        <Button className="w-full md:w-auto px-8 py-6 rounded-full bg-accent text-[#061A14] font-bold text-lg hover:bg-accent/90 transition-all">
                            ?ˆìœ¼ë¡??Œì•„ê°€ê¸?
                        </Button>
                    </Link>
                    <p className="text-base text-gray-600">
                        * êµ¬ë… ?´ì???ë°›ìœ¼?œëŠ” ë©”ì¼ ?˜ë‹¨??'Unsubscribe' ë§í¬ë¥??µí•´ ?¸ì œ??ê°€?¥í•©?ˆë‹¤.
                    </p>
                </div>
            </div>
        </div>
    );
}
