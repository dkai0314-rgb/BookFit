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
                    구독해주셔서 감사합니다!
                </h1>

                <p className="text-gray-400 text-lg leading-relaxed">
                    북핏의 뉴스레터 구독이 완료되었습니다.<br />
                    매주 엄선된 책과 깊이 있는 사유의 조각들을<br />
                    메일함으로 보내드릴게요.
                </p>

                <div className="pt-8 space-y-4">
                    <Link href="/">
                        <Button className="w-full md:w-auto px-8 py-6 rounded-full bg-accent text-[#061A14] font-bold text-lg hover:bg-accent/90 transition-all">
                            홈으로 돌아가기
                        </Button>
                    </Link>
                    <p className="text-xs text-gray-600">
                        * 구독 해지는 받으시는 메일 하단의 'Unsubscribe' 링크를 통해 언제든 가능합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
