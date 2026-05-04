"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Brain, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

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
    coupangLink: string | null;
}

export default function RecommendPage() {
    const [mode, setMode] = useState<Mode>('SELECT');
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [result, setResult] = useState<RecommendedBook[]>([]);

    // Inputs
    const [tasteCustomTopic, setTasteCustomTopic] = useState("");
    const [mindSituation, setMindSituation] = useState("");

    const TASTE_EXAMPLES = [
        "마케팅 초보인데 실무에서 바로 써먹을 수 있는 브랜딩 책을 찾고 있어. 너무 이론적이지 않고 사례 중심으로 쉽게 설명된 책이 좋겠어.",
        "스타트업 창업을 준비 중인데 초기 팀 빌딩과 조직 문화를 다룬 책이 필요해. 실제 창업자 경험이 담긴 책이면 더 좋겠어.",
        "재테크를 처음 시작하려는데 주식보다는 자산 배분이나 투자 마인드셋을 쌓는 데 도움되는 책 추천해줘.",
    ];

    const MIND_EXAMPLES = [
        "요즘 번아웃이 와서 아무것도 하기 싫고 무기력해. 억지로 뭔가를 해야 한다는 압박 없이 그냥 쉬어가는 느낌의 책이 필요해.",
        "새로운 도시로 이사를 했는데 아는 사람이 없어서 외로워. 혼자만의 시간을 즐기는 방법이나 위로가 되는 책이 있을까?",
        "직장에서 인간관계가 너무 힘들어. 감정 소모 없이 관계를 유지하는 방법을 다룬 책을 읽고 싶어.",
    ];

    const handleRecommend = async () => {
        setLoading(true);
        setResult([]);

        const payload = mode === 'TASTE' ? {
            mode: 'TASTE',
            customQuery: tasteCustomTopic,
        } : {
            mode: 'MIND',
            situation: mindSituation,
        };

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setResult(list);
            setHasSearched(true);
            if (mode !== 'SELECT') {
                trackEvent({ name: 'recommend_complete', mode, resultCount: list.length });
            }
        } catch (e) {
            console.error(e);
            alert("추천 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMode('SELECT');
        setResult([]);
        setHasSearched(false);
        setTasteCustomTopic("");
        setMindSituation("");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-20 px-4">
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-2 flex justify-between items-center bg-primary/95 backdrop-blur-md border-b border-border shadow-sm" role="banner">
                <Link href="/" className="cursor-pointer flex items-center transition-opacity hover:opacity-80" aria-label="BookFit 홈으로 이동">
                    <Image src="/bookfit_logo2.png" alt="BookFit Logo" width={400} height={120} className="h-8 w-auto brightness-0 invert" priority />
                </Link>
            </header>

            <main className="w-full max-w-2xl mt-12" role="main">
                {/* 1. Mode Selection */}
                {mode === 'SELECT' && (
                    <div className="space-y-12 animate-fade-in-up">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold font-sans leading-tight text-primary">
                                어떤 책을 찾고 계신가요?
                            </h1>
                            <p className="text-muted-foreground text-xl">
                                당신의 목적에 맞는 추천 방식을 선택해주세요.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setMode('TASTE')}
                                className="group relative bg-secondary p-8 rounded-xl border border-border hover:border-accent hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full shadow-sm hover:shadow-md"
                            >
                                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 group-hover:text-accent transition-all text-primary">
                                    <Brain size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-primary group-hover:text-accent transition-colors">취향 추천</h2>
                                <p className="text-muted-foreground text-base leading-relaxed mb-6 flex-1">
                                    관심사와 독서 성향을 바탕으로,<br />지금 읽기 좋은 책을 정교하게 추천합니다.
                                </p>
                                <div className="text-accent text-base font-semibold flex items-center gap-2">
                                    시작하기 <ArrowRight size={18} />
                                </div>
                            </button>

                            <button
                                onClick={() => setMode('MIND')}
                                className="group relative bg-secondary p-8 rounded-xl border border-border hover:border-[#FF5678] hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full shadow-sm hover:shadow-md"
                            >
                                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 group-hover:text-[#FF5678] transition-all text-primary">
                                    <Heart size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-primary group-hover:text-[#FF5678] transition-colors">마음 추천</h2>
                                <p className="text-muted-foreground text-base leading-relaxed mb-6 flex-1">
                                    감정과 상황을 담아,<br />오늘의 당신에게 필요한 문장을 가진<br />책을 추천합니다.
                                </p>
                                <div className="text-[#FF5678] text-base font-semibold flex items-center gap-2">
                                    시작하기 <ArrowRight size={18} />
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Input Form - Taste */}
                {mode === 'TASTE' && !loading && !hasSearched && (
                    <section className="space-y-8 animate-fade-in">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold font-sans text-accent">취향 추천</h2>
                            <p className="text-muted-foreground">당신의 독서 취향을 알려주세요.</p>
                        </div>

                        <div className="space-y-5 bg-secondary p-8 rounded-xl border border-border shadow-sm">
                            <div className="space-y-3">
                                <label className="text-base font-bold text-primary uppercase tracking-wider flex justify-between">
                                    <span>어떤 책을 찾으시나요?</span>
                                    <span className="text-accent/80 text-sm normal-case font-normal">구체적일수록 추천이 정확해져요</span>
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="주제, 목적, 분위기, 상황 등을 자유롭게 적어주세요."
                                    className="w-full bg-background border border-input rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none text-base leading-relaxed shadow-sm"
                                    value={tasteCustomTopic}
                                    onChange={(e) => setTasteCustomTopic(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">이렇게 써보세요</span>
                                <div className="space-y-2">
                                    {TASTE_EXAMPLES.map((ex, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setTasteCustomTopic(ex)}
                                            className="w-full text-left px-4 py-3 rounded-lg bg-background border border-border hover:border-accent hover:bg-accent/5 transition-all text-sm text-muted-foreground hover:text-foreground leading-relaxed"
                                        >
                                            &ldquo;{ex}&rdquo;
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={reset} className="text-muted-foreground hover:text-primary transition-colors text-base font-medium flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4" /> 처음으로
                            </button>
                            <Button
                                onClick={handleRecommend}
                                disabled={!tasteCustomTopic || tasteCustomTopic.trim().length < 10}
                                className="bg-accent text-white hover:bg-primary px-8 py-6 rounded-lg text-lg font-bold shadow-md shadow-accent/20 hover:shadow-lg transition-all"
                            >
                                AI 맞춤 추천 받기
                            </Button>
                        </div>
                    </section>
                )}

                {/* 2. Input Form - Mind */}
                {mode === 'MIND' && !loading && !hasSearched && (
                    <section className="space-y-8 animate-fade-in">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold font-sans text-[#FF5678]">마음 추천</h2>
                            <p className="text-muted-foreground">오늘 당신의 마음은 어떤가요?</p>
                        </div>

                        <div className="space-y-5 bg-secondary p-8 rounded-xl border border-border shadow-sm">
                            <div className="space-y-3">
                                <label className="text-base font-bold text-primary uppercase tracking-wider flex justify-between">
                                    <span>지금 어떤 상황인가요?</span>
                                    <span className="text-[#FF5678]/80 text-sm font-normal normal-case">솔직하게 털어놓을수록 좋아요</span>
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="지금 겪고 있는 상황, 감정, 고민을 자유롭게 적어주세요."
                                    className="w-full bg-background border border-input rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5678] focus:ring-1 focus:ring-[#FF5678] transition-colors resize-none text-base leading-relaxed shadow-sm"
                                    value={mindSituation}
                                    onChange={(e) => setMindSituation(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">이렇게 써보세요</span>
                                <div className="space-y-2">
                                    {MIND_EXAMPLES.map((ex, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setMindSituation(ex)}
                                            className="w-full text-left px-4 py-3 rounded-lg bg-background border border-border hover:border-[#FF5678] hover:bg-[#FF5678]/5 transition-all text-sm text-muted-foreground hover:text-foreground leading-relaxed"
                                        >
                                            &ldquo;{ex}&rdquo;
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={reset} className="text-muted-foreground hover:text-primary transition-colors text-base font-medium flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4" /> 처음으로
                            </button>
                            <Button
                                onClick={handleRecommend}
                                disabled={!mindSituation || mindSituation.trim().length < 10}
                                className="bg-[#FF5678] text-white hover:opacity-90 px-8 py-6 rounded-lg text-lg font-bold shadow-md shadow-[#FF5678]/20 hover:shadow-lg transition-all"
                            >
                                공감 처방 받기
                            </Button>
                        </div>
                    </section>
                )}

                {/* 3. Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
                        <Loader2 size={48} className={`animate-spin ${mode === 'TASTE' ? 'text-accent' : 'text-[#FF5678]'}`} />
                        <div className="text-center">
                            <h3 className="text-2xl font-bold font-sans mb-2">
                                {mode === 'TASTE' ? "최적의 책을 선별하고 있습니다..." : "당신의 마음에 닿을 문장을 찾고 있습니다..."}
                            </h3>
                            <p className="text-gray-400 text-lg">잠시만 기다려주세요</p>
                        </div>
                    </div>
                )}

                {/* 4. Results */}
                {!loading && hasSearched && (
                    <section className="space-y-12 animate-fade-in w-full">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold font-sans text-foreground">
                                {mode === 'TASTE' ? <span className="text-accent">당신의 취향을 위한 큐레이션</span> : <span className="text-[#FF5678]">당신을 위해 준비했습니다</span>}
                            </h2>
                            <p className="text-muted-foreground text-base">
                                {result.length > 0 
                                    ? (mode === 'TASTE' ? "선정 기준에 부합하는 최고의 책들입니다." : "이 책들이 작은 위로가 되길 바랍니다.")
                                    : "최선을 다해 찾아봤지만 조건에 딱 맞는 책을 찾지 못했어요."}
                            </p>
                        </div>

                        {result.length > 0 && (
                            <div className="grid gap-8">
                                {result.map((book, i) => (
                                    <article key={i} className="flex flex-col md:flex-row gap-6 bg-secondary/50 border border-border p-6 rounded-xl hover:border-accent hover:bg-secondary/80 transition-all group h-full text-left relative shadow-sm">
                                        <div className="w-full md:w-32 flex-shrink-0">
                                            <div className="aspect-[1/1.5] w-28 mx-auto md:w-full rounded-md overflow-hidden bg-muted relative shadow-lg border border-border">
                                                {book.imageUrl ? (
                                                    <Image
                                                        src={book.imageUrl.replace("coversum", "cover500").replace(/^http:/i, "https:")}
                                                        alt={`${book.displayTitle} 도서 커버`}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded bg-background border border-border uppercase tracking-wider ${mode === 'TASTE' ? 'text-accent' : 'text-[#FF5678]'}`}>
                                                        {book.userConnectionPoint}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
                                                    {book.displayTitle}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{book.displayAuthor}</p>
                                            </div>

                                            <div className={`p-4 rounded-lg bg-background border ${mode === 'TASTE' ? 'border-accent/20' : 'border-[#FF5678]/20'}`}>
                                                <p className="text-foreground text-sm leading-relaxed font-medium">
                                                    &quot;{book.reason}&quot;
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <a
                                                    href={book.coupangLink || `https://www.coupang.com/np/search?q=${encodeURIComponent(book.displayTitle || book.title)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${mode === 'TASTE' ? 'bg-accent text-white hover:bg-accent/80' : 'bg-[#FF5678] text-white hover:bg-[#FF5678]/80'}`}
                                                >
                                                    구매처 보기
                                                </a>
                                                <a
                                                    href={book.link || `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&KeyWord=${encodeURIComponent(book.displayTitle || book.title)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm border border-border text-foreground hover:bg-secondary transition-all"
                                                >
                                                    알라딘에서 찾기
                                                </a>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        <div className="text-center pt-10">
                            <Button onClick={reset} variant="outline" className="border-border text-muted-foreground hover:text-foreground py-6 px-8">
                                처음으로 돌아가기
                            </Button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
