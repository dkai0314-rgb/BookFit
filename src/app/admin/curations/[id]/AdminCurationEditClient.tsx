'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Initial = {
    id: string;
    title: string;
    theme: string;
    description: string;
    instaCaption: string;
    slug: string;
    category: string;
    curatorNote: string;
    seoTitle: string;
    seoDesc: string;
    ogImage: string;
    cardImageUrl: string;
    readingTime: number | null;
    isFeatured: boolean;
    status: string;
    publishedAt: string | null;
    createdAt: string;
    books: {
        id: string;
        title: string;
        author: string;
        imageUrl: string | null;
        recommendation: string | null;
    }[];
};

export default function AdminCurationEditClient({ initial }: { initial: Initial }) {
    const router = useRouter();
    const [form, setForm] = useState({
        title: initial.title,
        theme: initial.theme,
        description: initial.description,
        instaCaption: initial.instaCaption,
        slug: initial.slug,
        category: initial.category,
        curatorNote: initial.curatorNote,
        seoTitle: initial.seoTitle,
        seoDesc: initial.seoDesc,
        ogImage: initial.ogImage,
        cardImageUrl: initial.cardImageUrl,
        readingTime: initial.readingTime ?? 0,
        isFeatured: initial.isFeatured,
        status: initial.status,
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
        };
        try {
            const res = await fetch(`/api/curation/${initial.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                setMessage(json?.error || '저장 실패');
                return false;
            }
            const c = json.curation as Partial<typeof form> & { status: string; slug: string | null };
            setForm((prev) => ({
                ...prev,
                slug: c.slug ?? prev.slug,
                status: c.status,
            }));
            setMessage(`저장 완료 — 상태: ${c.status}`);
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
            setMessage('published 전환 전에 slug를 먼저 지정하세요.');
            return;
        }
        const ok = await save({ status: 'published' });
        if (ok) router.refresh();
    };

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠어요? 되돌릴 수 없습니다.')) return;
        try {
            const res = await fetch(`/api/curation/${initial.id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                alert(json?.error || '삭제 실패');
                return;
            }
            router.push('/admin/curations');
        } catch (e) {
            console.error(e);
            alert('네트워크 오류');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans text-gray-900">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/admin/curations" className="text-sm text-gray-500 hover:underline">
                        ← 큐레이션 목록
                    </Link>
                    <h1 className="text-3xl font-bold">큐레이션 편집</h1>
                    <p className="text-xs text-gray-500 font-mono">id: {initial.id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                            form.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        {form.status}
                    </span>
                    {form.status === 'published' && form.slug && (
                        <Link
                            href={`/curation/${form.slug}`}
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
                <Field label="제목 (title)">
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => update('title', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <Field label="테마 (theme)">
                    <input
                        type="text"
                        value={form.theme}
                        onChange={(e) => update('theme', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <Field label="설명 (description, 2-3 문장)">
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <Field label="큐레이터 노트 (curatorNote, 4-6 문장)">
                    <textarea
                        rows={6}
                        value={form.curatorNote}
                        onChange={(e) => update('curatorNote', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="카테고리 (감정/계절/직군/트렌드 등)">
                        <input
                            type="text"
                            value={form.category}
                            onChange={(e) => update('category', e.target.value)}
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
            </section>

            <section className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold">SEO &amp; URL</h2>
                <Field label="URL slug (영문/한글, 대시 가능)">
                    <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => update('slug', e.target.value)}
                        className="border p-2 w-full rounded font-mono"
                        placeholder="ex: 위로받고-싶은-밤-x9k2"
                    />
                </Field>
                <Field label="SEO Title (40~60자)">
                    <input
                        type="text"
                        value={form.seoTitle}
                        onChange={(e) => update('seoTitle', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <Field label="SEO Description (110~140자)">
                    <textarea
                        rows={2}
                        value={form.seoDesc}
                        onChange={(e) => update('seoDesc', e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="OG Image URL">
                        <input
                            type="text"
                            value={form.ogImage}
                            onChange={(e) => update('ogImage', e.target.value)}
                            className="border p-2 w-full rounded font-mono text-xs"
                        />
                    </Field>
                    <Field label="Card Image URL">
                        <input
                            type="text"
                            value={form.cardImageUrl}
                            onChange={(e) => update('cardImageUrl', e.target.value)}
                            className="border p-2 w-full rounded font-mono text-xs"
                        />
                    </Field>
                </div>
                <Field label="Instagram 캡션">
                    <textarea
                        rows={4}
                        value={form.instaCaption}
                        onChange={(e) => update('instaCaption', e.target.value)}
                        className="border p-2 w-full rounded text-sm"
                    />
                </Field>
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
                    책 목록은 큐레이션 생성 시 결정되며 이 화면에선 변경할 수 없습니다.
                    각 책의 추천사(recommendation)는 책 모델을 직접 편집해야 변경됩니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        {saving ? '저장 중...' : 'Publish (저장 + 발행)'}
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
