'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type User } from 'firebase/auth';
import { Bookmark, BookOpen, CheckCircle, X, Edit2, Save, Plus, Loader2 } from 'lucide-react';

type Status = 'want' | 'reading' | 'done';
type Format = 'ebook' | 'paper';

type Entry = {
    id: string;
    bookId: string;
    status: Status;
    rating: number | null;
    oneLiner: string | null;
    format: Format | null;
    startedAt: string | null;
    finishedAt: string | null;
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

function fmtDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function daysBetween(startIso: string, endIso: string): number {
    const start = new Date(startIso);
    const end = new Date(endIso);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export default function ShelfTab({ user }: { user: User }) {
    const [entries, setEntries] = useState<Entry[] | null>(null);
    const [activeTab, setActiveTab] = useState<Status>('want');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftLine, setDraftLine] = useState('');
    const [draftRating, setDraftRating] = useState<number>(0);

    const [addOpen, setAddOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [newFormat, setNewFormat] = useState<Format>('paper');
    const [newStatus, setNewStatus] = useState<Status>('want');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
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
                prev?.map((e) => (e.id === entry.id ? { ...e, ...json.entry } : e)) ?? [],
            );
            cancelEdit();
        }
    };

    const changeStatus = async (entry: Entry, status: Status) => {
        if (status === entry.status) return;
        const token = await user.getIdToken();
        const res = await fetch('/api/shelf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ bookId: entry.bookId, status }),
        });
        if (res.ok) {
            const json = await res.json();
            setEntries((prev) =>
                prev?.map((e) => (e.id === entry.id ? { ...e, ...json.entry } : e)) ?? [],
            );
        }
    };

    const changeFormat = async (entry: Entry, format: Format) => {
        const token = await user.getIdToken();
        const res = await fetch('/api/shelf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ bookId: entry.bookId, status: entry.status, format }),
        });
        if (res.ok) {
            const json = await res.json();
            setEntries((prev) =>
                prev?.map((e) => (e.id === entry.id ? { ...e, ...json.entry } : e)) ?? [],
            );
        }
    };

    const addManualBook = async () => {
        if (!newTitle.trim() || !newAuthor.trim()) return;
        setAdding(true);
        setAddError(null);
        try {
            const token = await user.getIdToken();
            const bookRes = await fetch('/api/books/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title: newTitle.trim(), author: newAuthor.trim() }),
            });
            const bookJson = await bookRes.json();
            if (!bookRes.ok) {
                setAddError(bookJson?.error || '책 등록 실패');
                return;
            }

            const shelfRes = await fetch('/api/shelf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bookId: bookJson.book.id, status: newStatus, format: newFormat }),
            });
            const shelfJson = await shelfRes.json();
            if (!shelfRes.ok) {
                setAddError(shelfJson?.error || '서재 등록 실패');
                return;
            }

            setEntries((prev) => [shelfJson.entry, ...(prev ?? [])]);
            setActiveTab(newStatus);
            setNewTitle('');
            setNewAuthor('');
            setNewFormat('paper');
            setNewStatus('want');
            setAddOpen(false);
        } catch (e) {
            console.error(e);
            setAddError('네트워크 오류');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm">
                    전체 {entries?.length ?? '...'}권 — 책 상세 페이지에서 담거나, 직접 추가할 수 있어요.
                </p>
                <button
                    onClick={() => setAddOpen((v) => !v)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-primary-foreground hover:bg-accent/90"
                >
                    <Plus className="w-3.5 h-3.5" /> 책 직접 추가
                </button>
            </div>

            {addOpen && (
                <div className="mb-6 border border-border rounded-xl p-5 bg-secondary/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="책 제목"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="border border-border rounded p-2 text-sm bg-background"
                        />
                        <input
                            type="text"
                            placeholder="저자"
                            value={newAuthor}
                            onChange={(e) => setNewAuthor(e.target.value)}
                            className="border border-border rounded p-2 text-sm bg-background"
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap items-center">
                        <select
                            value={newFormat}
                            onChange={(e) => setNewFormat(e.target.value as Format)}
                            className="border border-border rounded p-2 text-sm bg-background"
                        >
                            <option value="paper">종이책</option>
                            <option value="ebook">전자책</option>
                        </select>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as Status)}
                            className="border border-border rounded p-2 text-sm bg-background"
                        >
                            <option value="want">읽고 싶음</option>
                            <option value="reading">읽는 중</option>
                            <option value="done">완독</option>
                        </select>
                    </div>
                    {addError && <p className="text-xs text-destructive">{addError}</p>}
                    <div className="flex gap-2">
                        <button
                            disabled={adding || !newTitle.trim() || !newAuthor.trim()}
                            onClick={addManualBook}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded bg-accent text-primary-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-60"
                        >
                            {adding && <Loader2 className="w-3 h-3 animate-spin" />} 추가
                        </button>
                        <button
                            onClick={() => setAddOpen(false)}
                            className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-2 mb-6">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    const count = entries?.filter((e) => e.status === t.value).length ?? 0;
                    const active = activeTab === t.value;
                    return (
                        <button
                            key={t.value}
                            onClick={() => setActiveTab(t.value)}
                            className={`px-3 py-2 text-sm rounded-full font-medium inline-flex items-center gap-1.5 border transition-all ${
                                active
                                    ? 'bg-accent/10 border-accent text-accent'
                                    : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" /> {t.label}
                            <span className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">{count}</span>
                        </button>
                    );
                })}
            </div>

            {entries === null ? (
                <div className="text-muted-foreground text-center py-12">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 space-y-4 bg-secondary/30 border border-border rounded-xl">
                    <p className="text-muted-foreground">
                        아직 이 칸이 비어있어요. 책 상세 페이지에서 담거나 직접 추가해보세요.
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
                            <div className="flex-1 space-y-3 min-w-0">
                                <div>
                                    <Link href={`/books/${entry.bookId}`} className="block group">
                                        <h3 className="text-lg font-bold leading-tight group-hover:text-accent transition-colors break-keep line-clamp-2">
                                            {entry.book.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{entry.book.author}</p>
                                    </Link>
                                </div>

                                {/* 상태 변경 */}
                                <div className="flex gap-1.5 flex-wrap">
                                    {TABS.map((t) => {
                                        const Icon = t.icon;
                                        const active = entry.status === t.value;
                                        return (
                                            <button
                                                key={t.value}
                                                onClick={() => changeStatus(entry, t.value)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                                    active
                                                        ? 'bg-accent text-primary-foreground border-accent'
                                                        : 'border-border text-muted-foreground hover:border-accent/40'
                                                }`}
                                            >
                                                <Icon className="w-3 h-3" /> {t.label}
                                            </button>
                                        );
                                    })}
                                    <select
                                        value={entry.format ?? ''}
                                        onChange={(e) => changeFormat(entry, e.target.value as Format)}
                                        className="text-xs border border-border rounded-full px-2 py-1 bg-background text-muted-foreground"
                                    >
                                        <option value="" disabled>
                                            책 종류
                                        </option>
                                        <option value="paper">종이책</option>
                                        <option value="ebook">전자책</option>
                                    </select>
                                </div>

                                {/* 날짜 / 소요기간 */}
                                {entry.status === 'reading' && entry.startedAt && (
                                    <p className="text-xs text-muted-foreground">
                                        {fmtDate(entry.startedAt)}부터 읽는 중
                                    </p>
                                )}
                                {entry.status === 'done' && entry.startedAt && entry.finishedAt && (
                                    <p className="text-xs text-muted-foreground">
                                        {fmtDate(entry.startedAt)} ~ {fmtDate(entry.finishedAt)} ·{' '}
                                        {(() => {
                                            const days = daysBetween(entry.startedAt, entry.finishedAt);
                                            return days <= 0 ? '당일 완독' : `${days}일 만에 완독`;
                                        })()}
                                    </p>
                                )}

                                {editingId === entry.id ? (
                                    <div className="space-y-2">
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
                                    <div className="space-y-1">
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
                            <div className="md:w-24 shrink-0 flex md:flex-col gap-2 items-end justify-start">
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
        </div>
    );
}
