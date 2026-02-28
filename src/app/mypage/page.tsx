"use client";

import { onAuthStateChanged, User, updatePassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigValid } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MyPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasTemplate, setHasTemplate] = useState(false);

    // Password Change State
    const [newPassword, setNewPassword] = useState("");
    const [passwordUpdating, setPasswordUpdating] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push('/login');
            } else {
                setUser(currentUser);
                if (isFirebaseConfigValid) {
                    try {
                        // Fetch Template
                        const docRef = doc(db, "users", currentUser.uid, "templates", "bookfit");
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            setHasTemplate(true);
                        }
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                    }
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full mt-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
                    <p className="text-muted-foreground">{user.displayName || user.email}님, 환영합니다.</p>
                </div>

                <div className="space-y-12">
                    {/* 내 템플릿 영역 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            내 템플릿 보관함
                            <span className="bg-primary/20 text-primary text-sm px-3 py-1 rounded-full">{hasTemplate ? "1" : "0"}</span>
                        </h2>

                        {hasTemplate ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Template Card */}
                                <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                                    <div className="relative aspect-square w-full">
                                        <Image
                                            src="/template-hero.png"
                                            alt="독서관 노션 템플릿"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold leading-tight">독서관 노션 템플릿</h3>
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-6 flex-grow">
                                            책 추가, 하이라이트 기록, 챌린지 관리까지 한 곳에서 가능한 노션 독서 템플릿입니다.
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-border">
                                            <a
                                                href="/독서관 가이드.pdf"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex justify-center items-center w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                                            >
                                                PDF 가이드 열기
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">보유 중인 템플릿이 없습니다</h3>
                                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                    독서 관리를 위한 완벽한 노션 템플릿을 무료로 제공하고 있습니다. 지금 바로 신청하고 평생 소장하세요!
                                </p>
                                <a
                                    href="/template"
                                    className="inline-flex justify-center items-center bg-accent hover:bg-white text-[#061A14] hover:text-accent font-bold py-3 px-8 rounded-lg transition-colors"
                                >
                                    무료 템플릿 신청하러 가기
                                </a>
                            </div>
                        )}
                    </section>

                    {/* 회원 정보 관리 (비밀번호 변경) 영역 */}
                    <section className="pt-6 border-t border-border">
                        <h2 className="text-2xl font-semibold mb-6">회원 정보 관리</h2>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 max-w-xl">
                            <h3 className="text-lg font-medium text-white mb-4">비밀번호 변경</h3>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (newPassword.length < 6) {
                                        setPasswordMessage({ type: "error", text: "비밀번호는 6자리 이상이어야 합니다." });
                                        return;
                                    }

                                    setPasswordUpdating(true);
                                    setPasswordMessage({ type: "", text: "" });

                                    try {
                                        await updatePassword(user, newPassword);
                                        setPasswordMessage({ type: "success", text: "비밀번호가 성공적으로 변경되었습니다." });
                                        setNewPassword("");
                                    } catch (error: any) {
                                        console.error("Error updating password:", error);
                                        if (error.code === 'auth/requires-recent-login') {
                                            setPasswordMessage({ type: "error", text: "보안을 위해 다시 로그인한 후 변경 가능합니다. 다시 로그인해주세요." });
                                        } else {
                                            setPasswordMessage({ type: "error", text: "비밀번호 변경에 실패했습니다." });
                                        }
                                    } finally {
                                        setPasswordUpdating(false);
                                    }
                                }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <input
                                        type="password"
                                        placeholder="새로운 비밀번호 (6자리 이상)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>
                                {passwordMessage.text && (
                                    <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                        {passwordMessage.text}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={passwordUpdating || !newPassword}
                                    className="bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {passwordUpdating ? "변경 중..." : "변경하기"}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
