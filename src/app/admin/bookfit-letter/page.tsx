'use client';

import { useState } from 'react';

// BookMeta 인터페이스 (서버와 동기화)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiPayload = any;

export default function AdminBookFitLetterPage() {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState<BookMeta[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [selectedBook, setSelectedBook] = useState<BookMeta | null>(null);
    const [draftContent, setDraftContent] = useState('');
    const [slug, setSlug] = useState('');

    const [message, setMessage] = useState('');

    const handleSearch = async () => {
        if (!query) return;
        setIsSearching(true);
        setMessage('');
        setBooks([]);
        try {
            const res = await fetch(`/api/bookfit-letter/search?q=${encodeURIComponent(query)}`);
            const payload = (await res.json()) as ApiPayload;
            if (payload.success) {
                setBooks(payload.data as BookMeta[]);
            } else {
                setMessage(payload.error || '검색 실패');
            }
        } catch {
            setMessage('네트워크 오류');
        } finally {
            setIsSearching(false);
        }
    };

    const handleGenerate = async (book: BookMeta) => {
        setSelectedBook(book);
        setIsGenerating(true);
        setMessage('북핏레터 초안을 생성하는 중입니다. (10~20초 소요 가능)...');
        try {
            const res = await fetch(`/api/bookfit-letter/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book })
            });
            const payload = (await res.json()) as ApiPayload;
            if (payload.success) {
                setDraftContent(payload.content as string);
                setSlug(`bookfit-${book.sourceId}`);
                setMessage('초안 생성 성공!');
            } else {
                setMessage(payload.error || '생성 실패');
            }
        } catch {
            setMessage('네트워크 오류');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
        if (!slug || !draftContent || !selectedBook) {
            alert('슬러그, 책 데이터, 내용을 모두 확인해주세요.');
            setMessage('슬러그, 책 데이터, 내용을 모두 확인해주세요.');
            return;
        }
        try {
            const res = await fetch(`/api/bookfit-letter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `[BookFit] ${selectedBook.title}`,
                    slug,
                    content: draftContent,
                    metadata: {
                        sourceId: selectedBook.sourceId,
                        authors: selectedBook.authors,
                        publisher: selectedBook.publisher,
                        publishedDate: selectedBook.publishedDate,
                        coverImageUrl: selectedBook.coverImageUrl
                    },
                    status
                })
            });
            const payload = (await res.json()) as ApiPayload;
            if (payload.success) {
                const msg = `성공적으로 저장되었습니다! (상태: ${status === 'PUBLISHED' ? '발행됨' : '초안'})`;
                alert(msg);
                setMessage(msg);
            } else {
                alert(payload.error || '저장 실패');
                setMessage(payload.error || '저장 실패');
            }
        } catch {
            alert('네트워크 오류');
            setMessage('네트워크 오류');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                북핏레터 파이프라인 Admin
            </h1>

            {/* 검색부 */}
            <section className="space-y-4 border p-6 rounded-xl shadow-sm bg-white text-gray-900">
                <h2 className="text-xl font-semibold">1. 알라딘 OpenAPI 도서 검색</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="책 제목 또는 키워드 입력..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border p-2 rounded flex-1 focus:ring-2 focus:ring-primary focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSearching ? '검색 중...' : '검색'}
                    </button>
                </div>
            </section>

            {/* 결과부 */}
            {books.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">2. 검색 결과</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {books.map((b) => (
                            <div key={b.sourceId} className="border p-4 rounded-xl flex flex-col gap-3 bg-white text-gray-900 shadow-sm">
                                <div className="flex gap-4">
                                    {b.coverImageUrl ? (
                                        <img src={b.coverImageUrl} alt="cover" className="w-20 h-28 object-cover rounded shadow" />
                                    ) : (
                                        <div className="w-20 h-28 bg-gray-100 flex items-center justify-center rounded shadow">No img</div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg leading-tight">{b.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{b.authors.join(', ')} | {b.publisher}</p>
                                        <p className="text-sm text-gray-500">{b.publishedDate} | ISBN: {b.isbn13 || '없음'} | ItemId: {b.sourceId}</p>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => handleGenerate(b)}
                                            disabled={isGenerating}
                                            className="w-full bg-slate-900 text-white font-medium px-4 py-8 rounded hover:bg-slate-800 disabled:opacity-50 h-full"
                                        >
                                            초안 생성하기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 메시지 출력 */}
            {message && (
                <div className="p-4 bg-gray-100 rounded-lg text-gray-800 font-medium">
                    {message}
                </div>
            )}

            {/* 에디터부 */}
            {draftContent && (
                <section className="space-y-4 border p-6 rounded-xl shadow-sm bg-white text-gray-900">
                    <h2 className="text-xl font-semibold">3. 마스터 레터 검수 및 발행</h2>
                    <div className="space-y-2">
                        <label className="block font-medium text-sm text-gray-700">URL 슬러그 (영문)</label>
                        <input
                            type="text"
                            placeholder="ex: the-great-gatsby-review"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="border p-2 w-full rounded focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium text-sm text-gray-700">마크다운 초안 (Gemini 생성본)</label>
                        <textarea
                            className="w-full h-[500px] border p-4 rounded font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            value={draftContent}
                            onChange={(e) => setDraftContent(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => handleSave('DRAFT')}
                            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold shadow hover:bg-gray-300 transition-colors"
                        >
                            초안 수정/저장하기 (DRAFT)
                        </button>
                        <button
                            onClick={() => handleSave('PUBLISHED')}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold shadow hover:bg-primary/90 transition-colors"
                        >
                            즉시 발행 상태로 저장 (PUBLISH)
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
