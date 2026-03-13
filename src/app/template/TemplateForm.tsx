"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, CreditCard } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigValid } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/payment-sdk";

export default function TemplateForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [hasTemplate, setHasTemplate] = useState(false);
    const router = useRouter();

    const PRICE = 6900;
    const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_vZnjEJeQVxPYbPB4oQR9VPmOoBN0";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // localStorage 즉시 확인
                if (localStorage.getItem(`bookfit_template_${currentUser.uid}`) === "true") {
                    setHasTemplate(true);
                }

                // Firestore 실시간 검증
                if (isFirebaseConfigValid) {
                    getDoc(doc(db, "users", currentUser.uid, "templates", "bookfit"))
                        .then((snap) => {
                            if (snap.exists()) {
                                setHasTemplate(true);
                                localStorage.setItem(`bookfit_template_${currentUser.uid}`, "true");
                            } else {
                                setHasTemplate(false);
                                localStorage.removeItem(`bookfit_template_${currentUser.uid}`);
                            }
                        })
                        .catch((err) => console.error("Template check error:", err));
                }
            } else {
                setHasTemplate(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handlePayment = async () => {
        if (!user) {
            alert("결제를 위해 먼저 로그인해 주세요.");
            router.push(`/login?redirect=${window.location.pathname}`);
            return;
        }

        if (hasTemplate) {
            alert("이미 보유 중인 템플릿입니다. 마이페이지에서 확인해주세요!");
            router.push('/mypage');
            return;
        }

        setIsLoading(true);
        try {
            const tossPayments = await loadTossPayments(CLIENT_KEY);
            const orderId = `bookfit-${user.uid.slice(0, 8)}-${Date.now()}`;

            await tossPayments.requestPayment("카드", {
                amount: PRICE,
                orderId: orderId,
                orderName: "독서관 노션 템플릿",
                successUrl: `${window.location.origin}/payment/success?userId=${user.uid}&userEmail=${encodeURIComponent(user.email || "")}&userName=${encodeURIComponent(user.displayName || "")}`,
                failUrl: `${window.location.origin}/payment/fail`,
                customerEmail: user.email || undefined,
                customerName: user.displayName || undefined,
            });
        } catch (err: unknown) {
            console.error("Payment error:", err);
            const error = err as { code?: string };
            if (error.code !== "USER_CANCEL") {
                alert("결제 준비 중 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent/5 blur-3xl pointer-events-none" aria-hidden="true"></div>

            <div className="relative z-10 space-y-8">
                <div className="space-y-2 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">독서관 노션 템플릿</h3>
                    <p className="text-muted-foreground text-sm">결제 후 즉시 복제하여 사용할 수 있습니다.</p>
                </div>

                <div className="bg-secondary border border-border rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>정가</span>
                        <span className="line-through">₩19,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">한정 혜택가</span>
                        <div className="flex items-center gap-2">
                            <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded">63% OFF</span>
                            <span className="text-2xl font-bold text-accent">6,900원</span>
                        </div>
                    </div>
                </div>

                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2 mt-2">
                        <CreditCard className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>결제 즉시 마이페이지에서 템플릿 링크 제공</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>평생 무상 업데이트 및 가이드 지원</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>기록과 성장을 위한 노션 시스템</span>
                    </li>
                </ul>

                <div className="pt-4">
                    <Button
                        onClick={handlePayment}
                        className="w-full bg-accent hover:bg-accent/90 text-primary-foreground font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        disabled={isLoading || hasTemplate}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : hasTemplate ? (
                            <span className="flex items-center gap-2"><Check className="w-5 h-5" /> 이미 소장 중</span>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                6,900원 결제하고 평생 소장하기
                            </>
                        )}
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground mt-4 leading-relaxed">
                        디지털 콘텐츠 특성상 템플릿 복제 후 열람 시<br />환불이 제한될 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
