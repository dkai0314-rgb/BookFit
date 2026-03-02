"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigValid } from "@/lib/firebase";
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

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    setIsLoading(true);
                    const user = result.user;
                    if (isFirebaseConfigValid) {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (!userDoc.exists()) {
                            await setDoc(doc(db, "users", user.uid), {
                                uid: user.uid,
                                email: user.email,
                                name: user.displayName || "",
                                provider: "google",
                                newsletterConsent: false,
                                createdAt: new Date().toISOString(),
                            });
                        }
                    }
                    router.push(getRedirectPath());
                }
            } catch (err: unknown) {
                console.error("Redirect login error:", err);
                const error = err as { code?: string; message?: string };
                setError(`Google 로그인 오류: ${error.message || "알 수 없는 오류"}`);
                setIsLoading(false);
            }
        };
        handleRedirectResult();
    }, [router]);

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

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);

        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipad|ipod|android/i.test(userAgent);

        // 인앱 브라우저 및 모바일 환경 처리
        if (userAgent.match(/kakaotalk/i) || userAgent.match(/naver/i) || userAgent.match(/instagram/i)) {
            if (userAgent.match(/iphone|ipad|ipod/i)) {
                // iOS 인앱 브라우저 (리다이렉트 시도)
                try {
                    await signInWithRedirect(auth, googleProvider);
                    return;
                } catch (e) {
                    setIsLoading(false);
                    alert("보안 정책상 인앱 브라우저에서는 구글 로그인이 불가능할 수 있습니다. 우측 하단 🧭 아이콘이나 우측 상단 ⋯ 버튼을 눌러 'Safari로 열기'를 선택해주세요.");
                    return;
                }
            } else {
                // 안드로이드는 크롬 외부 브라우저로 인텐트 실행 시도
                setIsLoading(false);
                location.href = `intent://${location.href.replace(/https?:\/\//i, "")}#Intent;scheme=https;package=com.android.chrome;end`;
                return;
            }
        }

        try {
            if (isMobile) {
                await signInWithRedirect(auth, googleProvider);
            } else {
                const result = await signInWithPopup(auth, googleProvider);
                if (result?.user) {
                    const user = result.user;
                    if (isFirebaseConfigValid) {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (!userDoc.exists()) {
                            await setDoc(doc(db, "users", user.uid), {
                                uid: user.uid,
                                email: user.email,
                                name: user.displayName || "",
                                provider: "google",
                                newsletterConsent: false,
                                createdAt: new Date().toISOString(),
                            });
                        }
                    }
                    router.push(getRedirectPath());
                }
            }
        } catch (err: unknown) {
            console.error("Google login error:", err);
            const error = err as { code?: string; message?: string };
            setError(`Google 로그인 오류: ${error.message || "알 수 없는 오류"}`);
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

            {/* 구분선 */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-gray-500">또는</span>
                </div>
            </div>

            {/* Google 로그인 버튼 */}
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
                onClick={handleGoogleLogin}
                disabled={isLoading}
            >
                <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google로 로그인
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
