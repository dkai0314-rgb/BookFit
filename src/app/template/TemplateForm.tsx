"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, PenLine, Trophy, BarChart3 } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function TemplateForm() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const goToLibrary = () => {
        if (!user) {
            router.push(`/login?redirect=/mypage/library`);
            return;
        }
        router.push("/mypage/library");
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent/5 blur-3xl pointer-events-none" aria-hidden="true"></div>

            <div className="relative z-10 space-y-8">
                <div className="space-y-2 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">독서기록장</h3>
                    <p className="text-muted-foreground text-sm">이제 북핏 안에서 무료로 이용할 수 있어요.</p>
                </div>

                <div className="bg-secondary border border-border rounded-xl p-5 flex items-center justify-center">
                    <span className="text-2xl font-bold text-accent">무료</span>
                </div>

                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>서재 — 읽고 싶음 / 읽는 중 / 완독 관리</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <PenLine className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>하이라이트 — 인상 깊은 문장과 생각 기록</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Trophy className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>챌린지 — 독서 목표를 세우고 달성하기</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <BarChart3 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>통계 — 독서 습관을 한눈에 확인</span>
                    </li>
                </ul>

                <div className="pt-4">
                    <Button
                        onClick={goToLibrary}
                        disabled={authLoading}
                        className="w-full bg-accent hover:bg-accent/90 text-primary-foreground font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {user ? "내 독서기록장 열기" : "무료로 시작하기"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
