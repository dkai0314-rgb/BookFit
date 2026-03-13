'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ERROR_MESSAGES: Record<string, string> = {
    missing_params: '결제 정보가 올바르지 않습니다.',
    network_error: '네트워크 오류가 발생했습니다.',
    unknown: '알 수 없는 오류가 발생했습니다.',
};

function FailContent() {
    const params = useSearchParams();
    const reason = params.get('reason') || 'unknown';
    const message = ERROR_MESSAGES[reason] || `오류가 발생했습니다. (${reason})`;

    return (
        <div className="text-center text-foreground space-y-6 max-w-sm w-full">
            <p className="text-5xl">😅</p>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-rose-500">결제 실패</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-4 text-left">
                <p className="text-xs text-muted-foreground font-mono">오류 코드: {reason}</p>
            </div>
            <div className="flex flex-col gap-3">
                <Link
                    href="/template"
                    className="w-full bg-accent text-primary-foreground hover:bg-accent/80 transition-colors py-3 rounded-xl font-bold text-center block"
                >
                    다시 시도하기
                </Link>
                <Link
                    href="/"
                    className="w-full text-muted-foreground hover:text-foreground transition-colors py-2 text-sm text-center block"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        </div>
    );
}

export default function PaymentFailPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Suspense fallback={<div className="text-muted-foreground">로딩 중...</div>}>
                <FailContent />
            </Suspense>
        </div>
    );
}
