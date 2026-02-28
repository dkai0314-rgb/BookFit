"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigValid } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [newsletter, setNewsletter] = useState(true); // 기본 선택
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false); // 가입 완료 모달 상태
    const router = useRouter();

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
                try {
                    // Set a timeout for the Firestore write so it doesn't hang forever
                    const savePromise = setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        email: user.email,
                        name: name,
                        newsletterConsent: newsletter,
                        createdAt: new Date().toISOString(),
                    });

                    // Wait at most 8 seconds for Firestore
                    await Promise.race([
                        savePromise,
                        new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 8000))
                    ]);
                    console.log("Signup Step 2 Success: User saved to Firestore");
                } catch (firestoreErr) {
                    console.error("Firestore Save Error/Timeout:", firestoreErr);
                    // We proceed anyway because the Auth user was created successfully.
                }
            } else {
                console.warn("Firestore config not valid, skipping user data save.");
            }

            // 가입 성공 모달 띄우기 삭제
            setIsLoading(false);

            // 로그인 페이지(또는 메인)로 바로 이동
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
            </form>
        </div>
    );
}
