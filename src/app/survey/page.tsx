"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSurveyStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/survey/progress-bar";
import { ChoiceCard } from "@/components/survey/choice-card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Search, Smile, Leaf, Cloud, BatteryFull, Wind, Sparkles, ChevronDown, Brain } from "lucide-react";
import Link from "next/link";

const TOTAL_STEPS = 4;

const EMOTIONS = [
    { label: "행복함", value: "happy", icon: <Smile className="w-6 h-6 text-yellow-500" /> },
    { label: "차분함", value: "calm", icon: <Leaf className="w-6 h-6 text-green-500" /> },
    { label: "우울함", value: "depressed", icon: <Cloud className="w-6 h-6 text-slate-400" /> },
    { label: "지침", value: "tired", icon: <BatteryFull className="w-6 h-6 text-red-400" /> },
    { label: "불안함", value: "anxious", icon: <Wind className="w-6 h-6 text-blue-300" /> },
    { label: "설렘", value: "excited", icon: <Sparkles className="w-6 h-6 text-pink-400" /> },
];

const SITUATIONS = [
    { label: "인간관계 고민", value: "relationship" },
    { label: "진로/취업", value: "career" },
    { label: "번아웃/휴식", value: "burnout" },
    { label: "자기계발/성장", value: "growth" },
    { label: "경제/재테크", value: "money" },
    { label: "단순 심심풀이", value: "killing_time" },
];

const STYLES = [
    { label: "따뜻한 위로", value: "warm" },
    { label: "냉철한 직언", value: "cold" },
    { label: "논리적 분석", value: "logic" },
    { label: "가벼운 후루룩", value: "light" },
];

// Guide Chips for Step 4
const GUIDE_CHIPS = [
    "쉽고 잘 읽히는 뇌과학 입문서",
    "지친 마음을 달래줄 힐링 에세이",
    "주식 투자 초보를 위한 필독서",
    "몰입감 넘치는 추리 소설",
];

export default function SurveyPage() {
    const router = useRouter();
    const { step, nextStep, prevStep, answers, setAnswer } = useSurveyStore();
    const [isClient, setIsClient] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const handleNext = async () => {
        if (step < TOTAL_STEPS) {
            nextStep();
        } else {
            // Final Step: Submit
            setIsSubmitting(true);
            try {
                const response = await fetch('/api/recommend', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userRequest: answers.userRequest,
                        userEmotion: answers.emotion
                    })
                });

                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    useSurveyStore.getState().setRecommendations(data.items);
                    router.push("/result");
                } else {
                    console.error("No recommendations found");
                    // TODO: Show error toast or message
                    router.push("/");
                }
            } catch (error) {
                console.error("Failed to get recommendation", error);
                router.push("/");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return answers.emotion.length > 0;
            case 2: return answers.situation.length > 0;
            case 3: return answers.style !== "";
            case 4: return answers.userRequest.trim().length > 5; // Minimum 5 chars
            default: return false;
        }
    };

    const toggleSelection = (key: keyof typeof answers, value: string, single = false) => {
        const current = answers[key];
        if (single) {
            setAnswer(key, value);
        } else {
            const array = current as string[];
            if (array.includes(value)) {
                setAnswer(key, array.filter((v) => v !== value));
            } else {
                setAnswer(key, [...array, value]);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header Links */}
                <div className="flex justify-start">
                    <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm">
                        BookFit 홈으로
                    </Link>
                </div>

                {/* Question Area */}
                <div className="space-y-4 text-center">
                    <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
                    <p className="text-sm font-medium text-muted-foreground">
                        {step} / {TOTAL_STEPS}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary break-keep leading-tight">
                            {step === 1 && "오늘 하루, 기분이 어떠셨나요?"}
                            {step === 2 && "요즘 가장 큰 고민거리는 무엇인가요?"}
                            {step === 3 && "어떤 스타일의 조언을 원하시나요?"}
                            {step === 4 && "어떤 책을 찾고 계신가요?"}
                        </h2>

                        {/* Step 1: Emotion */}
                        {step === 1 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {EMOTIONS.map((item) => (
                                    <ChoiceCard
                                        key={item.value}
                                        label={item.label}
                                        icon={<span className="text-2xl">{item.icon}</span>}
                                        selected={answers.emotion.includes(item.value)}
                                        onClick={() => toggleSelection("emotion", item.value)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Step 2: Situation */}
                        {step === 2 && (
                            <div className="grid grid-cols-2 gap-4">
                                {SITUATIONS.map((item) => (
                                    <ChoiceCard
                                        key={item.value}
                                        label={item.label}
                                        selected={answers.situation.includes(item.value)}
                                        onClick={() => toggleSelection("situation", item.value)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Step 3: Style */}
                        {step === 3 && (
                            <div className="grid grid-cols-2 gap-4">
                                {STYLES.map((item) => (
                                    <ChoiceCard
                                        key={item.value}
                                        label={item.label}
                                        selected={answers.style === item.value}
                                        onClick={() => toggleSelection("style", item.value, true)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Step 4: Natural Language Input */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <textarea
                                        className="w-full h-32 p-4 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none shadow-sm"
                                        placeholder="예) 뇌과학에 대해 알고 싶어요. 쉽고 잘 읽히는 입문용으로 추천해주세요."
                                        value={answers.userRequest}
                                        onChange={(e) => setAnswer("userRequest", e.target.value)}
                                    />
                                    <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                                        {answers.userRequest.length} / 200
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
                                        어떻게 써야 할지 모르겠다면? <ChevronDown className="w-4 h-4" />
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {GUIDE_CHIPS.map((chip) => (
                                            <button
                                                key={chip}
                                                onClick={() => setAnswer("userRequest", chip)}
                                                className="px-3 py-1.5 text-xs rounded-full bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 transition-colors"
                                            >
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between pt-8">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1 || isSubmitting}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        이전
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!isStepValid() || isSubmitting}
                        className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">분석 중... <Brain className="w-4 h-4 animate-pulse" /></span>
                        ) : (
                            <>
                                {step === TOTAL_STEPS ? "AI 추천 받기" : "다음"}
                                {step !== TOTAL_STEPS && <ChevronRight className="w-4 h-4 ml-2" />}
                                {step === TOTAL_STEPS && <Search className="w-4 h-4 ml-2" />}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
