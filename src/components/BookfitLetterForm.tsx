"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function BookfitLetterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return;

        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setStatus("success");
                setEmail("");
            } else {
                let errorMsg = "구독 신청 중 오류가 발생했습니다.";
                try {
                    const data = await response.json();
                    if (data.error) errorMsg = data.error;
                } catch (e) {
                    console.error("Failed to parse server error response", e);
                }
                setStatus("error");
                setErrorMessage(errorMsg);
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    if (status === "success") {
        return (
            <div className="w-full max-w-md p-6 bg-[#0B2A1F] border border-accent/20 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-lg font-bold text-white">구독 신청 완료!</h3>
                <p className="text-sm text-gray-300">
                    북핏레터 구독해주셔서 감사합니다.<br />
                    매주 유익한 책 추천으로 찾아뵙겠습니다.
                </p>
                <Button
                    variant="outline"
                    className="mt-4 border-white/20 text-white hover:bg-white/10"
                    onClick={() => setStatus("idle")}
                >
                    다른 이메일로 추가 구독하기
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="space-y-2">
                <label htmlFor="newsletter-email" className="text-sm font-semibold text-gray-300">
                    이메일 주소
                </label>
                <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-accent h-12"
                    required
                    disabled={status === "loading"}
                />
            </div>

            {status === "error" && (
                <p className="text-sm text-red-400 font-medium">{errorMessage}</p>
            )}

            <Button
                type="submit"
                className="w-full h-12 bg-accent text-[#061A14] hover:bg-white hover:text-accent font-bold text-base transition-all"
                disabled={status === "loading"}
            >
                {status === "loading" ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 처리 중...</>
                ) : (
                    "북핏레터 무료 구독하기"
                )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
                구독 시 개인정보 수집 및 이용에 동의하는 것으로 간주됩니다.
            </p>
        </form>
    );
}
