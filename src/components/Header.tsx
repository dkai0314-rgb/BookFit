"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
            await signOut(auth);
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 bg-[#061A14]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] shadow-sm" role="banner">
            <div className="max-w-6xl mx-auto w-full flex justify-between items-center relative">
                <Link href="/" className="text-2xl font-bold flex items-center gap-2 font-serif tracking-tight cursor-pointer" aria-label="BookFit 홈">
                    <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm">BookFit</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400" aria-label="메인 네비게이션">
                    <Link href="/curation" className="hover:text-accent transition-colors">이달의북핏</Link>
                    <Link href="/bestsellers" className="hover:text-accent transition-colors">베스트셀러</Link>
                    <Link href="/bookfit-letter" className="hover:text-accent transition-colors">북핏레터</Link>

                    {/* Auth Nav */}
                    {user ? (
                        <div className="flex items-center gap-4 ml-4 border-l border-white/10 pl-4">
                            <span className="text-gray-300">{user.displayName || user.email?.split('@')[0]}님</span>
                            <button onClick={handleLogout} className="hover:text-white transition-colors">Logout</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 ml-4 border-l border-white/10 pl-4">
                            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                            <Link href="/signup" className="px-4 py-2 bg-accent text-[#061A14] rounded-full hover:bg-accent/90 transition-colors font-semibold">Sign up</Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="메뉴 열기/닫기"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-4 p-4 bg-[#061A14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-4 text-center md:hidden animate-in slide-in-from-top-4 fade-in">
                        <Link href="/curation" onClick={toggleMenu} className="block w-full py-3 text-gray-300 hover:text-accent hover:bg-white/5 rounded-xl transition-all font-medium">이달의북핏</Link>
                        <Link href="/bestsellers" onClick={toggleMenu} className="block w-full py-3 text-gray-300 hover:text-accent hover:bg-white/5 rounded-xl transition-all font-medium">베스트셀러</Link>
                        <Link href="/bookfit-letter" onClick={toggleMenu} className="block w-full py-3 text-gray-300 hover:text-accent hover:bg-white/5 rounded-xl transition-all font-medium">북핏레터</Link>

                        <div className="h-px bg-white/10 w-full my-1"></div>

                        {user ? (
                            <>
                                <div className="block w-full py-2 text-gray-400 text-sm">{user.displayName || user.email?.split('@')[0]}님 환영합니다</div>
                                <button onClick={handleLogout} className="block w-full py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={toggleMenu} className="block w-full py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium">Login</Link>
                                <Link href="/signup" onClick={toggleMenu} className="block w-full py-3 bg-accent text-[#061A14] hover:bg-accent/90 rounded-xl transition-all font-semibold">Sign up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
