'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Sparkles, BookOpen } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

type Recommendation = { title: string; author: string; reason: string };

type Response = {
    eligible: boolean;
    cached?: boolean;
    shelfCount: number;
    minRequired?: number;
    recommendations: Recommendation[];
};

export default function PersonalRecommendWidget() {
    const [user, setUser] = useState<User | null>(null);
    const [data, setData] = useState<Response | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!u) setLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/personal-recommend', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (!cancelled) {
                    if (!res.ok) {
                        setError(json?.error || '추천을 불러오지 못했어요.');
                    } else {
                        setData(json);
                        if (json.eligible) {
                            trackEvent({
                                name: 'personal_recommend_view',
                                cached: !!json.cached,
                            });
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) setError('네트워크 오류');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    if (!user) return null;

    return (
        <section className="bg-secondary/40 border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <header className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Personal AI
                    </div>
                    <h2 className="text-xl font-bold">당신을 위한 다음 책</h2>
                </div>
                <Link href="/mypage/library" className="text-xs text-muted-foreground hover:underline">
                    내 서재 →
                </Link>
            </header>

            {loading && (
                <div className="text-sm text-muted-foreground py-6 text-center">불러오는 중...</div>
            )}

            {!loading && error && (
                <div className="text-sm text-destructive">{error}</div>
            )}

            {!loading && data && !data.eligible && (
                <div className="text-center py-6 space-y-2">
                    <p className="text-sm text-muted-foreground">
                        북마크 {data.minRequired ?? 5}권 이상 모이면 Claude가 다음 한 권을 골라드려요.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        지금 {data.shelfCount}권 — 책 상세 페이지에서 추가해보세요.
                    </p>
                </div>
            )}

            {!loading && data && data.eligible && data.recommendations.length === 0 && (
                <div className="text-sm text-muted-foreground py-6 text-center">
                    추천을 가져오지 못했어요. 잠시 후 다시 열어주세요.
                </div>
            )}

            {!loading && data && data.eligible && data.recommendations.length > 0 && (
                <ul className="space-y-3">
                    {data.recommendations.map((r, i) => (
                        <li
                            key={`${r.title}-${i}`}
                            className="bg-background border border-border rounded-lg p-4 flex gap-3"
                        >
                            <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                                {i + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <h3 className="font-bold leading-tight">{r.title}</h3>
                                    <span className="text-xs text-muted-foreground">{r.author}</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed break-keep">
                                    {r.reason}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!loading && data?.cached && (
                <div className="text-xs text-muted-foreground text-right">
                    캐시된 추천 (24시간 유지) <BookOpen className="w-3 h-3 inline" />
                </div>
            )}
        </section>
    );
}
