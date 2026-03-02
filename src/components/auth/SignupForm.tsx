"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigValid } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [newsletter, setNewsletter] = useState(true); // 기본 선택
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess] = useState(false); // 가입 완료 모달 상태
    const router = useRouter();

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
                                newsletterConsent: newsletter,
                                createdAt: new Date().toISOString(),
                            });
                        }
                    }
                    router.push("/");
                }
            } catch (err: unknown) {
                console.error("Redirect signup error:", err);
                const error = err as { code?: string; message?: string };
                setError(`Google 회원가입 오류: ${error.message || "알 수 없는 오류"}`);
                setIsLoading(false);
            }
        };
        handleRedirectResult();
    }, [router, newsletter]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            console.log("Signup Step 1: Creating user...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Signup Step 1 Success:", user.uid);

            console.log("Signup Step 2: Saving user to Firestore...");
            if (isFirebaseConfigValid) {
                // Fire-and-forget: Firestore 저장을 기다리지 않고 즉시 홈으로 이동
                setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    name: name,
                    provider: "email",
                    newsletterConsent: newsletter,
                    createdAt: new Date().toISOString(),
                }).then(() => {
                    console.log("Signup Step 2 Success: User saved to Firestore");
                }).catch((err) => {
                    console.error("Firestore Save Error:", err);
                });
            }

            setIsLoading(false);
            router.push("/");
        } catch (err: unknown) {
            console.error("Auth Error:", err);
            const error = err as { code?: string; message?: string };
            if (error.code === "auth/email-already-in-use") {
                setError("이미 사용 중인 이메일입니다.");
            } else if (error.code === "auth/weak-password") {
                setError("비밀번호는 6자리 이상이어야 합니다.");
            } else {
                setError(`회원가입 오류: ${error.code || error.message || "알 수 없는 오류"}`);
            }
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        setError(null);

        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipad|ipod|android/i.test(userAgent);

        // 인앱 브라우저 감지 및 처리
        if (userAgent.match(/kakaotalk/i) || userAgent.match(/naver/i) || userAgent.match(/instagram/i)) {
            if (userAgent.match(/iphone|ipad|ipod/i)) {
                try {
                    await signInWithRedirect(auth, googleProvider);
                    return;
                } catch (e) {
                    setIsLoading(false);
                    alert("보안 정책상 인앱 브라우저에서는 구글 연결이 작동하지 않을 수 있습니다. 🧭 아이콘이나 ⋯ 버튼을 눌러 'Safari로 열기'를 선택해주세요.");
                    return;
                }
            } else {
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
                                newsletterConsent: newsletter,
                                createdAt: new Date().toISOString(),
                            });
                        }
                    }
                    router.push("/");
                }
            }
        } catch (err: unknown) {
            console.error("Google signup error:", err);
            const error = err as { code?: string; message?: string };
            setError(`Google 회원가입 오류: ${error.message || "알 수 없는 오류"}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-900 dark:text-gray-100 font-bold">이름</Label>
                        <Input
                            id="name"
                            placeholder="홍길동"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white dark:bg-[#061A14] text-gray-900 dark:text-white border-gray-300 dark:border-white/30 focus:border-accent"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-900 dark:text-gray-100 font-bold">이메일</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white dark:bg-[#061A14] text-gray-900 dark:text-white border-gray-300 dark:border-white/30 focus:border-accent"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-900 dark:text-gray-100 font-bold">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호(6자리 이상)를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white dark:bg-[#061A14] text-gray-900 dark:text-white border-gray-300 dark:border-white/30 focus:border-accent"
                            required
                        />
                    </div>

                    {/* Newsletter Checkbox */}
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="newsletter"
                            checked={newsletter}
                            onChange={(e) => setNewsletter(e.target.checked)}
                            className="w-4 h-4 text-primary bg-white dark:bg-[#061A14] border-gray-300 dark:border-white/30 rounded focus:ring-accent focus:ring-2 cursor-pointer"
                        />
                        <Label htmlFor="newsletter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-800 dark:text-gray-200">
                            (선택) 신간 및 추천 도서 뉴스레터 수신 동의
                        </Label>
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading || showSuccess}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "회원가입 완료"}
                </Button>

                {/* 구분선 */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white dark:bg-[#0A251C] px-3 text-gray-500 dark:text-gray-400">또는</span>
                    </div>
                </div>

                {/* Google 회원가입 버튼 */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#123A2C] flex items-center justify-center gap-3 bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google로 시작하기
                </Button>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    이미 계정이 있으신가요?{" "}
                    <Link href="/login" className="text-primary hover:underline font-bold">
                        로그인하기
                    </Link>
                </div>
            </form>
        </div>
    );
}
