'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SerializedLetterRow } from './page';

type Mode = 'idle' | 'weekly' | 'monthly_pick';

const KIND_LABEL = {
    weekly: '이주의 한 권',
    monthly_pick: '이달의 픽 (3권)',
    special: '스페셜',
} as const;

interface BookMeta {
    title: string;
    authors: string[];
    publisher: string;
    publishedDate: string;
    isbn13: string | null;
    categories: string[];
    coverImageUrl: string;
    sourceId: string;
    sourceText: string;
}

export default function AdminLettersClient({
    initial,
}: {
    initial: SerializedLetterRow[];
}) {
    const router = useRouter();
    const [list, setList] = useState<SerializedLetterRow[]>(initial);
    const [mode, setMode] = useState<Mode>('idle');
    const [theme, setTheme] = useState('');
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BookMeta[]>([]);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

    const generateMonthly = async () => {
        if (!theme.trim()) {
            setMessage('테마를 입력해주세요.');
            return;
        }
        setBusy(true);
        setMessage('Claude가 이달의 픽 회차를 작성하는 중입니다... (15~30초)');
        try {
            const res = await fetch('/api/letter/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kind: 'monthly_pick', theme }),
            });
            const json = await res.json();
            if (!res.ok || !json?.letter?.slug) {
                setMessage(json?.error || '생성 실패');
                return;
            }
            setMessage('생성 완료. 편집 화면으로 이동합니다.');
            router.push(`/admin/letters/${json.letter.slug}`);
        } catch (e) {
            console.error(e);
            setMessage('네트워크 오류');
        } finally {
            setBusy(false);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) return;
        setBusy(true);
        setSearchResults([]);
        setMessage('');
        try {
            const res = await fetch(
                `/api/bookfit-letter/search?q=${encodeURIComponent(query)}`,
            );
            const json = await res.json();
            if (json.success) {
                setSearchResults(json.data as BookMeta[]);
            } else {
                setMessage(json.error || '검색 실패');
            }
        } catch {
            setMessage('네트워크 오류');
        } finally {
            setBusy(false);
        }
    };

    const generateWeekly = async (book: BookMeta) => {
        setBusy(true);
        setMessage(`Claude가 "${book.title}" 단권 레터 초안을 작성하는 중... (10~20초)`);
        try {
            const res = await fetch('/api/letter/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kind: 'weekly', book }),
            });
            const json = await res.json();
            if (!res.ok || !json?.letter?.slug) {
                setMessage(json?.error || '생성 실패');
                return;
            }
            setMessage('생성 완료. 편집 화면으로 이동합니다.');
            router.push(`/admin/letters/${json.letter.slug}`);
        } catch (e) {
            console.error(e);
            setMessage('네트워크 오류');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm('정말 삭제하시겠어요? 되돌릴 수 없습니다.')) return;
        try {
            const res = await fetch(`/api/letter/${encodeURIComponent(slug)}`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                alert(json?.error || '삭제 실패');
                return;
            }
            setList((prev) => prev.filter((l) => l.slug !== slug));
        } catch (e) {
            console.error(e);
            alert('네트워크 오류');
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans text-gray-900">
            <header className="space-y-2">
                <Link href="/admin" className="text-sm text-gray-500 hover:underline">
                    ← Admin 대시보드
                </Link>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    북핏레터 Admin
                </h1>
                <p className="text-sm text-gray-600">
                    이달의 픽 (큐레이션 3권) ↔ 이주의 한 권 (단권) ↔ 스페셜 — 한 곳에서 발행.
                </p>
            </header>

            <section className="space-y-4 border p-6 rounded-xl shadow-sm bg-white">
                <h2 className="text-xl font-semibold">새 회차 생성</h2>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => {
                            setMode('weekly');
                            setMessage('');
                        }}
                        className={`px-4 py-2 rounded-md font-medium border ${
                            mode === 'weekly'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border text-foreground hover:border-primary'
                        }`}
                    >
                        📖 이주의 한 권 (단권)
                    </button>
                    <button
                        onClick={() => {
                            setMode('monthly_pick');
                            setMessage('');
                        }}
                        className={`px-4 py-2 rounded-md font-medium border ${
                            mode === 'monthly_pick'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border text-foreground hover:border-primary'
                        }`}
                    >
                        ✨ 이달의 픽 (3권 큐레이션)
                    </button>
                </div>

                {mode === 'monthly_pick' && (
                    <div className="space-y-3 pt-2">
                        <input
                            type="text"
                            placeholder="테마 (예: '연말 위로받고 싶은 밤에 읽을 책')"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="border p-2 rounded w-full focus:ring-2 focus:ring-primary focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && !busy && generateMonthly()}
                        />
                        <button
                            onClick={generateMonthly}
                            disabled={busy}
                            className="bg-accent text-primary-foreground px-6 py-2 rounded font-bold hover:bg-accent/90 disabled:opacity-50"
                        >
                            {busy ? '생성 중...' : 'Claude로 회차 초안 생성'}
                        </button>
                    </div>
                )}

                {mode === 'weekly' && (
                    <div className="space-y-3 pt-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="알라딘에서 책 검색 (제목/키워드)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="border p-2 rounded flex-1 focus:ring-2 focus:ring-primary focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && !busy && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={busy}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
                            >
                                {busy ? '검색 중...' : '검색'}
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="space-y-2 mt-3">
                                {searchResults.map((b) => (
                                    <div
                                        key={b.sourceId}
                                        className="flex gap-3 p-3 border rounded bg-white items-center"
                                    >
                                        {b.coverImageUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={b.coverImageUrl}
                                                alt=""
                                                className="w-14 h-20 object-cover rounded shadow"
                                            />
                                        ) : (
                                            <div className="w-14 h-20 bg-gray-100 rounded" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold leading-tight truncate">
                                                {b.title}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {b.authors?.join(', ')} · {b.publisher} · {b.publishedDate}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => generateWeekly(b)}
                                            disabled={busy}
                                            className="bg-accent text-primary-foreground px-4 py-2 rounded font-bold hover:bg-accent/90 disabled:opacity-50 shrink-0"
                                        >
                                            초안 생성
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-gray-100 rounded text-sm text-gray-800">
                        {message}
                    </div>
                )}
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">전체 레터 ({list.length})</h2>
                <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">상태</th>
                                <th className="px-4 py-3 text-left">형식</th>
                                <th className="px-4 py-3 text-left">제목</th>
                                <th className="px-4 py-3 text-left">카테고리</th>
                                <th className="px-4 py-3 text-left">slug</th>
                                <th className="px-4 py-3 text-left">★</th>
                                <th className="px-4 py-3 text-left">책</th>
                                <th className="px-4 py-3 text-left">발행일</th>
                                <th className="px-4 py-3 text-right">액션</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {list.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                        아직 레터가 없습니다. 위에서 첫 회차를 만들어보세요.
                                    </td>
                                </tr>
                            )}
                            {list.map((l) => (
                                <tr key={l.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <StatusBadge status={l.status} />
                                    </td>
                                    <td className="px-4 py-3 text-xs">{KIND_LABEL[l.kind]}</td>
                                    <td className="px-4 py-3 font-medium max-w-xs truncate">
                                        {l.headlineTitle || l.title}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{l.category || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{l.slug}</td>
                                    <td className="px-4 py-3 text-amber-500">{l.isFeatured ? '★' : ''}</td>
                                    <td className="px-4 py-3 text-gray-600">{l.bookCount}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {l.publishedAt
                                            ? new Date(l.publishedAt).toLocaleDateString('ko-KR')
                                            : new Date(l.createdAt).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <Link
                                            href={`/admin/letters/${encodeURIComponent(l.slug)}`}
                                            className="text-primary font-medium hover:underline mr-3"
                                        >
                                            편집
                                        </Link>
                                        {(l.status === 'PUBLISHED' || l.status === 'published') && (
                                            <Link
                                                href={`/bookfit-letter/${encodeURIComponent(l.slug)}`}
                                                target="_blank"
                                                className="text-blue-600 hover:underline mr-3"
                                            >
                                                보기
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleDelete(l.slug)}
                                            className="text-red-600 hover:underline"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isPublished = status === 'PUBLISHED' || status === 'published';
    return (
        <span
            className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
            }`}
        >
            {isPublished ? 'published' : 'draft'}
        </span>
    );
}
