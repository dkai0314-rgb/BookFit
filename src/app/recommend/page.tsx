
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Brain, ArrowRight, Loader2 } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

type Mode = 'SELECT' | 'TASTE' | 'MIND';

interface RecommendedBook {
    title: string;
    author: string;
    coreMessage: string;
    reason: string;
    userConnectionPoint: string;
    imageUrl: string | null;
    link: string | null;
    displayTitle: string;
    displayAuthor: string;
}

export default function RecommendPage() {
    const [mode, setMode] = useState<Mode>('SELECT');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RecommendedBook[]>([]);

    // Inputs
    const [tasteTopics, setTasteTopics] = useState<string[]>([]);
    const [tasteCustomTopic, setTasteCustomTopic] = useState("");
    const [tasteStyle, setTasteStyle] = useState("");

    const [mindEmotions, setMindEmotions] = useState<string[]>([]);
    const [mindSituation, setMindSituation] = useState("");

    const TASTE_TAGS = ["?�기계발", "창업/비즈?�스", "마�???, "?�리/?�간관�?, "?�설/문학", "?�문/철학", "?�렌??, "?�테??];
    const TASTE_STYLES = ["?�용?�이�?구체?�인", "?�로???�사?�트", "가볍고 ?��??�는", "깊이 ?�는/?�술?�인"];

    const MIND_EMOTIONS = ["지�?번아??, "불안/걱정", "?�존�??�락", "관계의 ?�려?�", "무기??, "?�로???�작", "?�로가 ?�요??];

    const toggleTasteTag = (tag: string) => {
        setTasteTopics(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const toggleMindEmotion = (tag: string) => {
        setMindEmotions(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleRecommend = async () => {
        setLoading(true);
        setResult([]);

        const payload = mode === 'TASTE' ? {
            mode: 'TASTE',
            topics: tasteTopics,
            customQuery: tasteCustomTopic,
            style: tasteStyle
        } : {
            mode: 'MIND',
            emotion: mindEmotions,
            situation: mindSituation
        };

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
            alert("추천 �?문제가 발생?�습?�다.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMode('SELECT');
        setResult([]);
        setTasteTopics([]);
        setTasteCustomTopic("");
        setTasteStyle("");
        setMindEmotions([]);
        setMindSituation("");
    };

    return (
        <div className="min-h-screen bg-[#061A14] text-white flex flex-col items-center py-20 px-4">
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]" role="banner">
                <Link href="/" className="cursor-pointer text-2xl font-bold font-serif tracking-tight text-white hover:text-accent transition-colors" aria-label="BookFit ?�으�??�동">
                    BookFit AI
                </Link>
            </header>

            <main className="w-full max-w-2xl mt-12" role="main">
                {/* 1. Mode Selection */}
                {mode === 'SELECT' && (
                    <div className="space-y-12 animate-fade-in-up">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
                                ?�떤 책을 찾고 계신가??
                            </h1>
                            <p className="text-gray-400 text-lg">
                                ?�신??목적??맞는 추천 방식???�택?�주?�요.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Taste Mode */}
                            <button
                                onClick={() => setMode('TASTE')}
                                className="group relative bg-[#0B2A1F] p-8 rounded-xl border border-white/10 hover:border-accent hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full"
                                aria-label="취향 기반 ?�서 추천 ?�작?�기"
                            >
                                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 group-hover:text-accent transition-all" aria-hidden="true">
                                    <Brain size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">취향 추천</h2>
                                <p className="text-gray-400 text-base leading-relaxed mb-6 flex-1">
                                    &quot;관?�사?� ?�서 ?�향??바탕?�로,<br />지�??�기 좋�? 책을 ?�교?�게 추천?�니??&quot;
                                </p>
                                <div className="text-accent text-base font-semibold flex items-center gap-2">
                                    ?�작?�기 <ArrowRight size={16} />
                                </div>
                            </button>

                            {/* Mind Mode */}
                            <button
                                onClick={() => setMode('MIND')}
                                className="group relative bg-[#0B2A1F] p-8 rounded-xl border border-white/10 hover:border-[#FF5678] hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full"
                                aria-label="?�리/마음 ?�태 기반 ?�서 추천 ?�작?�기"
                            >
                                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 group-hover:text-[#FF5678] transition-all" aria-hidden="true">
                                    <Heart size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-[#FF5678] transition-colors">마음 추천</h2>
                                <p className="text-gray-400 text-base leading-relaxed mb-6 flex-1">
                                    &quot;감정�??�황???�아,<br />?�늘???�신?�게 ?�요??문장??가�?br />책을 추천?�니??&quot;
                                </p>
                                <div className="text-[#FF5678] text-base font-semibold flex items-center gap-2">
                                    ?�작?�기 <ArrowRight size={16} />
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Input Form - Taste */}
                {mode === 'TASTE' && !loading && result.length === 0 && (
                    <section className="space-y-8 animate-fade-in" aria-labelledby="taste-title">
                        <div className="text-center space-y-2">
                            <h2 id="taste-title" className="text-3xl font-bold font-serif text-accent">취향 추천</h2>
                            <p className="text-gray-400">?�신???�서 취향???�려주세??</p>
                        </div>

                        <div className="space-y-6 bg-[#0B2A1F]/50 p-8 rounded-xl border border-white/5">
                            {/* Custom Query Section (Primary) */}
                            <div className="space-y-3">
                                <label htmlFor="taste-input" className="text-base font-bold text-gray-300 uppercase tracking-wider">
                                    ?�떤 책을 찾으?�나?? (?�수)
                                </label>
                                <textarea
                                    id="taste-input"
                                    rows={4}
                                    placeholder="찾으?�는 책의 주제, 목적, ?�이?��? ?�유�?�� ?�어주세??&#13;&#10;(?? 마�???초보?�인?? 브랜?�의 기초부???�무까�? ?�게 배울 ???�는 책을 추천?�줘.)"
                                    className="w-full bg-[#061A14] border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent transition-colors resize-none text-lg leading-relaxed"
                                    value={tasteCustomTopic}
                                    onChange={(e) => setTasteCustomTopic(e.target.value)}
                                />
                                <p className="text-base text-accent/70 flex items-center gap-1">
                                    <Sparkles size={12} aria-hidden="true" />
                                    Tip: [주제 + ?�이??+ 목적]??구체?�으�??�으�????�확??추천??받을 ???�습?�다.
                                </p>
                            </div>

                            {/* Topic Tags Section (Secondary) */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">관???�워??(참고??</span>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="관???�워???�택">
                                    {TASTE_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTasteTag(tag)}
                                            aria-pressed={tasteTopics.includes(tag)}
                                            className={`px-3 py-1.5 rounded-full text-base transition-all border ${tasteTopics.includes(tag)
                                                ? 'bg-accent/20 text-accent border-accent font-bold'
                                                : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Style Section */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">?�호 ?��???/span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup" aria-label="?�호 ?��????�택">
                                    {TASTE_STYLES.map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setTasteStyle(style)}
                                            role="radio"
                                            aria-checked={tasteStyle === style}
                                            className={`px-3 py-2 rounded-lg text-base transition-all border text-center ${tasteStyle === style
                                                ? 'bg-accent/20 text-accent border-accent font-bold'
                                                : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={reset} className="text-gray-500 hover:text-white transition-colors text-base">처음?�로</button>
                            <Button
                                onClick={handleRecommend}
                                disabled={!tasteCustomTopic || tasteCustomTopic.length < 5}
                                className="bg-accent text-[#061A14] hover:bg-white px-8 py-6 rounded-lg text-lg font-bold shadow-[0_0_15px_rgba(56,255,168,0.2)] hover:shadow-[0_0_25px_rgba(56,255,168,0.4)] transition-all"
                                aria-label="?�력??취향???�른 ?�서 추천 받기"
                            >
                                <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
                                AI 맞춤 추천 받기
                            </Button>
                        </div>
                    </section>
                )}

                {/* 2. Input Form - Mind */}
                {mode === 'MIND' && !loading && result.length === 0 && (
                    <section className="space-y-8 animate-fade-in" aria-labelledby="mind-title">
                        <div className="text-center space-y-2">
                            <h2 id="mind-title" className="text-3xl font-bold font-serif text-[#FF5678]">마음 추천</h2>
                            <p className="text-gray-400">?�늘 ?�신??마음?� ?�떤가??</p>
                        </div>

                        <div className="space-y-6 bg-[#0B2A1F]/50 p-8 rounded-xl border border-white/5">
                            {/* Situation Input (Primary) */}
                            <div className="space-y-3">
                                <label htmlFor="mind-input" className="text-base font-bold text-gray-300 uppercase tracking-wider">
                                    ?�황 ?�명 (?�수)
                                </label>
                                <textarea
                                    id="mind-input"
                                    rows={4}
                                    placeholder="지�?겪고 ?�는 ?�황?�나 고�???구체?�으�??�어주세?? (?? ?�즘 번아?�이 ?�???�무것도 ?�기 ?�고 무기?�해?? ?�로가 ?�요?�니??)"
                                    className="w-full bg-[#061A14] border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5678] transition-colors resize-none text-lg leading-relaxed"
                                    value={mindSituation}
                                    onChange={(e) => setMindSituation(e.target.value)}
                                />
                            </div>

                            {/* Emotion Section */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">감정/?�태 ?�워??(참고??</span>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="감정/?�태 ?�워???�택">
                                    {MIND_EMOTIONS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleMindEmotion(tag)}
                                            aria-pressed={mindEmotions.includes(tag)}
                                            className={`px-3 py-1.5 rounded-full text-base transition-all border ${mindEmotions.includes(tag)
                                                ? 'bg-[#FF5678] text-white border-[#FF5678] font-bold'
                                                : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={reset} className="text-gray-500 hover:text-white transition-colors text-base">처음?�로</button>
                            <Button
                                onClick={handleRecommend}
                                disabled={!mindSituation || mindSituation.length < 5}
                                className="bg-[#FF5678] text-white hover:bg-white hover:text-[#FF5678] px-8 py-6 rounded-lg text-lg font-bold shadow-[0_0_15px_rgba(255,86,120,0.3)] hover:shadow-[0_0_25px_rgba(255,86,120,0.5)] transition-all"
                                aria-label="?�재 마음 ?�태???�른 ?�서 처방 받기"
                            >
                                <Heart className="mr-2 h-5 w-5" aria-hidden="true" />
                                공감 처방 받기
                            </Button>
                        </div>
                    </section>
                )}

                {/* 3. Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse" role="status" aria-live="polite">
                        <Loader2 size={48} className={`animate-spin ${mode === 'TASTE' ? 'text-accent' : 'text-[#FF5678]'}`} />
                        <div className="text-center">
                            <h3 className="text-2xl font-bold font-serif mb-2">
                                {mode === 'TASTE' ? "최적??책을 ?�별?�고 ?�습?�다..." : "?�신??마음???�을 문장??찾고 ?�습?�다..."}
                            </h3>
                            <p className="text-gray-500">
                                ?�시�?기다?�주?�요 (Gemini AI Analyzing...)
                            </p>
                        </div>
                    </div>
                )}

                {/* 4. Results */}
                {result.length > 0 && (
                    <section className="space-y-12 animate-fade-in" aria-labelledby="results-title">
                        <div className="text-center space-y-2">
                            <h2 id="results-title" className="text-3xl font-bold font-serif text-white">
                                {mode === 'TASTE' ? <span className="text-accent">?�신??취향???�한 ?�레?�션</span> : <span className="text-[#FF5678]">?�신???�해 준비했?�니??/span>}
                            </h2>
                            <p className="text-gray-400">
                                {mode === 'TASTE' ? "?�정 기�???부?�하??최고??�?3권입?�다." : "??책들???��? ?�로가 ?�길 바랍?�다."}
                            </p>
                        </div>

                        <div className="grid gap-8">
                            {result.map((book, i) => (
                                <article key={i} className="flex flex-col md:flex-row gap-6 bg-[#0B2A1F]/30 border border-white/5 p-6 rounded-xl hover:border-white/20 transition-all">
                                    {/* Cover */}
                                    <div className="w-full md:w-32 flex-shrink-0">
                                        <div className="aspect-[1/1.5] w-28 mx-auto md:w-full rounded-md overflow-hidden bg-black/50 relative shadow-lg">
                                            {book.imageUrl ? (
                                                <Image
                                                    src={book.imageUrl.replace("coversum", "cover500")}
                                                    alt={`${book.displayTitle} ?�서 커버`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-base text-gray-500">No Image</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-4 text-left">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded bg-white/5 uppercase tracking-wider ${mode === 'TASTE' ? 'text-accent' : 'text-[#FF5678]'}`}>
                                                    {book.userConnectionPoint}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                {book.displayTitle}
                                            </h3>
                                            <p className="text-base text-gray-400">{book.displayAuthor}</p>
                                        </div>

                                        <div className={`p-4 rounded-lg relative ${mode === 'TASTE' ? 'bg-accent/5 border border-accent/10' : 'bg-[#FF5678]/5 border border-[#FF5678]/10'}`}>
                                            <p className="text-gray-200 text-base leading-relaxed font-medium">
                                                &quot;{book.reason}&quot;
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <p className="text-base text-gray-500 italic">
                                                ?�심 ?�워?? {book.coreMessage}
                                            </p>
                                            {book.link && (
                                                <a href={book.link} target="_blank" rel="noopener noreferrer" className="text-base text-white/50 hover:text-white underline underline-offset-4" aria-label={`${book.displayTitle} 구매 ?�이지�??�동`}>
                                                    구매?�기
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="text-center pt-10">
                            <Button onClick={reset} variant="outline" className="border-white/20 text-gray-400 hover:text-white hover:bg-white/10" aria-label="추천 ?�시 받으??가�?>
                                ?�시 추천 받기
                            </Button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
