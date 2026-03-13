'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        const confirm = async () => {
            const paymentKey = params.get('paymentKey');
            const orderId = params.get('orderId');
            const amount = params.get('amount');
            const userId = params.get('userId');
            const userEmail = params.get('userEmail');
            const userName = params.get('userName');

            console.log('[결제 성공 페이지] 수신 파라미터:', { orderId, amount });

            if (!paymentKey || !orderId || !amount) {
                router.replace('/payment/fail?reason=missing_params');
                return;
            }

            try {
                const res = await fetch('/api/payment/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentKey,
                        orderId,
                        amount: Number(amount),
                        userId,
                        userEmail,
                        userName,
                    }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    // 결제 성공 시 마이페이지로 이동 (구매 확인 메시지 포함)
                    router.replace('/mypage?purchased=true');
                } else {
                    const errorCode = data.error?.code || data.error || 'unknown';
                    router.replace(`/payment/fail?reason=${errorCode}`);
                }
            } catch (e) {
                console.error('[결제 성공 페이지] 오류:', e);
                router.replace('/payment/fail?reason=network_error');
            }
        };

        confirm();
    }, [params, router]);

    return (
        <div className="text-center text-foreground space-y-4">
            <p className="text-4xl animate-bounce">📚</p>
            <p className="text-xl font-bold">결제 확인 중입니다...</p>
            <p className="text-muted-foreground text-sm">잠시만 기다려주세요</p>
            <div className="w-8 h-8 mx-auto border-4 border-accent border-t-transparent rounded-full animate-spin mt-4" />
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Suspense fallback={
                <div className="text-center text-foreground space-y-4">
                    <p className="text-4xl">📚</p>
                    <p className="text-muted-foreground text-sm">로딩 중...</p>
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
