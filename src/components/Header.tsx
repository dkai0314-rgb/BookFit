"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            // 로그아웃 전 현재 사용자의 캐시 정리
            const currentUser = auth.currentUser;
            if (currentUser) {
                localStorage.removeItem(`bookfit_template_${currentUser.uid}`);
            }
            await signOut(auth);
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-2 bg-background/95 backdrop-blur-md border-b border-border shadow-sm" role="banner">
            <div className="max-w-6xl mx-auto w-full flex justify-between items-center relative">
                <Link href="/" className="flex items-center gap-2 cursor-pointer" aria-label="BookFit 홈">
                    <Image src="/bookfit_logo2.png" alt="BookFit Logo" width={400} height={120} className="h-8 w-auto dark:brightness-0 dark:invert" priority />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 text-base font-medium text-muted-foreground" aria-label="메인 네비게이션">
                    <Link href="/curation" className="hover:text-accent transition-colors">이달의북핏</Link>
                    <Link href="/bestsellers" className="hover:text-accent transition-colors">베스트셀러</Link>
                    <Link href="/template" className="hover:text-accent transition-colors">독서관 템플릿</Link>
                    <Link href="/bookfit-letter" className="hover:text-accent transition-colors">북핏레터</Link>

                    {/* Auth Nav */}
                    <div className="flex items-center gap-4 ml-4 border-l border-border pl-4">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-accent transition-colors capitalize outline-none">
                                    {user.displayName || user.email?.split('@')[0]}님 <ChevronDown className="w-4 h-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-background border border-border text-foreground shadow-lg">
                                    <DropdownMenuItem asChild className="hover:bg-secondary cursor-pointer focus:text-accent focus:bg-secondary">
                                        <Link href="/mypage" className="w-full">마이페이지</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:bg-red-50 cursor-pointer focus:text-red-600 focus:bg-red-50">
                                        로그아웃
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
                                <Link href="/signup" className="px-4 py-2 bg-accent text-primary-foreground rounded-full hover:bg-accent/90 transition-colors font-semibold">Sign up</Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors outline-none"
                    aria-label="메뉴 열기/닫기"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-4 p-4 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col gap-4 text-center md:hidden animate-in slide-in-from-top-4 fade-in">
                        <Link href="/curation" onClick={toggleMenu} className="block w-full py-3 text-foreground hover:text-accent hover:bg-secondary rounded-xl transition-all font-medium">이달의북핏</Link>
                        <Link href="/bestsellers" onClick={toggleMenu} className="block w-full py-3 text-foreground hover:text-accent hover:bg-secondary rounded-xl transition-all font-medium">베스트셀러</Link>
                        <Link href="/template" onClick={toggleMenu} className="block w-full py-3 text-foreground hover:text-accent hover:bg-secondary rounded-xl transition-all font-medium">독서관 템플릿</Link>
                        <Link href="/bookfit-letter" onClick={toggleMenu} className="block w-full py-3 text-foreground hover:text-accent hover:bg-secondary rounded-xl transition-all font-medium">북핏레터</Link>

                        <div className="h-px bg-border w-full my-1"></div>

                        {user ? (
                            <>
                                <div className="block w-full py-2 text-accent font-semibold text-base border-b border-border mb-2">{user.displayName || user.email?.split('@')[0]}님</div>
                                <Link href="/mypage" onClick={toggleMenu} className="block w-full py-3 text-foreground hover:text-accent hover:bg-secondary rounded-xl transition-all font-medium">마이페이지</Link>
                                <button onClick={handleLogout} className="block w-full py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">로그아웃</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={toggleMenu} className="block w-full py-3 text-foreground hover:text-accent hover:bg-secondary rounded-xl transition-all font-medium">Login</Link>
                                <Link href="/signup" onClick={toggleMenu} className="block w-full py-3 bg-accent text-primary-foreground hover:bg-accent/90 rounded-xl transition-all font-semibold">Sign up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
