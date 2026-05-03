'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type LetterKind = 'weekly' | 'monthly_pick' | 'special';

type Initial = {
    slug: string;
    title: string;
    headlineTitle: string;
    metaTitle: string;
    metaDescription: string;
    ogImageUrl: string;
    coverImageUrl: string;
    kind: LetterKind;
    category: string;
    curatorNote: string;
    contentMarkdown: string;
    isFeatured: boolean;
    status: string;
    readingTime: number | null;
    publishedAt: string | null;
    createdAt: string;
    authors: string;
    publisher: string;
    publishedDate: string;
    isbn13: string;
    bookIds: string[];
    books: {
        id: string;
        title: string;
        author: string;
        imageUrl: string | null;
        recommendation: string | null;
    }[];
};

const KIND_LABELS: Record<LetterKind, string> = {
    weekly: '이주의 한 권 (단권)',
    monthly_pick: '이달의 픽 (3권)',
    special: '스페셜',
};

export default function AdminLetterEditClient({ initial }: { initial: Initial }) {
    const router = useRouter();
    const [form, setForm] = useState({
        slug: initial.slug,
        title: initial.title,
        headlineTitle: initial.headlineTitle,
        metaTitle: initial.metaTitle,
        metaDescription: initial.metaDescription,
        ogImageUrl: initial.ogImageUrl,
        coverImageUrl: initial.coverImageUrl,
        kind: initial.kind,
        category: initial.category,
        curatorNote: initial.curatorNote,
        contentMarkdown: initial.contentMarkdown,
        isFeatured: initial.isFeatured,
        status: initial.status,
        readingTime: initial.readingTime ?? 0,
    });
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async (overrides: Partial<typeof form> = {}) => {
        setSaving(true);
        setMessage('');
        const payload = {
            ...form,
            ...overrides,
            readingTime: form.readingTime || null,
            newSlug: form.slug !== initial.slug ? form.slug : undefined,
        };
        try {
            const res = await fetch(
                `/api/letter/${encodeURIComponent(initial.slug)}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                },
            );
            const json = await res.json();
            if (!res.ok || !json?.success) {
                setMessage(json?.error || '저장 실패');
                return false;
            }
            const dispatch = json.dispatch as
                | { sentCount?: number; skipped?: boolean; error?: string }
                | null;
            const dispatchMsg = dispatch
                ? dispatch.error
                    ? ` · 발송 오류: ${dispatch.error}`
                    : dispatch.skipped
                        ? ' · 발송 skip (기존 발송 로그 있음)'
                        : ` · ${dispatch.sentCount}명에게 발송됨`
                : '';
            setMessage(`저장 완료 — 상태: ${json.letter.status}${dispatchMsg}`);
            const newSlug = json.letter.slug as string;
            if (newSlug !== initial.slug) {
                router.replace(`/admin/letters/${encodeURIComponent(newSlug)}`);
            }
            return true;
        } catch (e) {
            console.error(e);
            setMessage('네트워크 오류');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = () => save({ status: 'draft' });
    const handlePublish = async () => {
        if (!form.slug) {
            setMessage('publish 전에 slug를 먼저 지정하세요.');
            return;
        }
        const ok = await save({ status: 'PUBLISHED' });
        if (ok) router.refresh();
    };

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠어요? 되돌릴 수 없습니다.')) return;
        try {
            const res = await fetch(`/api/letter/${encodeURIComponent(initial.slug)}`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                alert(json?.error || '삭제 실패');
                return;
            }
            router.push('/admin/letters');
        } catch (e) {
            console.error(e);
            alert('네트워크 오류');
        }
    };

    const isPublished = form.status === 'PUBLISHED' || form.status === 'published';

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans text-gray-900">
            <header className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                    <Link href="/admin/letters" className="text-sm text-gray-500 hover:underline">
                        ← 레터 목록
                    </Link>
                    <h1 className="text-3xl font-bold">레터 편집</h1>
                    <p className="text-xs text-gray-500 font-mono">slug: {initial.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                            isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        {form.status}
                    </span>
                    <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                        {KIND_LABELS[form.kind]}
                    </span>
                    {isPublished && (
                        <Link
                            href={`/bookfit-letter/${encodeURIComponent(form.slug)}`}
                            target="_blank"
                            className="px-3 py-1 text-sm border rounded text-blue-600 hover:bg-blue-50"
                        >
                            보기
                        </Link>
                    )}
                </div>
            </header>

            {message && <div className="p-3 bg-gray-100 rounded text-sm">{message}</div>}

            <section className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold">기본 정보</h2>
                <Field label="회차 제목 (title)">
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => update('title', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <Field label="본문 헤드라인 (headlineTitle, H1로 표시)">
                    <input
                        type="text"
                        value={form.headlineTitle}
                        onChange={(e) => update('headlineTitle', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <Field label="큐레이터 노트 (curatorNote, 도입 단락)">
                    <textarea
                        rows={5}
                        value={form.curatorNote}
                        onChange={(e) => update('curatorNote', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="형식 (kind)">
                        <select
                            value={form.kind}
                            onChange={(e) => update('kind', e.target.value as LetterKind)}
                            className="border p-2 w-full rounded"
                        >
                            <option value="weekly">{KIND_LABELS.weekly}</option>
                            <option value="monthly_pick">{KIND_LABELS.monthly_pick}</option>
                            <option value="special">{KIND_LABELS.special}</option>
                        </select>
                    </Field>
                    <Field label="카테고리 (감정/계절/직군/트렌드 등)">
                        <input
                            type="text"
                            value={form.category}
                            onChange={(e) => update('category', e.target.value)}
                            className="border p-2 w-full rounded"
                        />
                    </Field>
                </div>
            </section>

            <section className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold">본문 마크다운</h2>
                <p className="text-xs text-gray-500">
                    프론트매터(--- 영역)는 자동 파싱되어 메타로 분리됩니다. 책 카드는 본문 아래 자동 렌더되니 본문 안에 cover 이미지/구매 링크는 넣지 마세요.
                </p>
                <textarea
                    rows={20}
                    value={form.contentMarkdown}
                    onChange={(e) => update('contentMarkdown', e.target.value)}
                    className="border p-3 w-full rounded font-mono text-sm leading-relaxed"
                />
            </section>

            <section className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold">SEO &amp; URL</h2>
                <Field label="URL slug (영문/한글 + 대시)">
                    <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => update('slug', e.target.value)}
                        className="border p-2 w-full rounded font-mono"
                    />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="SEO/Meta Title (40~60자)">
                        <input
                            type="text"
                            value={form.metaTitle}
                            onChange={(e) => update('metaTitle', e.target.value)}
                            className="border p-2 w-full rounded"
                        />
                    </Field>
                    <Field label="읽는 시간 (분)">
                        <input
                            type="number"
                            value={form.readingTime || ''}
                            onChange={(e) => update('readingTime', Number(e.target.value) || 0)}
                            className="border p-2 w-full rounded"
                        />
                    </Field>
                </div>
                <Field label="SEO/Meta Description (110~140자)">
                    <textarea
                        rows={2}
                        value={form.metaDescription}
                        onChange={(e) => update('metaDescription', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="OG Image URL">
                        <input
                            type="text"
                            value={form.ogImageUrl}
                            onChange={(e) => update('ogImageUrl', e.target.value)}
                            className="border p-2 w-full rounded font-mono text-xs"
                        />
                    </Field>
                    <Field label="Cover Image URL (단권 표지)">
                        <input
                            type="text"
                            value={form.coverImageUrl}
                            onChange={(e) => update('coverImageUrl', e.target.value)}
                            className="border p-2 w-full rounded font-mono text-xs"
                        />
                    </Field>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => update('isFeatured', e.target.checked)}
                        className="w-4 h-4"
                    />
                    홈/목록에서 Featured로 노출
                </label>
            </section>

            <section className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold">묶인 책 ({initial.books.length}권)</h2>
                <p className="text-xs text-gray-500">
                    책 목록은 회차 생성 시 결정됩니다. 책별 추천사(recommendation)는 책 마스터를 직접 편집해야 변경됩니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {initial.books.length === 0 && (
                        <div className="col-span-3 text-sm text-gray-500 text-center py-4">
                            묶인 책이 없습니다.
                        </div>
                    )}
                    {initial.books.map((b) => (
                        <div key={b.id} className="border rounded p-3 space-y-2 bg-gray-50">
                            {b.imageUrl && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={b.imageUrl
                                        .replace('coversum', 'cover500')
                                        .replace(/^http:/i, 'https:')}
                                    alt={b.title}
                                    className="w-full aspect-[1/1.5] object-cover rounded"
                                />
                            )}
                            <div className="text-sm font-bold leading-tight line-clamp-2">{b.title}</div>
                            <div className="text-xs text-gray-600">{b.author}</div>
                            {b.recommendation && (
                                <div className="text-xs text-gray-500 line-clamp-3">{b.recommendation}</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <footer className="sticky bottom-0 bg-white border-t -mx-8 px-8 py-4 flex items-center justify-between gap-3">
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                    삭제
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 disabled:opacity-50"
                    >
                        {saving ? '저장 중...' : 'Draft로 저장'}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={saving}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded font-bold hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving ? '저장 중...' : 'Publish (저장 + 발행 + 메일 발송)'}
                    </button>
                </div>
            </footer>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {children}
        </div>
    );
}
