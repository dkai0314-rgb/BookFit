
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Download, LayoutGrid, Clock } from 'lucide-react';

export default function ContentFactoryPage() {
    const [theme, setTheme] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await fetch('/api/curation');
            const data = await response.json();
            setHistory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

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
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error('Generation failed:', error);
            alert('?ùÏÑ±???§Ìå®?àÏäµ?àÎã§.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('?ïÎßê ??†ú?òÏãúÍ≤†Ïäµ?àÍπå?')) return;

        try {
            const response = await fetch(`/api/curation?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchHistory();
                if (result?.id === id) setResult(null);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('??†ú???§Ìå®?àÏäµ?àÎã§.');
        }
    };

    const downloadImage = async (data: any) => {
        if (!data) return;

        const booksParam = encodeURIComponent(JSON.stringify(data.books));
        const imageUrl = `/api/curation/image?title=${encodeURIComponent(data.title)}&books=${booksParam}`;

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookfit_insta_${data.id}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-slate-900 text-white rounded-lg">?è≠</span>
                        BookFit ÏΩòÌÖêÏ∏??©ÌÜ†Î¶?
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Generator & Preview */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Generator Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5" /> ???êÎ†à?¥ÏÖò ?ùÏÑ±
                            </h2>
                            <div className="space-y-4">
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none focus:bg-white transition-all resize-none h-32"
                                    placeholder="?? ÏßÅÏû•?ùÌôú??ÏßÄÏπ??¨Îûå?§ÏóêÍ≤?Ï∂îÏ≤ú?òÎäî Ï±?
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                />
                                <Button
                                    onClick={handleGenerate}
                                    disabled={loading || !theme}
                                    className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl transition-all"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                            ÏΩòÌÖêÏ∏??ùÏÑ± Ï§?..
                                        </span>
                                    ) : 'ÏßÄÍ∏??ùÏÑ±?òÍ∏∞'}
                                </Button>
                            </div>
                        </div>

                        {/* Result Preview */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-xl font-bold">?ß™ ?ùÏÑ± Í≤∞Í≥º ÎØ∏Î¶¨Î≥¥Í∏∞</h2>
                                    <Button
                                        onClick={() => downloadImage(result)}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Download className="w-4 h-4" /> ?¥Î?ÏßÄ ?§Ïö¥Î°úÎìú
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
                                    {/* Web Preview */}
                                    <div className="p-8 space-y-6 border-r border-slate-100">
                                        <div className="space-y-4">
                                            <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase rounded">Web View</div>
                                            <h3 className="text-3xl font-black leading-tight text-slate-900">{result.title}</h3>
                                            <p className="text-slate-600 leading-relaxed text-base">{result.description}</p>
                                        </div>

                                        <div className="space-y-3 pt-4">
                                            {result.books.map((book: any) => (
                                                <div key={book.id} className="flex gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 group hover:bg-white hover:shadow-md transition-all">
                                                    <img src={book.imageUrl} className="w-16 h-24 object-cover rounded shadow-sm group-hover:scale-105 transition-transform" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-900 truncate">{book.title}</div>
                                                        <div className="text-base text-slate-500 mb-1">{book.author}</div>
                                                        <div className="text-base text-blue-600 bg-blue-50 p-1.5 rounded inline-block line-clamp-2">{book.recommendation}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Insta Preview */}
                                    <div className="p-8 bg-slate-50/30 space-y-6">
                                        <div className="inline-block px-3 py-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white text-[10px] font-bold tracking-widest uppercase rounded">Instagram</div>

                                        <div className="aspect-square relative bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden group">
                                            <img
                                                src={`/api/curation/image?title=${encodeURIComponent(result.title)}&books=${encodeURIComponent(JSON.stringify(result.books))}`}
                                                alt="Insta Preview"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                                            />
                                        </div>

                                        <div className="p-4 bg-white border border-slate-200 rounded-xl text-base whitespace-pre-line font-mono text-slate-600 shadow-sm">
                                            {result.instaCaption}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: History */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5" /> ?êÎ†à?¥ÏÖò ?àÏä§?†Î¶¨
                                </h2>
                                <span className="text-base font-medium text-slate-400">{history.length} items</span>
                            </div>

                            <div className="divide-y divide-slate-50 max-h-[calc(100vh-250px)] overflow-y-auto">
                                {loadingHistory ? (
                                    <div className="p-12 text-center">
                                        <div className="inline-block w-6 h-6 border-2 border-slate-100 border-t-slate-400 rounded-full animate-spin"></div>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 text-base italic">
                                        ?ùÏÑ±???¥Ïó≠???ÜÏäµ?àÎã§.
                                    </div>
                                ) : (
                                    history.map((item) => (
                                        <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-base text-slate-400 font-medium">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-base mb-3 line-clamp-1">{item.title}</h4>
                                            <div className="flex gap-2 mb-4">
                                                {item.books?.slice(0, 3).map((book: any) => (
                                                    <img key={book.id} src={book.imageUrl} className="w-8 h-12 object-cover rounded shadow-sm" />
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-base gap-1.5 h-8"
                                                    onClick={() => setResult(item)}
                                                >
                                                    <ExternalLink className="w-3 h-3" /> ?ÅÏÑ∏Î≥¥Í∏∞
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-slate-200 text-slate-600 hover:bg-white text-base px-2.5 h-8"
                                                    onClick={() => downloadImage(item)}
                                                >
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
