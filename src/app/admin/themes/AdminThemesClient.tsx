'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SerializedTheme } from './page';

type LetterKind = 'weekly' | 'monthly_pick' | 'special';

const KIND_LABEL: Record<LetterKind, string> = {
    weekly: '이주의 한 권',
    monthly_pick: '이달의 픽 (3권)',
    special: '스페셜',
};

export default function AdminThemesClient({
    initial,
    dbError,
}: {
    initial: SerializedTheme[];
    dbError: string | null;
}) {
    const router = useRouter();
    const [list, setList] = useState<SerializedTheme[]>(initial);
    const [theme, setTheme] = useState('');
    const [kind, setKind] = useState<LetterKind>('monthly_pick');
    const [priority, setPriority] = useState<number>(100);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [triggerBusy, setTriggerBusy] = useState(false);
    const [triggerMessage, setTriggerMessage] = useState<{
        kind: 'success' | 'error' | 'info';
        text: string;
        link?: string;
    } | null>(null);

    const triggerNow = async () => {
        if (
            !confirm(
                '지금 즉시 cron을 수동 실행합니다.\n\n다음 미사용 테마 1개로 Claude가 회차 draft를 만들고, 운영자 메일이 발송됩니다.\n진행할까요?',
            )
        )
            return;
        setTriggerBusy(true);
        setTriggerMessage({ kind: 'info', text: 'Claude가 회차를 작성하는 중... (15~30초)' });
        try {
            const res = await fetch('/api/admin/trigger-weekly-draft', { method: 'POST' });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setTriggerMessage({
                    kind: 'error',
                    text: json.reason || json.error || '실행 실패',
                });
                return;
            }
            const emailStatus = json.notifyOk
                ? '✅ 운영자 이메일 발송 완료'
                : `⚠️ 이메일 발송 실패: ${json.notifyError || '알 수 없는 오류'}`;
            setTriggerMessage({
                kind: json.notifyOk ? 'success' : 'error',
                text: `Draft 생성 완료! 테마: "${json.theme}"\n${emailStatus}`,
                link: `/admin/letters/${encodeURIComponent(json.letterSlug)}`,
            });
            // 테마 목록 새로고침 (used 상태 반영)
            router.refresh();
        } catch (e) {
            console.error(e);
            setTriggerMessage({ kind: 'error', text: '네트워크 오류' });
        } finally {
            setTriggerBusy(false);
        }
    };

    const refresh = async () => {
        try {
            const res = await fetch('/api/admin/themes');
            const json = await res.json();
            if (Array.isArray(json.themes)) setList(json.themes);
        } catch (e) {
            console.error(e);
        }
    };

    const create = async () => {
        if (!theme.trim()) {
            setMessage('테마 텍스트를 입력해주세요.');
            return;
        }
        setBusy(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/themes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme, kind, priority, note: note || null }),
            });
            const json = await res.json();
            if (!res.ok) {
                setMessage(json.error || '생성 실패');
                return;
            }
            setTheme('');
            setNote('');
            setPriority(100);
            await refresh();
            setMessage('등록 완료');
        } catch (e) {
            console.error(e);
            setMessage('네트워크 오류');
        } finally {
            setBusy(false);
        }
    };

    const remove = async (id: string) => {
        if (!confirm('정말 삭제하시겠어요?')) return;
        try {
            const res = await fetch(`/api/admin/themes/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                alert(json?.error || '삭제 실패');
                return;
            }
            setList((prev) => prev.filter((t) => t.id !== id));
        } catch (e) {
            console.error(e);
            alert('네트워크 오류');
        }
    };

    const updatePriority = async (id: string, value: number) => {
        try {
            await fetch(`/api/admin/themes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: value }),
            });
            setList((prev) =>
                prev
                    .map((t) => (t.id === id ? { ...t, priority: value } : t))
                    .sort((a, b) =>
                        a.priority !== b.priority
                            ? a.priority - b.priority
                            : a.createdAt.localeCompare(b.createdAt),
                    ),
            );
        } catch (e) {
            console.error(e);
        }
    };

    const toggleUsed = async (id: string, current: boolean) => {
        try {
            await fetch(`/api/admin/themes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ used: !current }),
            });
            setList((prev) => prev.map((t) => (t.id === id ? { ...t, used: !current } : t)));
        } catch (e) {
            console.error(e);
        }
    };

    if (dbError) {
        return (
            <div className="p-8 max-w-2xl mx-auto space-y-4 font-sans text-gray-900">
                <Link href="/admin" className="text-sm text-gray-500 hover:underline">
                    ← Admin 대시보드
                </Link>
                <h1 className="text-2xl font-bold text-red-600">Firestore 연결 실패</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm font-mono text-red-900 break-all">
                    {dbError}
                </div>
            </div>
        );
    }

    const unused = list.filter((t) => !t.used);
    const used = list.filter((t) => t.used);
    const nextTheme = unused[0];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans text-gray-900">
            <header className="space-y-2">
                <Link href="/admin" className="text-sm text-gray-500 hover:underline">
                    ← Admin 대시보드
                </Link>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    테마 풀
                </h1>
                <p className="text-sm text-gray-600">
                    매주 일요일 23:00에 미사용 테마 1개가 자동으로 draft로 변환됩니다. 우선순위 낮은 순(같으면 오래된 순)으로 선택.
                </p>
            </header>

            {nextTheme && (
                <section className="border border-accent/30 bg-accent/5 rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-1">
                            <div className="text-xs font-bold uppercase tracking-widest text-accent">
                                다음 cron이 가져갈 테마
                            </div>
                            <div className="text-lg font-bold">{nextTheme.theme}</div>
                            <div className="text-xs text-gray-600">
                                형식: {KIND_LABEL[nextTheme.kind]} · 우선순위: {nextTheme.priority}
                                {nextTheme.note ? ` · ${nextTheme.note}` : ''}
                            </div>
                        </div>
                        <button
                            onClick={triggerNow}
                            disabled={triggerBusy || nextTheme.kind === 'weekly'}
                            className="shrink-0 px-5 py-2.5 rounded-md bg-accent text-primary-foreground font-bold hover:bg-accent/90 disabled:opacity-50 text-sm"
                            title={
                                nextTheme.kind === 'weekly'
                                    ? 'weekly kind는 자동 트리거 미지원'
                                    : '지금 즉시 cron을 수동 실행'
                            }
                        >
                            {triggerBusy ? '⏳ 실행 중...' : '⚡ 지금 실행 (수동 트리거)'}
                        </button>
                    </div>

                    {triggerMessage && (
                        <div
                            className={`p-3 rounded-md text-sm ${
                                triggerMessage.kind === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-900'
                                    : triggerMessage.kind === 'error'
                                        ? 'bg-red-50 border border-red-200 text-red-900'
                                        : 'bg-blue-50 border border-blue-200 text-blue-900'
                            }`}
                        >
                            <div style={{ whiteSpace: 'pre-line' }}>{triggerMessage.text}</div>
                            {triggerMessage.link && (
                                <Link
                                    href={triggerMessage.link}
                                    className="inline-block mt-2 font-bold underline"
                                >
                                    검토하러 가기 →
                                </Link>
                            )}
                        </div>
                    )}
                </section>
            )}

            <section className="space-y-4 border p-6 rounded-xl shadow-sm bg-white">
                <h2 className="text-xl font-semibold">테마 등록</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            테마 (예: &ldquo;연말 위로받고 싶은 밤에 읽을 책&rdquo;)
                        </label>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="border p-2 w-full rounded focus:ring-2 focus:ring-primary focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && !busy && create()}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">형식</label>
                        <select
                            value={kind}
                            onChange={(e) => setKind(e.target.value as LetterKind)}
                            className="border p-2 w-full rounded"
                        >
                            <option value="monthly_pick">{KIND_LABEL.monthly_pick}</option>
                            <option value="weekly" disabled>
                                {KIND_LABEL.weekly} (자동화 미지원)
                            </option>
                            <option value="special" disabled>
                                {KIND_LABEL.special} (자동화 미지원)
                            </option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            우선순위 (낮을수록 먼저)
                        </label>
                        <input
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value) || 100)}
                            className="border p-2 w-full rounded"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            메모 (선택, 본인용)
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="border p-2 w-full rounded"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={create}
                        disabled={busy}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                        {busy ? '저장 중...' : '테마 등록'}
                    </button>
                    {message && <span className="text-sm text-gray-600">{message}</span>}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold">미사용 ({unused.length})</h2>
                </div>
                <ThemeTable
                    list={unused}
                    onDelete={remove}
                    onPriority={updatePriority}
                    onToggleUsed={toggleUsed}
                />
            </section>

            {used.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-500">
                        사용 완료 ({used.length})
                    </h2>
                    <ThemeTable
                        list={used}
                        onDelete={remove}
                        onPriority={updatePriority}
                        onToggleUsed={toggleUsed}
                    />
                </section>
            )}
        </div>
    );
}

function ThemeTable({
    list,
    onDelete,
    onPriority,
    onToggleUsed,
}: {
    list: SerializedTheme[];
    onDelete: (id: string) => void;
    onPriority: (id: string, value: number) => void;
    onToggleUsed: (id: string, current: boolean) => void;
}) {
    if (list.length === 0) {
        return (
            <div className="bg-gray-50 border rounded p-6 text-center text-sm text-gray-500">
                항목이 없습니다.
            </div>
        );
    }
    return (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                    <tr>
                        <th className="px-4 py-3 text-left">우선순위</th>
                        <th className="px-4 py-3 text-left">테마</th>
                        <th className="px-4 py-3 text-left">형식</th>
                        <th className="px-4 py-3 text-left">메모</th>
                        <th className="px-4 py-3 text-left">상태</th>
                        <th className="px-4 py-3 text-left">생성일</th>
                        <th className="px-4 py-3 text-right">액션</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {list.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    defaultValue={t.priority}
                                    onBlur={(e) => {
                                        const v = Number(e.target.value);
                                        if (v !== t.priority) onPriority(t.id, v);
                                    }}
                                    className="w-16 border p-1 rounded text-sm"
                                />
                            </td>
                            <td className="px-4 py-3 font-medium max-w-md truncate">{t.theme}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                                {t.kind === 'monthly_pick' ? '이달의 픽' : t.kind === 'weekly' ? '이주의 한 권' : '스페셜'}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                                {t.note || '-'}
                            </td>
                            <td className="px-4 py-3">
                                {t.used ? (
                                    <div className="space-y-0.5">
                                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
                                            used
                                        </span>
                                        {t.usedLetterSlug && (
                                            <Link
                                                href={`/admin/letters/${encodeURIComponent(t.usedLetterSlug)}`}
                                                className="block text-xs text-primary hover:underline truncate max-w-[180px]"
                                            >
                                                → {t.usedLetterSlug}
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                        ready
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                                {new Date(t.createdAt).toLocaleDateString('ko-KR')}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                <button
                                    onClick={() => onToggleUsed(t.id, t.used)}
                                    className="text-xs text-blue-600 hover:underline mr-3"
                                >
                                    {t.used ? '복구' : '사용 완료 처리'}
                                </button>
                                <button
                                    onClick={() => onDelete(t.id)}
                                    className="text-xs text-red-600 hover:underline"
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
