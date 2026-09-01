'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { PenLine, Loader2, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function HighlightQuickAdd({ bookId }: { bookId: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [quote, setQuote] = useState('');
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return () => unsub();
    }, []);

    const submit = async () => {
        if (!user || !quote.trim()) return;
        setBusy(true);
        setError(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/highlights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bookId, quote, note: note || null }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json?.error || '저장 실패');
                return;
            }
            trackEvent({ name: 'highlight_add', bookId });
            setQuote('');
            setNote('');
            setSaved(true);
            setOpen(false);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error(e);
            setError('네트워크 오류');
        } finally {
            setBusy(false);
        }
    };

    if (authLoading) {
        return <div className="h-11 w-full bg-secondary rounded-md animate-pulse" />;
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="block w-full text-center bg-secondary border border-border rounded-md py-3 text-sm font-medium text-muted-foreground hover:bg-accent/5 hover:border-accent transition-all"
            >
                로그인하고 하이라이트 남기기
            </Link>
        );
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold text-sm border border-border bg-background text-foreground hover:bg-secondary hover:border-accent/40 transition-all"
            >
                <PenLine className="w-4 h-4" /> 인상 깊은 문장 남기기
            </button>
        );
    }

    return (
        <div className="space-y-2 border border-border rounded-md p-4 bg-secondary/30">
            <textarea
                rows={3}
                placeholder="인상 깊었던 문장을 옮겨 적어보세요"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full border border-border rounded p-2 text-sm bg-background"
                autoFocus
            />
            <textarea
                rows={2}
                placeholder="이 문장에 대한 내 생각 (선택)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-border rounded p-2 text-sm bg-background"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={busy || !quote.trim()}
                    onClick={submit}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded bg-accent text-primary-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-60"
                >
                    {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} 저장
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary"
                >
                    취소
                </button>
            </div>
            {saved && <p className="text-xs text-accent">하이라이트가 저장되었습니다.</p>}
        </div>
    );
}
