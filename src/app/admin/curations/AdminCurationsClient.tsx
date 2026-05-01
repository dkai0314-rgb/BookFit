'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SerializedCuration } from './page';

export default function AdminCurationsClient({ initial }: { initial: SerializedCuration[] }) {
    const router = useRouter();
    const [list, setList] = useState<SerializedCuration[]>(initial);
    const [theme, setTheme] = useState('');
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState('');

    const handleCreate = async () => {
        if (!theme.trim()) {
            setMessage('테마를 입력해주세요.');
            return;
        }
        setCreating(true);
        setMessage('Claude가 큐레이션 초안을 생성하는 중입니다... (10~25초)');
        try {
            const res = await fetch('/api/curation/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme }),
            });
            const json = await res.json();
            if (!res.ok || !json?.id) {
                setMessage(json?.error || '생성 실패');
                return;
            }
            setMessage('생성 완료. 편집 화면으로 이동합니다.');
            router.push(`/admin/curations/${json.id}`);
        } catch (e) {
            console.error(e);
            setMessage('네트워크 오류');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠어요? 되돌릴 수 없습니다.')) return;
        try {
            const res = await fetch(`/api/curation/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                alert(json?.error || '삭제 실패');
                return;
            }
            setList((prev) => prev.filter((c) => c.id !== id));
        } catch (e) {
            console.error(e);
            alert('네트워크 오류');
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    큐레이션 Admin
                </h1>
                <p className="text-sm text-gray-600">
                    테마 입력 → Claude 초안 생성 → 편집 → published 전환 워크플로우.
                </p>
            </header>

            <section className="space-y-4 border p-6 rounded-xl shadow-sm bg-white text-gray-900">
                <h2 className="text-xl font-semibold">새 큐레이션 생성</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="테마 (예: '연말 위로받고 싶은 밤에 읽을 책')"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="border p-2 rounded flex-1 focus:ring-2 focus:ring-primary focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && !creating && handleCreate()}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                        {creating ? '생성 중...' : 'Claude로 초안 생성'}
                    </button>
                </div>
                {message && <div className="p-3 bg-gray-100 rounded text-sm text-gray-800">{message}</div>}
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">전체 큐레이션 ({list.length})</h2>
                </div>
                <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
                    <table className="w-full text-sm text-gray-900">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">상태</th>
                                <th className="px-4 py-3 text-left">제목</th>
                                <th className="px-4 py-3 text-left">테마</th>
                                <th className="px-4 py-3 text-left">카테고리</th>
                                <th className="px-4 py-3 text-left">slug</th>
                                <th className="px-4 py-3 text-left">★</th>
                                <th className="px-4 py-3 text-left">책</th>
                                <th className="px-4 py-3 text-left">생성일</th>
                                <th className="px-4 py-3 text-right">액션</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {list.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                        아직 큐레이션이 없습니다. 위에서 첫 큐레이션을 만들어보세요.
                                    </td>
                                </tr>
                            )}
                            {list.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <StatusBadge status={c.status} />
                                    </td>
                                    <td className="px-4 py-3 font-medium max-w-xs truncate">{c.title}</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{c.theme}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.category || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug || '-'}</td>
                                    <td className="px-4 py-3 text-amber-500">{c.isFeatured ? '★' : ''}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.books.length}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <Link
                                            href={`/admin/curations/${c.id}`}
                                            className="text-primary font-medium hover:underline mr-3"
                                        >
                                            편집
                                        </Link>
                                        {c.status === 'published' && c.slug && (
                                            <Link
                                                href={`/curation/${c.slug}`}
                                                target="_blank"
                                                className="text-blue-600 hover:underline mr-3"
                                            >
                                                보기
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleDelete(c.id)}
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
    const isPublished = status === 'published';
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
