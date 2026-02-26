"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookCheck, Mail, User } from "lucide-react";

export default function TemplateForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        setLoading(true);
        try {
            const res = await fetch("/api/template-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                alert("신청 중 오류가 발생했습니다. 다시 시도해 주세요.");
            }
        } catch {
            alert("네트워크 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-[#0B2A1F] border border-accent/20 rounded-xl p-8 text-center shadow-lg space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent mb-2">
                    <BookCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">신청 완료!</h3>
                <p className="text-gray-300">
                    입력하신 메일 <span className="text-accent font-semibold">{email}</span> 로<br />
                    템플릿 주소를 곧 발송해 드릴게요.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#04120e] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent/5 blur-3xl pointer-events-none" aria-hidden="true"></div>

            <div className="relative z-10 space-y-8">
                <div className="space-y-2 text-center">
                    <h3 className="text-2xl font-bold text-white">템플릿 신청하기</h3>
                    <p className="text-gray-400 text-sm">이메일로 노션 템플릿 링크를 보내드려요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-3">
                        <Label htmlFor="name" className="text-gray-300">이름 (닉네임)</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="name"
                                placeholder="홍길동"
                                value={name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                className="pl-10 h-12 bg-white/5 border-white/10 text-white focus:border-accent/50 text-base"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="email" className="text-gray-300">이메일</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                className="pl-10 h-12 bg-white/5 border-white/10 text-white focus:border-accent/50 text-base"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-accent text-[#061A14] hover:bg-white hover:text-accent font-bold py-6 text-lg transition-all"
                        disabled={loading}
                    >
                        {loading ? "신청 처리 중..." : "무료로 템플릿 받기"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
