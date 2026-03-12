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
    coupangLink: string | null;
}

export default function RecommendPage() {
    const [mode, setMode] = useState<Mode>('SELECT');
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // New: Condition for showing search view
    const [result, setResult] = useState<RecommendedBook[]>([]);

    // Inputs
    const [tasteTopics, setTasteTopics] = useState<string[]>([]);
    const [tasteCustomTopic, setTasteCustomTopic] = useState("");
    const [tasteStyle, setTasteStyle] = useState("");
    const [tastePurpose, setTastePurpose] = useState("");
    const [tasteReadingLevel, setTasteReadingLevel] = useState("");

    const [mindEmotions, setMindEmotions] = useState<string[]>([]);
    const [mindSituation, setMindSituation] = useState("");
    const [mindWantTo, setMindWantTo] = useState("");
    const [mindReadingMood, setMindReadingMood] = useState("");

    const TASTE_TAGS = ["자기계발", "창업/비즈니스", "마케팅", "심리/인간관계", "소설/문학", "인문/철학", "트렌드", "재테크"];
    const TASTE_STYLES = ["실용적이고 구체적인", "새로운 인사이트", "가볍고 재미있는", "깊이 있는/학술적인"];
    const TASTE_PURPOSES = ["배경지식", "실무적용", "영감", "재미"];
    const TASTE_READING_LEVELS = ["입문", "중급", "심화"];

    const MIND_EMOTIONS = ["지침/번아웃", "불안/걱정", "자존감 하락", "관계의 어려움", "무기력", "새로운 시작", "위로가 필요해"];
    const MIND_WANT_TO = ["위로", "이해", "변화", "현실도피"];
    const MIND_READING_MOODS = ["가볍게", "깊이"];

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
            style: tasteStyle,
            purpose: tastePurpose,
            readingLevel: tasteReadingLevel
        } : {
            mode: 'MIND',
            emotion: mindEmotions,
            situation: mindSituation,
            wantTo: mindWantTo,
            readingMood: mindReadingMood
        };

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setResult(Array.isArray(data) ? data : []);
            setHasSearched(true);
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
        setTasteTopics([]);
        setTasteCustomTopic("");
        setTasteStyle("");
        setTastePurpose("");
        setTasteReadingLevel("");
        setMindEmotions([]);
        setMindSituation("");
        setMindWantTo("");
        setMindReadingMood("");
    };

    return (
        <div className="min-h-screen bg-[#061A14] text-white flex flex-col items-center py-20 px-4">
            <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-2 flex justify-between items-center bg-[#061A14]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]" role="banner">
                <Link href="/" className="cursor-pointer flex items-center transition-opacity hover:opacity-80" aria-label="BookFit 홈으로 이동">
                    <Image src="/bookfit_logo2.png" alt="BookFit Logo" width={400} height={120} className="h-8 w-auto" priority />
                </Link>
            </header>

            <main className="w-full max-w-2xl mt-12" role="main">
                {/* 1. Mode Selection */}
                {mode === 'SELECT' && (
                    <div className="space-y-12 animate-fade-in-up">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
                                어떤 책을 찾고 계신가요?
                            </h1>
                            <p className="text-gray-400 text-xl">
                                당신의 목적에 맞는 추천 방식을 선택해주세요.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Taste Mode */}
                            <button
                                onClick={() => setMode('TASTE')}
                                className="group relative bg-[#0B2A1F] p-8 rounded-xl border border-white/10 hover:border-accent hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full"
                                aria-label="취향 기반 도서 추천 시작하기"
                            >
                                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 group-hover:text-accent transition-all" aria-hidden="true">
                                    <Brain size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">취향 추천</h2>
                                <p className="text-gray-400 text-base leading-relaxed mb-6 flex-1">
                                    &quot;관심사와 독서 성향을 바탕으로,<br />지금 읽기 좋은 책을 정교하게 추천합니다.&quot;
                                </p>
                                <div className="text-accent text-base font-semibold flex items-center gap-2">
                                    시작하기 <ArrowRight size={18} />
                                </div>
                            </button>

                            {/* Mind Mode */}
                            <button
                                onClick={() => setMode('MIND')}
                                className="group relative bg-[#0B2A1F] p-8 rounded-xl border border-white/10 hover:border-[#FF5678] hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full"
                                aria-label="심리/마음 상태 기반 도서 추천 시작하기"
                            >
                                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 group-hover:text-[#FF5678] transition-all" aria-hidden="true">
                                    <Heart size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-[#FF5678] transition-colors">마음 추천</h2>
                                <p className="text-gray-400 text-base leading-relaxed mb-6 flex-1">
                                    &quot;감정과 상황을 담아,<br />오늘의 당신에게 필요한 문장을 가진<br />책을 추천합니다.&quot;
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
                    <section className="space-y-8 animate-fade-in" aria-labelledby="taste-title">
                        <div className="text-center space-y-2">
                            <h2 id="taste-title" className="text-3xl font-bold font-serif text-accent">취향 추천</h2>
                            <p className="text-gray-400">당신의 독서 취향을 알려주세요.</p>
                        </div>

                        <div className="space-y-6 bg-[#0B2A1F]/50 p-8 rounded-xl border border-white/5">
                            {/* Custom Query Section (Primary) */}
                            <div className="space-y-3">
                                <label htmlFor="taste-input" className="text-base font-bold text-gray-300 uppercase tracking-wider flex justify-between">
                                    <span>어떤 책을 찾으시나요? (필수)</span>
                                    <span className="text-accent/80 text-sm normal-case">* 최소 10자 이상 입력해주세요</span>
                                </label>
                                <textarea
                                    id="taste-input"
                                    rows={4}
                                    placeholder="찾으시는 책의 주제, 목적, 난이도를 자유롭게 적어주세요.&#13;&#10;(예: 마케팅 초보자인데, 브랜딩의 기초부터 실무까지 쉽게 배울 수 있는 책을 추천해줘.)"
                                    className="w-full bg-[#061A14] border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent transition-colors resize-none text-lg leading-relaxed"
                                    value={tasteCustomTopic}
                                    onChange={(e) => setTasteCustomTopic(e.target.value)}
                                />
                                <div className="bg-accent/5 border border-accent/10 p-4 rounded-lg">
                                    <p className="text-base text-accent flex items-start gap-2 leading-relaxed">
                                        <Sparkles size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                                        <span>최대한 자세하게 작성해 주셔야 딱 맞는 책을 찾아드릴 수 있어요!<br/><strong>[주제 + 난이도 + 목적]</strong>을 포함해 보세요.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Topic Tags Section (Secondary) */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">관심 키워드 (참고용)</span>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="관심 키워드 선택">
                                    {TASTE_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTasteTag(tag)}
                                            aria-pressed={tasteTopics.includes(tag)}
                                            className={`px-4 py-2 rounded-full text-base transition-all border ${tasteTopics.includes(tag)
                                                ? 'bg-accent/30 text-accent border-accent font-bold'
                                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Purpose Section */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">이 책의 목적</span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup" aria-label="책의 목적 선택">
                                    {TASTE_PURPOSES.map(purpose => (
                                        <button
                                            key={purpose}
                                            onClick={() => setTastePurpose(purpose)}
                                            role="radio"
                                            aria-checked={tastePurpose === purpose}
                                            className={`px-4 py-3 rounded-lg text-base transition-all border text-center ${tastePurpose === purpose
                                                ? 'bg-accent/30 text-accent border-accent font-bold'
                                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {purpose === '배경지식' ? '📚 배경지식 쌓기' : purpose === '실무적용' ? '⚡ 실무에 바로 쓰기' : purpose === '영감' ? '💡 영감 받기' : '😊 그냥 재미로'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reading Level Section */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">원하는 난이도</span>
                                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="원하는 난이도 선택">
                                    {TASTE_READING_LEVELS.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setTasteReadingLevel(level)}
                                            role="radio"
                                            aria-checked={tasteReadingLevel === level}
                                            className={`px-4 py-3 rounded-lg text-base transition-all border text-center ${tasteReadingLevel === level
                                                ? 'bg-accent/30 text-accent border-accent font-bold'
                                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {level === '입문' ? '🌱 입문자예요' : level === '중급' ? '📖 어느정도 알아요' : '🔥 깊이 파고 싶어요'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Style Section */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">선호 스타일 (참고용)</span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup" aria-label="선호 스타일 선택">
                                    {TASTE_STYLES.map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setTasteStyle(style)}
                                            role="radio"
                                            aria-checked={tasteStyle === style}
                                            className={`px-4 py-3 rounded-lg text-base transition-all border text-center ${tasteStyle === style
                                                ? 'bg-accent/30 text-accent border-accent font-bold'
                                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={reset} className="text-gray-400 hover:text-white transition-colors text-base">처음으로</button>
                            <Button
                                onClick={handleRecommend}
                                disabled={!tasteCustomTopic || tasteCustomTopic.length < 10}
                                className="bg-accent text-[#061A14] hover:bg-white px-8 py-6 rounded-lg text-lg font-bold shadow-[0_0_15px_rgba(56,255,168,0.2)] hover:shadow-[0_0_25px_rgba(56,255,168,0.4)] transition-all"
                                aria-label="입력한 취향에 따른 도서 추천 받기"
                            >
                                <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
                                AI 맞춤 추천 받기
                            </Button>
                        </div>
                    </section>
                )}

                {/* 2. Input Form - Mind */}
                {mode === 'MIND' && !loading && !hasSearched && (
                    <section className="space-y-8 animate-fade-in" aria-labelledby="mind-title">
                        <div className="text-center space-y-2">
                            <h2 id="mind-title" className="text-3xl font-bold font-serif text-[#FF5678]">마음 추천</h2>
                            <p className="text-gray-400">오늘 당신의 마음은 어떤가요?</p>
                        </div>

                        <div className="space-y-6 bg-[#0B2A1F]/50 p-8 rounded-xl border border-white/5">
                            {/* Situation Input (Primary) */}
                            <div className="space-y-3">
                                <label htmlFor="mind-input" className="text-base font-bold text-gray-300 uppercase tracking-wider flex justify-between">
                                    <span>상황 설명 (필수)</span>
                                    <span className="text-[#FF5678] text-sm font-bold normal-case">* 최소 10자 이상 입력해주세요</span>
                                </label>
                                <textarea
                                    id="mind-input"
                                    rows={4}
                                    placeholder="지금 겪고 있는 상황이나 고민을 구체적으로 적어주세요. (예: 요즘 번아웃이 와서 아무것도 하기 싫고 무기력해요. 위로가 필요합니다.)"
                                    className="w-full bg-[#061A14] border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5678] transition-colors resize-none text-lg leading-relaxed"
                                    value={mindSituation}
                                    onChange={(e) => setMindSituation(e.target.value)}
                                />
                                <div className="bg-[#FF5678]/5 border border-[#FF5678]/10 p-4 rounded-lg">
                                    <p className="text-base text-[#FF5678] font-medium flex items-start gap-2 leading-relaxed">
                                        <Heart size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                                        <span>어떤 마음인지 자세하게 들려주실수록 더 깊은 위로의 책을 찾아드릴 수 있어요.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Want To Section */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">책에서 원하는 것</span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup" aria-label="책에서 원하는 것 선택">
                                    {MIND_WANT_TO.map(wantTo => (
                                        <button
                                            key={wantTo}
                                            onClick={() => setMindWantTo(wantTo)}
                                            role="radio"
                                            aria-checked={mindWantTo === wantTo}
                                            className={`px-4 py-3 rounded-lg text-base transition-all border text-center ${mindWantTo === wantTo
                                                ? 'bg-[#FF5678] text-white border-[#FF5678] font-bold'
                                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {wantTo === '위로' ? '🤗 그냥 위로받고 싶어' : wantTo === '이해' ? '🔍 상황을 이해하고 싶어' : wantTo === '변화' ? '🚀 변화하고 싶어' : '🌙 현실 도피하고 싶어'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reading Mood Section */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">독서 무드</span>
                                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="독서 무드 선택">
                                    {MIND_READING_MOODS.map(mood => (
                                        <button
                                            key={mood}
                                            onClick={() => setMindReadingMood(mood)}
                                            role="radio"
                                            aria-checked={mindReadingMood === mood}
                                            className={`px-4 py-3 rounded-lg text-base transition-all border text-center ${mindReadingMood === mood
                                                ? 'bg-[#FF5678] text-white border-[#FF5678] font-bold'
                                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {mood === '가볍게' ? '☁️ 가볍게 흘려읽기' : '🎯 천천히 깊이 읽기'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Emotion Section */}
                            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-base font-bold text-gray-400 uppercase tracking-wider">감정/상태 키워드 (참고용)</span>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="감정/상태 키워드 선택">
                                    {MIND_EMOTIONS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleMindEmotion(tag)}
                                            aria-pressed={mindEmotions.includes(tag)}
                                            className={`px-4 py-2 rounded-full text-base transition-all border ${mindEmotions.includes(tag)
                                                ? 'bg-[#FF5678] text-white border-[#FF5678] font-bold'
                                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={reset} className="text-gray-400 hover:text-white transition-colors text-base">처음으로</button>
                            <Button
                                onClick={handleRecommend}
                                disabled={!mindSituation || mindSituation.length < 10}
                                className="bg-[#FF5678] text-white hover:bg-white hover:text-[#FF5678] px-8 py-6 rounded-lg text-lg font-bold shadow-[0_0_15px_rgba(255,86,120,0.3)] hover:shadow-[0_0_25px_rgba(255,86,120,0.5)] transition-all"
                                aria-label="현재 마음 상태에 따른 도서 처방 받기"
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
                                {mode === 'TASTE' ? "최적의 책을 선별하고 있습니다..." : "당신의 마음에 닿을 문장을 찾고 있습니다..."}
                            </h3>
                            <p className="text-gray-400 text-lg">
                                잠시만 기다려주세요
                            </p>
                        </div>
                    </div>
                )}

                {/* 4. Results & Empty State */}
                {!loading && hasSearched && (
                    <section className="space-y-12 animate-fade-in w-full text-center" aria-labelledby="results-title">
                        <div className="space-y-2">
                            <h2 id="results-title" className="text-3xl font-bold font-serif text-white">
                                {mode === 'TASTE' ? <span className="text-accent">당신의 취향을 위한 큐레이션</span> : <span className="text-[#FF5678]">당신을 위해 준비했습니다</span>}
                            </h2>
                            <p className="text-gray-300 text-base">
                                {result.length > 0 
                                    ? (mode === 'TASTE' ? "선정 기준에 부합하는 최고의 책 3권입니다." : "이 책들이 작은 위로가 되길 바랍니다.")
                                    : "최선을 다해 찾아봤지만..."}
                            </p>
                        </div>

                        {result.length > 0 ? (
                            <>
                                <div className="grid gap-8">
                                    {result.map((book, i) => {
                                        const CardContent = (
                                            <article className="flex flex-col md:flex-row gap-6 bg-[#0B2A1F]/30 border border-white/5 p-6 rounded-xl hover:border-white/20 hover:bg-[#0B2A1F]/40 transition-all cursor-pointer group h-full text-left relative">
                                                {/* Cover */}
                                                <div className="w-full md:w-32 flex-shrink-0">
                                                    <div className="aspect-[1/1.5] w-28 mx-auto md:w-full rounded-md overflow-hidden bg-black/50 relative shadow-lg group-hover:shadow-accent/20 transition-all">
                                                        {typeof book.imageUrl === 'string' && book.imageUrl ? (
                                                            <Image
                                                                src={book.imageUrl.replace("coversum", "cover500").replace(/^http:/i, "https:")}
                                                                alt={`${book.displayTitle} 도서 커버`}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">No Image</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-base font-bold px-3 py-1.5 rounded bg-white/10 uppercase tracking-wider ${mode === 'TASTE' ? 'text-accent' : 'text-[#FF5678]'}`}>
                                                                {book.userConnectionPoint}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accent transition-colors">
                                                            {book.displayTitle}
                                                        </h3>
                                                        <p className="text-base text-gray-400">{book.displayAuthor}</p>
                                                    </div>

                                                    <div className={`p-4 rounded-lg relative ${mode === 'TASTE' ? 'bg-accent/5 border border-accent/10' : 'bg-[#FF5678]/5 border border-[#FF5678]/10'}`}>
                                                        <p className="text-gray-100 text-base leading-relaxed font-medium">
                                                            &quot;{book.reason}&quot;
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {book.coupangLink && (
                                                            <div 
                                                                className={`text-base font-bold px-6 py-3 rounded-md transition-all flex items-center gap-2 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 ${
                                                                    mode === 'TASTE' 
                                                                    ? 'bg-accent text-[#061A14] group-hover:bg-white' 
                                                                    : 'bg-[#FF5678] text-white group-hover:bg-white group-hover:text-[#FF5678]'
                                                                }`}
                                                            >
                                                                <Image src="https://img.icons8.com/color/48/coupang.png" alt="Coupang" width={20} height={20} className="brightness-110" unoptimized />
                                                                쿠팡에서 구매하기
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-gray-500 flex items-center ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                            클릭하여 스토어로 이동 →
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );

                                        return book.coupangLink ? (
                                            <a 
                                                key={i} 
                                                href={book.coupangLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block outline-none no-underline"
                                            >
                                                {CardContent}
                                            </a>
                                        ) : (
                                            <div key={i}>{CardContent}</div>
                                        );
                                    })}
                                </div>

                                {/* Coupang Widget Section */}
                                <div className="w-full flex flex-col items-center bg-[#0B2A1F]/30 p-6 rounded-2xl border border-white/10 shadow-sm mt-8 mb-8">
                                    <p className="text-gray-300 mb-4 font-medium text-center text-lg">💡 추천받은 책, 쿠팡에서 바로 찾아보세요!</p>
                                    <div className="w-full overflow-hidden rounded-lg bg-white/80 p-1">
                                        <iframe src="https://coupa.ng/clGXS1" width="100%" height="44" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url"></iframe>
                                    </div>
                                    <p className="text-[#9CA3AF] mt-4 text-center text-base">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
                                </div>
                            </>
                        ) : (
                            /* 2번 피드백 반영: 결과가 0건일 때 결과 페이지 하단에 노출될 Empty State 섹션 */
                            <div className="text-center py-16 space-y-6 animate-fade-in bg-[#0B2A1F]/20 rounded-2xl border border-dashed border-white/10 p-12">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles size={40} className="text-gray-500" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold font-serif">어울리는 책을 찾지 못했어요..</h3>
                                    <p className="text-gray-300 max-w-md mx-auto leading-relaxed text-lg">
                                        회장님이 주신 정보로 최선을 다해 찾아봤지만, 딱 맞는 책을 발견하지 못했습니닷! 조금 더 자세하게 설명해주실 수 있을까요?
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => setHasSearched(false)} 
                                    className={`px-8 py-6 rounded-lg text-lg font-bold transition-all ${
                                        mode === 'TASTE' 
                                        ? 'bg-accent text-[#061A14] hover:bg-white shadow-[0_0_15px_rgba(56,255,168,0.2)]' 
                                        : 'bg-[#FF5678] text-white hover:bg-white hover:text-[#FF5678] shadow-[0_0_15px_rgba(255,86,120,0.3)]'
                                    }`}
                                >
                                    다시 자세히 적어보기
                                </Button>
                            </div>
                        )}

                        <div className="text-center pt-10">
                            <Button onClick={reset} variant="outline" className="border-white/20 text-gray-400 hover:text-white hover:bg-white/10 text-base py-6 px-8" aria-label="추천 다시 받으러 가기">
                                {result.length > 0 ? "다시 추천 받기" : "처음으로 돌아가기"}
                            </Button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
