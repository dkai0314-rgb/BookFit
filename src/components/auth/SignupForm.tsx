"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                name: name,
                newsletterConsent: newsletter,
                createdAt: new Date().toISOString(),
            });

            // 가입 성공 모달 띄우기
            setShowSuccess(true);

            // 2초 뒤에 메인 페이지로 이동
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err: unknown) {
            console.error(err);
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
            {/* Success Modal Overlay */}
            {showSuccess && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl animate-in fade-in duration-300">
                    <div className="text-center space-y-4 p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <span className="text-2xl">🎉</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">가입을 축하합니다!</h3>
                        <p className="text-gray-600">잠시 후 메인 화면으로 이동합니다...</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-900 font-semibold">이름</Label>
                        <Input
                            id="name"
                            placeholder="홍길동"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                            placeholder="비밀번호(6자리 이상)를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            className="w-4 h-4 text-[#061A14] bg-gray-100 border-gray-300 rounded focus:ring-[#061A14] focus:ring-2 cursor-pointer"
                        />
                        <Label htmlFor="newsletter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-700">
                            (선택) 신간 및 추천 도서 뉴스레터 수신 동의
                        </Label>
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || showSuccess}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "회원가입 완료"}
                </Button>
            </form>
        </div>
    );
}
