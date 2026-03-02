"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const getRedirectPath = () => {
        if (typeof window === "undefined") return "/";
        const params = new URLSearchParams(window.location.search);
        return params.get("redirect") || "/";
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push(getRedirectPath());
        } catch (err: unknown) {
            console.error(err);
            const error = err as { code?: string; message?: string };
            if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                setError("이메일이나 비밀번호가 올바르지 않습니다.");
            } else {
                setError(`로그인 오류: ${error.code || error.message || "알 수 없는 오류"}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900 font-semibold">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-900 font-semibold">비밀번호</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "로그인"}
            </Button>

            <div className="text-center text-sm text-gray-500">
                계정이 없으신가요?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                    회원가입하기
                </Link>
            </div>
        </form>
    );
}
