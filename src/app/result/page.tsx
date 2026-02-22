"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSurveyStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, RefreshCw, BookOpen, ExternalLink, Box } from "lucide-react";

export default function ResultPage() {
    const router = useRouter();
    const { recommendations, answers, reset } = useSurveyStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
        if (recommendations.length === 0) {
            router.push("/");
        }
    }, [recommendations, router]);

    if (!isClient || recommendations.length === 0) return null;

    const handleRetest = () => {
        reset();
        router.push("/survey");
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-12 py-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium mb-4"
                    >
                        AI 북 카운셀러 처방전 💊
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl md:text-5xl font-bold text-primary break-keep"
                    >
                        당신을 위한 맞춤 도서입니다
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground"
                    >
                        요청하신 &quot;{answers.userRequest}&quot;에 맞춰 엄선했습니다.
                    </motion.p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recommendations.map((book, index) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                        >
                            <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow border-primary/10">
                                {/* Book Cover */}
                                <div className="relative aspect-[2/3] w-full bg-muted">
                                    {book.thumbnail ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={book.thumbnail}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <BookOpen className="w-12 h-12 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-0 right-0 p-2">
                                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                                            추천 {index + 1}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg leading-tight line-clamp-2" title={book.title}>
                                            {book.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {book.authors.join(", ")}
                                        </p>
                                    </div>

                                    {/* AI Reason */}
                                    <div className="bg-primary/5 p-4 rounded-lg flex-1 border border-primary/10">
                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                            <span className="font-bold text-primary mr-2">🤖 AI 추천 사유:</span>
                                            {book.reason}
                                        </p>
                                    </div>

                                    {/* Short Description */}
                                    <div className="px-1">
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {book.description}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-2 flex flex-col gap-2">

                                        <Button
                                            className="w-full bg-accent hover:bg-accent/90 text-white shadow-md font-bold"
                                            onClick={() => {
                                                if (book.isbn) {
                                                    window.open(`https://www.coupang.com/np/search?q=${book.isbn}`, '_blank');
                                                } else {
                                                    window.open(`https://www.coupang.com/np/search?q=${encodeURIComponent(book.title + " " + book.authors[0])}`, '_blank');
                                                }
                                            }}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            쿠팡 로켓배송 확인
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Coupang Widget Section */}
                <div className="w-full flex flex-col items-center bg-secondary/5 p-6 rounded-2xl border border-secondary/10 shadow-sm mt-8 mb-8">
                    <p className="text-foreground/80 mb-4 font-medium text-center text-lg">💡 추천받은 책, 쿠팡에서 바로 찾아보세요!</p>
                    <div className="w-full overflow-hidden rounded-lg bg-white/80 p-1">
                        <iframe src="https://coupa.ng/clGXS1" width="100%" height="44" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url"></iframe>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
                </div>

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center gap-4 pt-8 border-t border-border/50"
                >
                    <Button variant="outline" size="lg" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        메인으로
                    </Button>
                    <Button variant="ghost" size="lg" onClick={handleRetest}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        다시 추천받기
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
