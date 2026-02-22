"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/survey/choice-card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles, RefreshCcw } from "lucide-react";
import Link from "next/link";

const TOTAL_STEPS = 2;

const EMOTIONS = [
    { label: "?‰ë³µ??, value: "happy", icon: "?˜Š" },
    { label: "ì°¨ë¶„??, value: "calm", icon: "?Œ¿" },
    { label: "?°ìš¸??, value: "depressed", icon: "?ï¸" },
    { label: "ì§€ì¹?, value: "tired", icon: "?”‹" },
    { label: "ë¶ˆì•ˆ??, value: "anxious", icon: "?Œªï¸? },
    { label: "?¤ë ˜", value: "excited", icon: "?? },
];

const SITUATIONS = [
    { label: "?¸ê°„ê´€ê³?ê³ ë?", value: "relationship" },
    { label: "ì§„ë¡œ/ì·¨ì—…", value: "career" },
    { label: "ë²ˆì•„???´ì‹", value: "burnout" },
    { label: "?ê¸°ê³„ë°œ/?±ì¥", value: "growth" },
    { label: "ê²½ì œ/?¬í…Œ??, value: "money" },
    { label: "?¨ìˆœ ?¬ì‹¬?€??, value: "killing_time" },
];

// Simple advice mapping (MVP)
const ADVICE_MAPPING: Record<string, string[]> = {
    happy: ["ì¦ê±°???œê°„??ë§Œë½?˜ì„¸?? ???ë„ˆì§€ê°€ ?¹ì‹ ????ë©€ë¦??°ë ¤ê°?ê±°ì˜ˆ??", "ì§€ê¸ˆì˜ ?‰ë³µ??ê¸°ë¡?´ë‘ë©? ?˜ë“  ?????„ë¡œê°€ ?©ë‹ˆ??"],
    calm: ["?‰ì˜¨?¨ì? ê°€?????˜ì…?ˆë‹¤. ??ê³ ìš”???ì—???´ë©´???Œë¦¬ë¥??¤ì–´ë³´ì„¸??", "? ì‹œ ë©ˆì¶°??ì°????”ì˜ ?¬ìœ ë¥?ì¦ê¸°ê¸°ì— ?„ë²½??? ì´?¤ìš”."],
    depressed: ["?˜ë“  ? ë„ ì§€?˜ê?ê¸?ë§ˆë ¨?´ì—?? ?¤ëŠ˜?€ ?¤ìŠ¤ë¡œë? ì¢€ ???¤ë…?¬ì£¼?¸ìš”.", "?‘ì? ?±ì·¨ ?˜ë‚˜ë§?ë§Œë“¤?´ë„ ì¶©ë¶„?´ìš”. ?´ë¶ˆ ê°œê¸°ë¶€???œì‘?´ë³´??ê±??´ë–¨ê¹Œìš”?"],
    tired: ["? ì‹œ ë©ˆì¶”?¼ëŠ” ? í˜¸?????ˆì–´?? ì£„ì±…ê°??†ì´ ???¬ëŠ” ê²ƒë„ ?¥ë ¥?…ë‹ˆ??", "ë°°í„°ë¦¬ê? ë°©ì „?˜ë©´ ì¶©ì „???„ìš”?˜ë“¯, ?¹ì‹ ?ê²Œ???´ì‹???„ìš”?´ìš”."],
    anxious: ["ê±±ì •???€ë¶€ë¶„ì? ?¤ì œë¡??¼ì–´?˜ì? ?Šì•„?? ì§€ê¸????œê°„??ì§‘ì¤‘?´ë³´?¸ìš”.", "ê¹Šê²Œ ?¨ì„ ?¤ì´ë§ˆì‹œê³??´ë±‰?¼ì„¸?? ?¹ì‹ ?€ ?ê°ë³´ë‹¤ ?¨ì”¬ ê°•í•©?ˆë‹¤."],
    excited: ["ê·??¤ë ˜???ˆë¡œ???œì‘???ë™?¥ì´ ??ê±°ì˜ˆ?? ì§€ê¸?ë°”ë¡œ ?„ì „?´ë³´?¸ìš”!", "?ê·¼ê±°ë¦¼??ì¦ê¸°?¸ìš”! ë©‹ì§„ ?¼ì´ ?¹ì‹ ??ê¸°ë‹¤ë¦¬ê³  ?ˆìŠµ?ˆë‹¤."],
    relationship: ["ê´€ê³„ëŠ” ?œë¡œ?€ ê°™ì•„?? ?ˆë¬´ ê°€ê¹Œìš°ë©??°ì´ê³?ë©€ë©?ì¶”ì›Œ?? ?ë‹¹??ê±°ë¦¬ê°€ ?„ìš”?´ìš”.", "ëª¨ë“  ?¬ëŒ?ê²Œ ?¬ë‘ë°›ì„ ?„ìš”???†ìŠµ?ˆë‹¤. ?˜ë? ?„ê»´ì£¼ëŠ” ?¬ëŒ?¤ì—ê²?ì§‘ì¤‘?˜ì„¸??"],
    career: ["ë°©í–¥??ì¤‘ìš”?˜ë‹¤ë©??ë„??ì¤‘ìš”?˜ì? ?Šì•„?? ?¹ì‹ ë§Œì˜ ?ë„ë¡??˜ì•„ê°€?¸ìš”.", "ì§€ê¸ˆì˜ ê³ ë??€ ?¹ì‹ ???±ì¥?˜ê³  ?ˆë‹¤??ì¦ê±°?…ë‹ˆ??"],
    burnout: ["?„ë¬´ê²ƒë„ ?˜ì? ?ŠëŠ” ?œê°„???¸ìƒ?ëŠ” ê¼??„ìš”?©ë‹ˆ??", "?´ì‹¬???¬ë¦° ?¹ì‹ , ? ì‹œ ?”ì§„???„ê³  ?íˆ???œê°„??ê°€ì§€?¸ìš”."],
    growth: ["?´ì œ???˜ë³´??1%ë§????˜ì•„ì§€ë©??©ë‹ˆ?? ê¾¸ì??¨ì´ ë¹„ê²°?´ì—??", "ë°°ì??ëŠ” ?ì´ ?†ì£ . ?¹ì‹ ???¸ê¸°?¬ì´ ?¹ì‹ ???±ì¥?œí‚¬ ê±°ì˜ˆ??"],
    money: ["?ˆì? ì¢‹ì? ?˜ì¸?´ì?ë§??˜ìœ ì£¼ì¸?…ë‹ˆ?? ?ˆì˜ ì£¼ì¸???˜ì„¸??", "?‘ì? ?µê???ëª¨ì—¬ ??ë¶€ë¥?ë§Œë“­?ˆë‹¤. ?¤ëŠ˜ ì»¤í”¼ ????ê°’ë????„ê»´ë³¼ê¹Œ??"],
    killing_time: ["?¬ì‹¬?¨ì? ì°½ì˜?¥ì˜ ?ì²œ???˜ê¸°???©ë‹ˆ?? ë©??Œë¦¬???œê°„??ì¦ê²¨ë³´ì„¸??", "?‰ì†Œ???½ì? ?Šë˜ ?¥ë¥´??ì±…ì„ ?¼ì³ë³´ëŠ” ê±??´ë–¨ê¹Œìš”?"],
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
                                <Sparkles className="w-4 h-4" /> BookFit ?ˆìœ¼ë¡?
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
                        <p className="text-base font-medium text-muted-foreground">
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
                                    ?¤ëŠ˜ ?˜ë£¨, ê¸°ë¶„???´ë– ? ê???
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
                                    ?”ì¦˜ ê°€????ê³ ë?ê±°ë¦¬??ë¬´ì—‡?¸ê???
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
                                        ?¤ëŠ˜??ì¡°ì–¸
                                    </h2>
                                    <div className="bg-card border border-border/50 p-8 rounded-2xl shadow-sm max-w-lg mx-auto">
                                        <p className="text-lg md:text-xl text-muted-foreground whitespace-pre-line leading-relaxed">
                                            {advice}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 justify-center pt-8">
                                        <Button onClick={reset} variant="outline" className="gap-2">
                                            <RefreshCcw className="w-4 h-4" /> ?¤ì‹œ ?˜ê¸°
                                        </Button>
                                        <Link href="/search">
                                            <Button className="gap-2 bg-primary hover:bg-primary/90">
                                                ??ê¸°ë¶„??ë§ëŠ” ì±?ì°¾ê¸° <ChevronRight className="w-4 h-4" />
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
                            ?´ì „
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={(step === 1 && !emotion) || (step === 2 && !situation)}
                            className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full shadow-lg transition-all"
                        >
                            {step === TOTAL_STEPS ? "ì¡°ì–¸ ë³´ê¸°" : "?¤ìŒ"}
                            {step !== TOTAL_STEPS && <ChevronRight className="w-4 h-4 ml-2" />}
                            {step === TOTAL_STEPS && <Sparkles className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
