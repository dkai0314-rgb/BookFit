
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function ContentFactoryPage() {
    const [theme, setTheme] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleGenerate = async () => {
        if (!theme) return;
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/curation/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme }),
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Generation failed:', error);
            alert('생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = async () => {
        if (!result) return;

        const booksParam = encodeURIComponent(JSON.stringify(result.books));
        const imageUrl = `/api/curation/image?title=${encodeURIComponent(result.title)}&books=${booksParam}`;

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookfit_insta_${result.id}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-[#061A14]">🏭 BookFit 콘텐츠 팩토리</h1>

                <div className="space-y-4 mb-8">
                    <label className="block text-sm font-medium text-gray-700">추천 주제 (Theme)</label>
                    <div className="flex gap-4">
                        <textarea
                            className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-[#061A14] focus:outline-none resize-none h-24"
                            placeholder="예: 직장생활에 지친 사람들에게 추천하는 책"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={loading || !theme}
                            className="h-24 px-8 bg-[#061A14] hover:bg-[#0B2A1F] text-white font-bold text-lg"
                        >
                            {loading ? '생성 중...' : '콘텐츠 생성'}
                        </Button>
                    </div>
                </div>

                {result && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                        {/* Left: Web Content Preview */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold border-b pb-2">🌐 웹 큐레이션 결과</h2>

                            <div className="bg-gray-50 p-6 rounded-lg border">
                                <div className="text-sm text-accent font-bold uppercase mb-1">BookFit Curation</div>
                                <h3 className="text-2xl font-bold mb-4">{result.title}</h3>
                                <p className="text-gray-600 mb-6 whitespace-pre-line">{result.description}</p>

                                <div className="space-y-4">
                                    {result.books.map((book: any) => (
                                        <div key={book.id} className="flex gap-4 bg-white p-3 rounded border">
                                            <img src={book.imageUrl} className="w-16 h-24 object-cover rounded" />
                                            <div>
                                                <div className="font-bold">{book.title}</div>
                                                <div className="text-sm text-gray-500">{book.author}</div>
                                                <div className="text-xs text-blue-600 mt-1">{book.recommendation}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Instagram Content Preview */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold border-b pb-2">📸 인스타그램 결과</h2>

                            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                                {/* Image Preview using API */}
                                <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
                                    <img
                                        src={`/api/curation/image?title=${encodeURIComponent(result.title)}&books=${encodeURIComponent(JSON.stringify(result.books))}`}
                                        alt="Insta Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Caption */}
                                <div className="p-4 bg-gray-50 text-sm whitespace-pre-line font-mono text-gray-600 border-t">
                                    {result.instaCaption}
                                </div>
                            </div>

                            <Button onClick={downloadImage} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                📥 이미지 다운로드
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
