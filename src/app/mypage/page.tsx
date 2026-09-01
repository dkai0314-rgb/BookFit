"use client";

import { onAuthStateChanged, User, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import PersonalRecommendWidget from '@/components/PersonalRecommendWidget';
import { PenLine, Trophy, BarChart3 } from 'lucide-react';

function hasFirebaseErrorCode(error: unknown): error is { code: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export default function MyPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Password Change State
    const [newPassword, setNewPassword] = useState("");
    const [passwordUpdating, setPasswordUpdating] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/login');
                return;
            }
            setUser(currentUser);
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
                    {/* 독서기록장 바로가기 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">내 독서기록장</h2>
                        <Link
                            href="/mypage/library"
                            className="block bg-secondary/40 border border-border rounded-xl p-6 hover:border-accent transition-colors"
                        >
                            <div className="flex items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="text-xs font-bold uppercase tracking-widest text-accent">
                                        Free
                                    </div>
                                    <h3 className="text-lg font-bold">서재 · 하이라이트 · 챌린지 · 통계</h3>
                                    <p className="text-sm text-muted-foreground">
                                        읽은 책을 정리하고, 인상 깊은 문장을 기록하고, 독서 목표를 세우고 습관을 통계로 확인해보세요.
                                    </p>
                                    <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground flex-wrap">
                                        <span className="inline-flex items-center gap-1">서재</span>
                                        <span className="inline-flex items-center gap-1"><PenLine className="w-3.5 h-3.5" /> 하이라이트</span>
                                        <span className="inline-flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> 챌린지</span>
                                        <span className="inline-flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> 통계</span>
                                    </div>
                                </div>
                                <span className="text-accent font-bold shrink-0">→</span>
                            </div>
                        </Link>
                    </section>

                    {/* W4: 개인화 AI 추천 */}
                    <section>
                        <PersonalRecommendWidget />
                    </section>

                    {/* 회원 정보 관리 (비밀번호 변경) 영역 */}
                    <section className="pt-6 border-t border-border">
                        <h2 className="text-2xl font-semibold mb-6">회원 정보 관리</h2>

                        <div className="bg-secondary border border-border rounded-xl p-6 md:p-8 max-w-xl">
                            <h3 className="text-lg font-medium text-foreground mb-4">비밀번호 변경</h3>

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
                                    } catch (error: unknown) {
                                        console.error("Error updating password:", error);
                                        if (hasFirebaseErrorCode(error) && error.code === 'auth/requires-recent-login') {
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
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>
                                {passwordMessage.text && (
                                    <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-destructive' : 'text-primary'}`}>
                                        {passwordMessage.text}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={passwordUpdating || !newPassword}
                                    className="bg-secondary/50 border border-border hover:bg-secondary text-foreground font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {passwordUpdating ? "변경 중..." : "변경하기"}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
