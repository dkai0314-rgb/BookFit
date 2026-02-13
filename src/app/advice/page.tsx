"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/survey/choice-card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles, RefreshCcw } from "lucide-react";
import Link from "next/link";

const TOTAL_STEPS = 2;

const EMOTIONS = [
    { label: "행복함", value: "happy", icon: "😊" },
    { label: "차분함", value: "calm", icon: "🌿" },
    { label: "우울함", value: "depressed", icon: "☁️" },
    { label: "지침", value: "tired", icon: "🔋" },
    { label: "불안함", value: "anxious", icon: "🌪️" },
    { label: "설렘", value: "excited", icon: "✨" },
];

const SITUATIONS = [
    { label: "인간관계 고민", value: "relationship" },
    { label: "진로/취업", value: "career" },
    { label: "번아웃/휴식", value: "burnout" },
    { label: "자기계발/성장", value: "growth" },
    { label: "경제/재테크", value: "money" },
    { label: "단순 심심풀이", value: "killing_time" },
];

// Simple advice mapping (MVP)
const ADVICE_MAPPING: Record<string, string[]> = {
    happy: ["즐거운 순간을 만끽하세요! 이 에너지가 당신을 더 멀리 데려갈 거예요.", "지금의 행복을 기록해두면, 힘든 날 큰 위로가 됩니다."],
    calm: ["평온함은 가장 큰 힘입니다. 이 고요함 속에서 내면의 소리를 들어보세요.", "잠시 멈춰서 차 한 잔의 여유를 즐기기에 완벽한 날이네요."],
    depressed: ["힘든 날도 지나가기 마련이에요. 오늘은 스스로를 좀 더 다독여주세요.", "작은 성취 하나만 만들어도 충분해요. 이불 개기부터 시작해보는 건 어떨까요?"],
    tired: ["잠시 멈추라는 신호일 수 있어요. 죄책감 없이 푹 쉬는 것도 능력입니다.", "배터리가 방전되면 충전이 필요하듯, 당신에게도 휴식이 필요해요."],
    anxious: ["걱정의 대부분은 실제로 일어나지 않아요. 지금 이 순간에 집중해보세요.", "깊게 숨을 들이마시고 내뱉으세요. 당신은 생각보다 훨씬 강합니다."],
    excited: ["그 설렘이 새로운 시작의 원동력이 될 거예요. 지금 바로 도전해보세요!", "두근거림을 즐기세요! 멋진 일이 당신을 기다리고 있습니다."],
    relationship: ["관계는 난로와 같아서, 너무 가까우면 데이고 멀면 추워요. 적당한 거리가 필요해요.", "모든 사람에게 사랑받을 필요는 없습니다. 나를 아껴주는 사람들에게 집중하세요."],
    career: ["방향이 중요하다면 속도는 중요하지 않아요. 당신만의 속도로 나아가세요.", "지금의 고민은 당신이 성장하고 있다는 증거입니다."],
    burnout: ["아무것도 하지 않는 시간도 인생에는 꼭 필요합니다.", "열심히 달린 당신, 잠시 엔진을 끄고 식히는 시간을 가지세요."],
    growth: ["어제의 나보다 1%만 더 나아지면 됩니다. 꾸준함이 비결이에요.", "배움에는 끝이 없죠. 당신의 호기심이 당신을 성장시킬 거예요."],
    money: ["돈은 좋은 하인이지만 나쁜 주인입니다. 돈의 주인이 되세요.", "작은 습관이 모여 큰 부를 만듭니다. 오늘 커피 한 잔 값부터 아껴볼까요?"],
    killing_time: ["심심함은 창의력의 원천이 되기도 합니다. 멍 때리는 시간을 즐겨보세요.", "평소에 읽지 않던 장르의 책을 펼쳐보는 건 어떨까요?"],
};

export default function AdvicePage() {
    const [step, setStep] = useState(1);
    const [emotion, setEmotion] = useState<string>("");
    const [situation, setSituation] = useState<string>("");
    const [advice, setAdvice] = useState<string>("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const handleNext = () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1);
        } else {
            generateAdvice();
        }
    };

    const handlePrev = () => {
        setStep(step - 1);
    };

    const generateAdvice = () => {
        // Simple logic: Combine emotion advice + situation advice
        const emotionAdvice = ADVICE_MAPPING[emotion]?.[Math.floor(Math.random() * ADVICE_MAPPING[emotion]?.length)] || "";
        const situationAdvice = ADVICE_MAPPING[situation]?.[Math.floor(Math.random() * ADVICE_MAPPING[situation]?.length)] || "";

        setAdvice(`${emotionAdvice} \n\n ${situationAdvice}`);
        setStep(3); // Result Step
    };

    const reset = () => {
        setStep(1);
        setEmotion("");
        setSituation("");
        setAdvice("");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header (Hidden on result step) */}
                {step <= TOTAL_STEPS && (
                    <div className="space-y-4 text-center">
                        <div className="mb-8">
                            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" /> BookFit 홈으로
                            </Link>
                        </div>
                        <div className="w-full bg-secondary/30 h-2 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {step} / {TOTAL_STEPS}
                        </p>
                    </div>
                )}

                {/* Question Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {step === 1 && (
                            <>
                                <h2 className="text-2xl md:text-3xl font-bold text-center text-primary break-keep">
                                    오늘 하루, 기분이 어떠신가요?
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {EMOTIONS.map((item) => (
                                        <ChoiceCard
                                            key={item.value}
                                            label={item.label}
                                            icon={<span className="text-2xl">{item.icon}</span>}
                                            selected={emotion === item.value}
                                            onClick={() => setEmotion(item.value)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className="text-2xl md:text-3xl font-bold text-center text-primary break-keep">
                                    요즘 가장 큰 고민거리는 무엇인가요?
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {SITUATIONS.map((item) => (
                                        <ChoiceCard
                                            key={item.value}
                                            label={item.label}
                                            selected={situation === item.value}
                                            onClick={() => setSituation(item.value)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-8 py-10">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6"
                                >
                                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                                        <Sparkles className="w-12 h-12 text-primary" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                        오늘의 조언
                                    </h2>
                                    <div className="bg-card border border-border/50 p-8 rounded-2xl shadow-sm max-w-lg mx-auto">
                                        <p className="text-lg md:text-xl text-muted-foreground whitespace-pre-line leading-relaxed">
                                            {advice}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 justify-center pt-8">
                                        <Button onClick={reset} variant="outline" className="gap-2">
                                            <RefreshCcw className="w-4 h-4" /> 다시 하기
                                        </Button>
                                        <Link href="/search">
                                            <Button className="gap-2 bg-primary hover:bg-primary/90">
                                                이 기분에 맞는 책 찾기 <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation (Hidden on result step) */}
                {step <= TOTAL_STEPS && (
                    <div className="flex justify-between pt-8">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={step === 1}
                            className="text-muted-foreground hover:text-primary"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            이전
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={(step === 1 && !emotion) || (step === 2 && !situation)}
                            className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full shadow-lg transition-all"
                        >
                            {step === TOTAL_STEPS ? "조언 보기" : "다음"}
                            {step !== TOTAL_STEPS && <ChevronRight className="w-4 h-4 ml-2" />}
                            {step === TOTAL_STEPS && <Sparkles className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
