'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function TestEmailButton() {
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

    const send = async () => {
        setBusy(true);
        setResult(null);
        try {
            const res = await fetch('/api/admin/test-email', { method: 'POST' });
            const json = await res.json();
            if (json.ok) {
                setResult({ ok: true, text: '✅ 테스트 이메일 발송 완료. 받은편지함(또는 스팸함)을 확인하세요.' });
            } else {
                setResult({ ok: false, text: `❌ 발송 실패: ${json.error}` });
            }
        } catch (e) {
            setResult({ ok: false, text: `❌ 네트워크 오류: ${e instanceof Error ? e.message : String(e)}` });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={send}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 bg-white text-sm font-medium hover:border-primary hover:text-primary transition-all disabled:opacity-50"
            >
                <Mail className="w-4 h-4" />
                {busy ? '발송 중...' : '이메일 연결 테스트'}
            </button>
            {result && (
                <div
                    className={`text-xs px-3 py-2 rounded border ${
                        result.ok
                            ? 'bg-green-50 border-green-200 text-green-900'
                            : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                >
                    {result.text}
                </div>
            )}
        </div>
    );
}
