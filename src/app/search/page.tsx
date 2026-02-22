"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { useSurveyStore } from "@/lib/store";

const GUIDE_CHIPS = [
    "쉽고 잘 읽히는 뇌과학 입문서",
    "지친 마음을 달래줄 힐링 에세이",
    "주식 투자 초보를 위한 필독서",
    "몰입감 넘치는 추리 소설",
    "마케팅 초보를 위한 필독서",
];

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Store access to save query for result page
    const setAnswer = useSurveyStore((state) => state.setAnswer);
    const setRecommendations = useSurveyStore((state) => state.setRecommendations);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSearch = async () => {
        if (!query.trim() || query.length < 2) return;

        setIsLoading(true);
        setAnswer("userRequest", query); // Save query to store for result page context

        try {
            const response = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userRequest: query,
                    userEmotion: [] // No emotion context for global search
                })
            });

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                setRecommendations(data.items);
                router.push("/result");
            } else {
                alert("추천 결과를 찾지 못했습니다. 다른 키워드로 검색해보세요.");
            }
        } catch (error) {
            console.error("Search failed:", error);
            alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };

    if (!isClient) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-2xl space-y-12 z-10">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 animate-pulse">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground break-keep leading-tight">
                        어떤 책을 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">찾고 계신가요?</span>
                    </h1>
                    <p className="text-muted-foreground md:text-lg">
                        AI가 당신의 질문을 분석해 딱 맞는 책을 찾아드립니다.
                    </p>
                </div>

                {/* Search Input */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-card border border-border rounded-2xl shadow-lg flex items-center p-4 gap-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                        <Search className="w-6 h-6 text-muted-foreground" />
                        <input
                            type="text"
                            className="flex-1 bg-transparent text-lg placeholder:text-muted-foreground/50 focus:outline-none"
                            placeholder="예) 요즘 마음이 답답한데 위로가 되는 에세이 추천해줘"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            autoFocus
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={isLoading || query.length < 2}
                            size="lg"
                            className="rounded-xl px-6"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "검색"}
                        </Button>
                    </div>
                </div>

                {/* Guide Chips */}
                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        이런 질문은 어때요? 👇
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {GUIDE_CHIPS.map((chip) => (
                            <button
                                key={chip}
                                onClick={() => {
                                    setQuery(chip);
                                    // Optional: Auto-search on click? or just fill? Let's just fill for now.
                                }}
                                className="px-4 py-2 text-sm rounded-full bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 transition-all hover:scale-105 active:scale-95"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-xs text-muted-foreground">
                Powered by Google Gemini & Google Books
            </div>
        </div>
    );
}
