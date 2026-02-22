"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSurveyStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/survey/progress-bar";
import { ChoiceCard } from "@/components/survey/choice-card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";

const TOTAL_STEPS = 4;

const EMOTIONS = [
    { label: "?âÎ≥µ??, value: "happy", icon: "?òä" },
    { label: "Ï∞®Î∂Ñ??, value: "calm", icon: "?åø" },
    { label: "?∞Ïö∏??, value: "depressed", icon: "?ÅÔ∏è" },
    { label: "ÏßÄÏπ?, value: "tired", icon: "?îã" },
    { label: "Î∂àÏïà??, value: "anxious", icon: "?å™Ô∏? },
    { label: "?§Î†ò", value: "excited", icon: "?? },
];

const SITUATIONS = [
    { label: "?∏Í∞ÑÍ¥ÄÍ≥?Í≥†Î?", value: "relationship" },
    { label: "ÏßÑÎ°ú/Ï∑®ÏóÖ", value: "career" },
    { label: "Î≤àÏïÑ???¥Ïãù", value: "burnout" },
    { label: "?êÍ∏∞Í≥ÑÎ∞ú/?±Ïû•", value: "growth" },
    { label: "Í≤ΩÏ†ú/?¨ÌÖå??, value: "money" },
    { label: "?®Ïàú ?¨Ïã¨?Ä??, value: "killing_time" },
];

const STYLES = [
    { label: "?∞Îúª???ÑÎ°ú", value: "warm" },
    { label: "?âÏ≤†??ÏßÅÏñ∏", value: "cold" },
    { label: "?ºÎ¶¨??Î∂ÑÏÑù", value: "logic" },
    { label: "Í∞ÄÎ≤ºÏö¥ ?ÑÎ£®Î£?, value: "light" },
];

// Guide Chips for Step 4
const GUIDE_CHIPS = [
    "?ΩÍ≥† ???ΩÌûà???åÍ≥º???ÖÎ¨∏??,
    "ÏßÄÏπ?ÎßàÏùå???¨ÎûòÏ§??êÎßÅ ?êÏÑ∏??,
    "Ï£ºÏãù ?¨Ïûê Ï¥àÎ≥¥Î•??ÑÌïú ?ÑÎèÖ??,
    "Î™∞ÏûÖÍ∞??òÏπò??Ï∂îÎ¶¨ ?åÏÑ§",
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
                {/* Header */}
                <div className="space-y-4 text-center">
                    <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
                    <p className="text-base font-medium text-muted-foreground">
                        {step} / {TOTAL_STEPS}
                    </p>
                </div>

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
                        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary break-keep">
                            {step === 1 && "?§Îäò ?òÎ£®, Í∏∞Î∂Ñ???¥Îñ†?®ÎÇò??"}
                            {step === 2 && "?îÏ¶ò Í∞Ä????Í≥†Î?Í±∞Î¶¨??Î¨¥Ïóá?∏Í???"}
                            {step === 3 && "?¥Îñ§ ?§Ì??ºÏùò Ï°∞Ïñ∏???êÌïò?úÎÇò??"}
                            {step === 4 && "?¥Îñ§ Ï±ÖÏùÑ Ï∞æÍ≥† Í≥ÑÏã†Í∞Ä??"}
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
                                        placeholder="?? ?åÍ≥º?ôÏóê ?Ä???åÍ≥† ?∂Ïñ¥?? ?ΩÍ≥† ???ΩÌûà???ÖÎ¨∏?©ÏúºÎ°?Ï∂îÏ≤ú?¥Ï£º?∏Ïöî."
                                        value={answers.userRequest}
                                        onChange={(e) => setAnswer("userRequest", e.target.value)}
                                    />
                                    <div className="absolute bottom-4 right-4 text-base text-muted-foreground">
                                        {answers.userRequest.length} / 200
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-base text-muted-foreground text-center">
                                        ?¥ÎñªÍ≤??®Ïïº ?†Ï? Î™®Î•¥Í≤†Îã§Î©? ?ëá
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {GUIDE_CHIPS.map((chip) => (
                                            <button
                                                key={chip}
                                                onClick={() => setAnswer("userRequest", chip)}
                                                className="px-3 py-1.5 text-base rounded-full bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 transition-colors"
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
                        className="text-muted-foreground hover:text-primary"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        ?¥Ï†Ñ
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!isStepValid() || isSubmitting}
                        className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <span>Î∂ÑÏÑù Ï§?.. ?ß†</span>
                        ) : (
                            <>
                                {step === TOTAL_STEPS ? "AI Ï∂îÏ≤ú Î∞õÍ∏∞" : "?§Ïùå"}
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
