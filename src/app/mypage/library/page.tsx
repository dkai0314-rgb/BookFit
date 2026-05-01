'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/Header';
import { Bookmark, BookOpen, CheckCircle, X, Edit2, Save } from 'lucide-react';

type Status = 'want' | 'reading' | 'done';

type Entry = {
    id: string;
    bookId: string;
    status: Status;
    rating: number | null;
    oneLiner: string | null;
    updatedAt: string;
    book: {
        id: string;
        title: string;
        author: string;
        imageUrl: string | null;
    };
};

const TABS: { value: Status; label: string; icon: typeof Bookmark }[] = [
    { value: 'want', label: '읽고 싶음', icon: Bookmark },
    { value: 'reading', label: '읽는 중', icon: BookOpen },
    { value: 'done', label: '완독', icon: CheckCircle },
];

export default function LibraryPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [entries, setEntries] = useState<Entry[] | null>(null);
    const [activeTab, setActiveTab] = useState<Status>('want');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftLine, setDraftLine] = useState('');
    const [draftRating, setDraftRating] = useState<number>(0);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) {
                router.push('/login');
                return;
            }
            setUser(u);
            setAuthLoading(false);
        });
        return () => unsub();
    }, [router]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            const token = await user.getIdToken();
            const res = await fetch('/api/shelf', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!cancelled) setEntries(json.entries || []);
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const filtered = entries?.filter((e) => e.status === activeTab) ?? [];

    const handleRemove = async (bookId: string) => {
        if (!user) return;
        if (!confirm('내 서재에서 제거할까요?')) return;
        const token = await user.getIdToken();
        const res = await fetch(`/api/shelf?bookId=${encodeURIComponent(bookId)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setEntries((prev) => prev?.filter((e) => e.bookId !== bookId) ?? []);
        }
    };

    const startEdit = (entry: Entry) => {
        setEditingId(entry.id);
        setDraftLine(entry.oneLiner || '');
        setDraftRating(entry.rating || 0);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraftLine('');
        setDraftRating(0);
    };

    const saveEdit = async (entry: Entry) => {
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch('/api/shelf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                bookId: entry.bookId,
                status: entry.status,
                rating: draftRating || null,
                oneLiner: draftLine || null,
            }),
        });
        if (res.ok) {
            const json = await res.json();
            setEntries((prev) =>
                prev?.map((e) =>
                    e.id === entry.id
                        ? {
                              ...e,
                              rating: json.entry.rating,
                              oneLiner: json.entry.oneLiner,
                              updatedAt: json.entry.updatedAt,
                          }
                        : e,
                ) ?? [],
            );
            cancelEdit();
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full mt-20">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/mypage" className="text-sm text-muted-foreground hover:underline">
                            ← 마이페이지
                        </Link>
                        <h1 className="text-3xl font-bold mt-1">내 서재</h1>
                        <p className="text-muted-foreground mt-1">
                            전체 {entries?.length ?? '...'}권 — 책 상세 페이지에서 담을 수 있어요.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 border-b border-border mb-8">
                    {TABS.map((t) => {
                        const Icon = t.icon;
                        const count = entries?.filter((e) => e.status === t.value).length ?? 0;
                        const active = activeTab === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => setActiveTab(t.value)}
                                className={`px-4 py-3 text-sm font-medium inline-flex items-center gap-2 border-b-2 transition-all ${
                                    active
                                        ? 'border-accent text-accent'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4" /> {t.label}
                                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {entries === null ? (
                    <div className="text-muted-foreground text-center py-12">불러오는 중...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 space-y-4 bg-secondary/30 border border-border rounded-xl">
                        <p className="text-muted-foreground">
                            아직 이 칸이 비어있어요. 책 상세 페이지에서 담아보세요.
                        </p>
                        <Link
                            href="/recommend"
                            className="inline-block px-5 py-2 rounded-md bg-accent text-primary-foreground font-medium hover:bg-accent/90"
                        >
                            추천 받으러 가기
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {filtered.map((entry) => (
                            <li
                                key={entry.id}
                                className="bg-background border border-border rounded-xl p-5 flex flex-col md:flex-row gap-5 shadow-sm"
                            >
                                <Link href={`/books/${entry.bookId}`} className="md:w-28 shrink-0">
                                    <div className="aspect-[1/1.5] relative rounded-md overflow-hidden bg-muted shadow-sm border border-border">
                                        {entry.book.imageUrl ? (
                                            <Image
                                                src={entry.book.imageUrl
                                                    .replace('coversum', 'cover500')
                                                    .replace(/^http:/i, 'https:')}
                                                alt={entry.book.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <BookOpen className="w-6 h-6 opacity-30" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1 space-y-2">
                                    <Link href={`/books/${entry.bookId}`} className="block group">
                                        <h3 className="text-lg font-bold leading-tight group-hover:text-accent transition-colors break-keep line-clamp-2">
                                            {entry.book.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{entry.book.author}</p>
                                    </Link>

                                    {editingId === entry.id ? (
                                        <div className="space-y-2 pt-2">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        onClick={() => setDraftRating(draftRating === n ? 0 : n)}
                                                        className="text-xl"
                                                    >
                                                        {draftRating >= n ? '★' : '☆'}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                rows={2}
                                                placeholder="한 줄 리뷰 (본인만 보입니다)"
                                                value={draftLine}
                                                onChange={(e) => setDraftLine(e.target.value)}
                                                className="w-full border border-border rounded p-2 text-sm bg-background"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => saveEdit(entry)}
                                                    className="inline-flex items-center gap-1 px-4 py-2 rounded bg-accent text-primary-foreground text-sm font-medium hover:bg-accent/90"
                                                >
                                                    <Save className="w-3 h-3" /> 저장
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 pt-1">
                                            {entry.rating ? (
                                                <div className="text-amber-500 text-sm">
                                                    {'★'.repeat(entry.rating)}
                                                    <span className="text-muted-foreground">
                                                        {'☆'.repeat(5 - entry.rating)}
                                                    </span>
                                                </div>
                                            ) : null}
                                            {entry.oneLiner ? (
                                                <p className="text-sm text-foreground/80 italic break-keep">
                                                    &ldquo;{entry.oneLiner}&rdquo;
                                                </p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">
                                                    한 줄 리뷰가 없어요. 편집해서 남겨보세요.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="md:w-28 shrink-0 flex md:flex-col gap-2 items-end justify-end">
                                    {editingId !== entry.id && (
                                        <button
                                            onClick={() => startEdit(entry)}
                                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            <Edit2 className="w-3 h-3" /> 편집
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemove(entry.bookId)}
                                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-3 h-3" /> 제거
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}
