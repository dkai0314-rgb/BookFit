import React from 'react';
import Link from 'next/link';
import BookfitLetterForm from '@/components/BookfitLetterForm';

export default function Footer() {
    return (
        <footer className="bg-black text-gray-400 py-10 border-t border-gray-800 mt-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* 북핏레터 신청 폼 */}
                <div className="mb-12 border-b border-gray-800 pb-12">
                    <BookfitLetterForm />
                </div>

                <div className="flex flex-col md:flex-row justify-between mb-8">
                    <div className="mb-6 md:mb-0 max-w-md">
                        <h3 className="text-white text-lg font-bold mb-4">BookFit</h3>
                        <div className="space-y-1 text-sm">
                            <p><strong>상호</strong>: 욜드몰(YOLDMORE)</p>
                            <p><strong>대표자명</strong>: 김동권</p>
                            <p><strong>사업자등록번호</strong>: 561-52-00765</p>
                            <p><strong>통신판매업신고번호</strong>: 2023-서울영등포-1733</p>
                            <p><strong>주소</strong>: 서울특별시 영등포구 국회대로36길 6-1, 2층 N259호</p>
                            <p><strong>이메일</strong>: <a href="mailto:yoldmore@gmail.com" className="hover:text-white transition-colors">yoldmore@gmail.com</a></p>
                            <p>
                                <strong>고객문의채널</strong>: <a href="http://pf.kakao.com/_huuqX" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">카카오톡 채널</a>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms" className="hover:text-white transition-colors">
                                    이용약관
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-white transition-colors">
                                    개인정보처리방침
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund" className="hover:text-white transition-colors">
                                    환불 규정
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} BookFit. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
