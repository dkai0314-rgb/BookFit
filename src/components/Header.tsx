"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 bg-[#061A14]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] shadow-sm" role="banner">
            <div className="max-w-6xl mx-auto w-full flex justify-between items-center relative">
                <Link href="/" className="text-2xl font-bold flex items-center gap-2 font-serif tracking-tight cursor-pointer" aria-label="BookFit 홈">
                    <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm">BookFit</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400" aria-label="메인 네비게이션">
                    <Link href="/curation" className="hover:text-accent transition-colors">이달의북핏</Link>
                    <Link href="/bestsellers" className="hover:text-accent transition-colors">베스트셀러</Link>
                    <Link href="/bookfit-letter" className="hover:text-accent transition-colors">북핏레터</Link>
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
                    </div>
                )}
            </div>
        </header>
    );
}
