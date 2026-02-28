"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle2, Check } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigValid } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function TemplateForm() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const router = useRouter();

    // 1. 인증 상태 추적 + Firestore에서 기존 신청 여부 확인
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser && isFirebaseConfigValid) {
                try {
                    const docRef = doc(db, "users", currentUser.uid, "templates", "bookfit");
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setAlreadyApplied(true);
                    }
                } catch (error) {
                    console.error("Error checking template status:", error);
                }
            }
            setCheckingStatus(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenDialog = () => {
        if (!user) {
            alert("무료 신청을 위해 먼저 로그인해 주세요.");
            router.push("/login?redirect=/template");
            return;
        }
        if (alreadyApplied) return; // 이미 신청했으면 다이얼로그 열지 않음
        setIsDialogOpen(true);
    };

    const handleApply = async () => {
        setLoading(true);

        try {
            // 1. Brevo 메일 구독 신청 연동 (실패해도 계속 진행)
            try {
                await fetch("/api/newsletter/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: user!.email,
                        name: user!.displayName || "",
                    }),
                });
            } catch (apiErr) {
                console.error("Failed to call Brevo API", apiErr);
            }

            // 2. 신청 정보 Firestore에 저장 (비동기 fire-and-forget, UI 차단 없음)
            if (isFirebaseConfigValid) {
                setDoc(doc(db, "users", user!.uid, "templates", "bookfit"), {
                    templateId: "bookfit",
                    title: "독서관 노션 템플릿",
                    purchasedAt: new Date().toISOString(),
                    price: 0,
                }).catch((err) => console.error("Firestore save error:", err));
            }

            // 3. 다이얼로그 닫고 성공 팝업 띄우기 (Firestore 실패해도 진행)
            setAlreadyApplied(true);
            setIsDialogOpen(false);
            setIsSuccessPopupOpen(true);
        } catch (error) {
            console.error("Error during application:", error);
            const err = error as Error;
            alert(`오류가 발생했습니다: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#04120e] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent/5 blur-3xl pointer-events-none" aria-hidden="true"></div>

            <div className="relative z-10 space-y-8">
                <div className="space-y-2 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">독서관 노션 템플릿</h3>
                    <p className="text-gray-400 text-sm">신청 후 즉시 복제하여 사용할 수 있습니다.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center text-sm text-gray-300">
                        <span>정가</span>
                        <span className="line-through">$10.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">특별 배포가</span>
                        <div className="flex items-center gap-2">
                            <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded">100% FREE</span>
                            <span className="text-2xl font-bold text-accent">0원</span>
                        </div>
                    </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2 mt-2">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>신청 즉시 마이페이지에서 노션 템플릿 링크 제공</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>평생 무상 업데이트 지원</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>상세 사용 가이드 포함</span>
                    </li>
                </ul>

                <div className="pt-4">
                    <Button
                        onClick={handleOpenDialog}
                        className={`w-full font-bold py-6 text-lg transition-all ${alreadyApplied
                            ? "bg-white/10 text-gray-400 cursor-default hover:bg-white/10"
                            : "bg-accent text-[#061A14] hover:bg-white hover:text-accent"
                            }`}
                        disabled={loading || alreadyApplied || checkingStatus}
                    >
                        {checkingStatus ? "확인 중..." : alreadyApplied ? (
                            <span className="flex items-center gap-2"><Check className="w-5 h-5" /> 신청완료</span>
                        ) : "무료 신청하기"}
                    </Button>
                </div>
            </div>

            {/* 뉴스레터 동의 다이얼로그 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#0a2018] border border-accent/20 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold pt-2">
                            무료 신청과 함께 북핏레터를 받아보세요.
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 pt-3 text-sm leading-relaxed">
                            템플릿 업데이트 소식, 새로운 추천 콘텐츠, 유용한 읽을거리까지 가장 먼저 전해드립니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 sm:justify-center flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="bg-transparent border-white/20 text-white hover:bg-white/10"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={loading}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="bg-accent text-[#061A14] hover:bg-white hover:text-accent font-bold"
                            disabled={loading}
                        >
                            {loading ? "신청 처리 중..." : "무료 신청하고 받기"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 성공 팝업 */}
            <Dialog open={isSuccessPopupOpen} onOpenChange={setIsSuccessPopupOpen}>
                <DialogContent className="bg-[#0a2018] border border-accent/20 text-white sm:max-w-sm">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                                <Check className="w-8 h-8 text-accent" />
                            </div>
                        </div>
                        <DialogTitle className="text-xl font-bold text-center">
                            신청이 완료되었습니다!
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 pt-3 text-sm leading-relaxed text-center">
                            마이페이지에서 확인하세요.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 sm:justify-center">
                        <Button
                            onClick={() => setIsSuccessPopupOpen(false)}
                            className="bg-accent text-[#061A14] hover:bg-white hover:text-accent font-bold w-full"
                        >
                            닫기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
