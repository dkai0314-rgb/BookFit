"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await sendPasswordResetEmail(auth, email);
            setIsSent(true);
        } catch (err: unknown) {
            console.error(err);
            const error = err as { code?: string; message?: string };
            if (error.code === "auth/user-not-found") {
                setError("가입되지 않은 이메일입니다.");
            } else {
                setError(`오류 발생: ${error.code || error.message || "알 수 없는 오류"}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">비밀번호 재설정 메일 발송</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {email} 로 재설정 링크가 포함된 메일을 보냈어용!<br />
                        메일함(스팸함 포함)을 확인해주세용~ ✨
                    </p>
                </div>
                <Link href="/login" className="w-full">
                    <Button className="w-full h-12 text-lg">
                        다시 로그인하러 가기
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900 font-semibold">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="가입 시 사용한 이메일 주소"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "재설정 메일 보내기"}
            </Button>

            <div className="text-center">
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 로그인 페이지로 돌아가기
                </Link>
            </div>
        </form>
    );
}
