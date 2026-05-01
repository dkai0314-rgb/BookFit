'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Bookmark, BookOpen, CheckCircle, X } from 'lucide-react';

type Status = 'want' | 'reading' | 'done';

const OPTIONS: { value: Status; label: string; icon: typeof Bookmark }[] = [
    { value: 'want', label: '읽고 싶음', icon: Bookmark },
    { value: 'reading', label: '읽는 중', icon: BookOpen },
    { value: 'done', label: '완독', icon: CheckCircle },
];

export default function ShelfButton({ bookId }: { bookId: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [status, setStatus] = useState<Status | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            try {
                const token = await user.getIdToken();
                const res = await fetch(`/api/shelf?bookId=${encodeURIComponent(bookId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled && json.entry?.status) {
                    setStatus(json.entry.status as Status);
                }
            } catch (e) {
                console.error(e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user, bookId]);

    const setShelfStatus = async (next: Status) => {
        if (!user) return;
        setBusy(true);
        setError(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/shelf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bookId, status: next }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json?.error || '저장 실패');
                return;
            }
            setStatus(next);
        } catch (e) {
            console.error(e);
            setError('네트워크 오류');
        } finally {
            setBusy(false);
        }
    };

    const removeFromShelf = async () => {
        if (!user || !status) return;
        setBusy(true);
        setError(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/shelf?bookId=${encodeURIComponent(bookId)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const json = await res.json();
                setError(json?.error || '삭제 실패');
                return;
            }
            setStatus(null);
        } catch (e) {
            console.error(e);
            setError('네트워크 오류');
        } finally {
            setBusy(false);
        }
    };

    if (authLoading) {
        return <div className="h-12 w-full bg-secondary rounded-md animate-pulse" />;
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="block w-full text-center bg-secondary border border-border rounded-md py-3 text-sm font-medium text-muted-foreground hover:bg-accent/5 hover:border-accent transition-all"
            >
                로그인하고 내 서재에 담기
            </Link>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
                {OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = status === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            disabled={busy}
                            onClick={() => setShelfStatus(opt.value)}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold text-sm transition-all border ${
                                active
                                    ? 'bg-accent text-primary-foreground border-accent shadow-md'
                                    : 'bg-background border-border text-foreground hover:bg-secondary hover:border-accent/40'
                            } ${busy ? 'opacity-60' : ''}`}
                        >
                            <Icon className="w-4 h-4" />
                            {opt.label}
                        </button>
                    );
                })}
            </div>
            {status && (
                <button
                    type="button"
                    disabled={busy}
                    onClick={removeFromShelf}
                    className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                    <X className="w-3 h-3" /> 내 서재에서 제거
                </button>
            )}
            {error && <div className="text-xs text-destructive">{error}</div>}
            {status && !error && (
                <div className="text-xs text-muted-foreground text-center">
                    <Link href="/mypage/library" className="hover:underline">
                        내 서재에서 보기 →
                    </Link>
                </div>
            )}
        </div>
    );
}
