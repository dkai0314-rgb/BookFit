'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type User } from 'firebase/auth';
import { Star, Trash2, PenLine } from 'lucide-react';

type Priority = 'P0' | 'P1' | 'P2' | null;

type HighlightEntry = {
    id: string;
    bookId: string;
    quote: string;
    note: string | null;
    priority: Priority;
    isFavorite: boolean;
    createdAt: string;
    book?: { id: string; title: string; author: string } | null;
};

const PRIORITY_LABEL: Record<'P0' | 'P1' | 'P2', string> = {
    P0: '최고',
    P1: '중요',
    P2: '메모',
};

export default function HighlightsTab({ user }: { user: User }) {
    const [highlights, setHighlights] = useState<HighlightEntry[] | null>(null);
    const [favoriteOnly, setFavoriteOnly] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const token = await user.getIdToken();
            const res = await fetch('/api/highlights', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!cancelled) setHighlights(json.highlights || []);
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const toggleFavorite = async (h: HighlightEntry) => {
        setHighlights(
            (prev) => prev?.map((x) => (x.id === h.id ? { ...x, isFavorite: !x.isFavorite } : x)) ?? [],
        );
        const token = await user.getIdToken();
        await fetch('/api/highlights', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id: h.id, isFavorite: !h.isFavorite }),
        });
    };

    const remove = async (id: string) => {
        if (!confirm('이 하이라이트를 삭제할까요?')) return;
        const token = await user.getIdToken();
        const res = await fetch(`/api/highlights?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setHighlights((prev) => prev?.filter((x) => x.id !== id) ?? []);
        }
    };

    const list = (highlights ?? []).filter((h) => !favoriteOnly || h.isFavorite);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    전체 {highlights?.length ?? '...'}개 — 책 상세 페이지에서 바로 남길 수 있어요.
                </p>
                <button
                    onClick={() => setFavoriteOnly((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        favoriteOnly
                            ? 'bg-accent/10 border-accent text-accent'
                            : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Star className="w-3 h-3" /> 즐겨찾기만
                </button>
            </div>

            {highlights === null ? (
                <div className="text-muted-foreground text-center py-12">불러오는 중...</div>
            ) : list.length === 0 ? (
                <div className="text-center py-12 space-y-4 bg-secondary/30 border border-border rounded-xl">
                    <PenLine className="w-8 h-8 mx-auto text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground">
                        아직 남긴 하이라이트가 없어요. 책 상세 페이지에서 인상 깊은 문장을 남겨보세요.
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {list.map((h) => (
                        <li
                            key={h.id}
                            className="bg-background border border-border rounded-xl p-5 space-y-3 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    {h.book ? (
                                        <Link
                                            href={`/books/${h.book.id}`}
                                            className="text-sm font-semibold text-accent hover:underline"
                                        >
                                            {h.book.title}
                                        </Link>
                                    ) : null}
                                    {h.priority && (
                                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            {PRIORITY_LABEL[h.priority]}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => toggleFavorite(h)} aria-label="즐겨찾기">
                                        <Star
                                            className={`w-4 h-4 ${
                                                h.isFavorite
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-muted-foreground'
                                            }`}
                                        />
                                    </button>
                                    <button
                                        onClick={() => remove(h.id)}
                                        className="text-muted-foreground hover:text-destructive"
                                        aria-label="삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-foreground/90 italic break-keep leading-relaxed">
                                &ldquo;{h.quote}&rdquo;
                            </p>
                            {h.note && (
                                <p className="text-sm text-muted-foreground break-keep leading-relaxed border-l-2 border-accent/30 pl-3">
                                    {h.note}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
