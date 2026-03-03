"use client";

import { Button } from "@/components/ui/button";

const PreviewVideo = ({ src }: { src: string }) => {
    return (
        <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            ref={(el) => {
                if (el) el.playbackRate = 1.5;
            }}
        />
    );
};

export default function TemplateDetail() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className="flex flex-col w-full max-w-screen-sm mx-auto overflow-x-hidden font-sans space-y-12 pb-16">
            {/* Hero Section */}
            <section className="flex flex-col gap-8 text-white">
                <div
                    className="w-full bg-transparent aspect-square rounded-xl overflow-hidden relative border border-accent/20"
                    aria-label="Minimalist desk with books and a laptop showing Notion template"
                    style={{ backgroundImage: "url('/template-hero.png')", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
                >
                </div>

                <div className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold w-fit shadow-sm">
                        <span className="text-base drop-shadow-md">💎</span>
                        v3.0 Major Update
                    </div>
                    <h1 className="text-white text-4xl font-black leading-[1.15] tracking-tight">
                        독서관
                    </h1>
                    <p className="text-gray-200 text-xl font-medium leading-snug">
                        문장과 생각을 쌓는 독서관
                    </p>
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">
                        책 추가, 하이라이트 기록, 챌린지 관리까지 한 곳에서 가능한 노션 독서 템플릿
                    </p>
                    <div className="flex flex-col gap-3 mt-4 md:hidden">
                        <Button className="w-full bg-accent text-[#061A14] hover:bg-white hover:text-accent font-bold py-6 text-lg transition-all rounded-xl h-14" onClick={() => {
                            const formElement = document.getElementById('template-form-section');
                            if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            지금 시작하기
                        </Button>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="bg-white/5 rounded-2xl py-12 px-6">
                <h2 className="text-white text-2xl font-bold mb-8 px-2">주요 특징</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-2xl drop-shadow-md">
                            ⚡️
                        </div>
                        <div>
                            <p className="text-white text-base font-bold mb-1">빠른 실행</p>
                            <p className="text-gray-400 text-xs leading-relaxed">책 추가, 하이라이트를 대시보드에서 즉시 생성</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-2xl drop-shadow-md">
                            🗂️
                        </div>
                        <div>
                            <p className="text-white text-base font-bold mb-1">체계적 관리</p>
                            <p className="text-gray-400 text-xs leading-relaxed">서재와 하이라이트를 상세 페이지로 자동 정리</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-2xl drop-shadow-md">
                            📖
                        </div>
                        <div>
                            <p className="text-white text-base font-bold mb-1">기록의 질</p>
                            <p className="text-gray-400 text-xs leading-relaxed">양보다 질에 집중하는 하이라이트 중심 구조</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-2xl drop-shadow-md">
                            🏅
                        </div>
                        <div>
                            <p className="text-white text-base font-bold mb-1">독서 습관</p>
                            <p className="text-gray-400 text-xs leading-relaxed">챌린지 기능으로 꾸준한 독서 루틴 형성</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Screen Preview */}
            <section className="flex flex-col gap-8">
                <h2 className="text-white text-2xl font-bold px-2">화면 미리보기</h2>
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                        <div className="aspect-video bg-black/50 overflow-hidden relative">
                            <PreviewVideo src="/videos/dashboard.mp4" />
                        </div>
                        <div className="p-5">
                            <h3 className="text-white text-lg font-bold mb-2">메인 홈 대시보드</h3>
                            <p className="text-gray-400 text-sm">대부분의 작업을 빠르게 처리하고 한눈에 진행 상황을 파악하는 메인 대시보드</p>
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                        <div className="aspect-video bg-black/50 overflow-hidden relative">
                            <PreviewVideo src="/videos/highlight.mp4" />
                        </div>
                        <div className="p-5">
                            <h3 className="text-white text-lg font-bold mb-2">하이라이트 관리 화면</h3>
                            <p className="text-gray-400 text-sm">기록한 모든 문장과 생각을 책별, 태그별, 카테고리별로 깔끔하게 자동 분류</p>
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                        <div className="aspect-video bg-black/50 overflow-hidden relative">
                            <PreviewVideo src="/videos/challenge.mp4" />
                        </div>
                        <div className="p-5">
                            <h3 className="text-white text-lg font-bold mb-2">챌린지 관리 화면</h3>
                            <p className="text-gray-400 text-sm">책별로 독서 목표를 설정해서 월간/연간 독서 목표까지 상태 확인</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust and Benefits */}
            <section className="bg-white/5 rounded-2xl py-12 px-6">
                <h2 className="text-white text-2xl font-bold mb-8 px-2">신뢰와 혜택</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl drop-shadow-md shrink-0">
                            📘
                        </div>
                        <div>
                            <p className="text-white font-bold">상세 사용 가이드</p>
                            <p className="text-gray-400 text-sm">템플릿 내 상세한 가이드 제공</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl drop-shadow-md shrink-0">
                            💬
                        </div>
                        <div>
                            <p className="text-white font-bold">1:1 Q&A 지원</p>
                            <p className="text-gray-400 text-sm">궁금한 점은 언제든 판매자에게 직접 문의</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl drop-shadow-md shrink-0">
                            🔄
                        </div>
                        <div>
                            <p className="text-white font-bold">평생 업데이트</p>
                            <p className="text-gray-400 text-sm">템플릿 개선 시 무상 업데이트 지원</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Usage Flow */}
            <section className="bg-accent/10 rounded-2xl py-16 px-6 relative overflow-hidden">
                <h2 className="text-white text-2xl font-bold mb-10 text-center">간편하게 만드는 독서 습관과 기록 아카이브</h2>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent/30"></div>
                    <div className="flex flex-col gap-8">
                        <div className="flex gap-6 items-start relative">
                            <div className="w-8 h-8 rounded-full bg-accent text-[#061A14] flex items-center justify-center font-bold z-10 shrink-0">1</div>
                            <div className="flex flex-col pt-1">
                                <h4 className="font-bold text-white text-lg">책 추가하기</h4>
                                <p className="text-gray-300 text-sm">서재에 읽고 싶은 책을 등록합니다.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start relative">
                            <div className="w-8 h-8 rounded-full bg-accent text-[#061A14] flex items-center justify-center font-bold z-10 shrink-0">2</div>
                            <div className="flex flex-col pt-1">
                                <h4 className="font-bold text-white text-lg">읽기 시작하기</h4>
                                <p className="text-gray-300 text-sm">독서 상태를 '읽는 중'으로 변경합니다.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start relative">
                            <div className="w-8 h-8 rounded-full bg-accent text-[#061A14] flex items-center justify-center font-bold z-10 shrink-0">3</div>
                            <div className="flex flex-col pt-1">
                                <h4 className="font-bold text-white text-lg">하이라이트 남기기</h4>
                                <p className="text-gray-300 text-sm">인상 깊은 문장과 내 생각을 기록합니다.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start relative">
                            <div className="w-8 h-8 rounded-full bg-accent text-[#061A14] flex items-center justify-center font-bold z-10 shrink-0">4</div>
                            <div className="flex flex-col pt-1">
                                <h4 className="font-bold text-white text-lg">완독 기록하기</h4>
                                <p className="text-gray-300 text-sm">읽은 날짜와 평점을 기록하며 마무리합니다.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start relative">
                            <div className="w-8 h-8 rounded-full bg-accent text-[#061A14] flex items-center justify-center font-bold z-10 shrink-0">5</div>
                            <div className="flex flex-col pt-1">
                                <h4 className="font-bold text-white text-lg">챌린지로 습관 만들기</h4>
                                <p className="text-gray-300 text-sm">성취감을 느끼며 다음 책으로 이어갑니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            <section className="py-16 px-4">
                <h2 className="text-white text-2xl font-bold mb-8 text-center font-display">이런 분들께 추천해요</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                        <span className="text-2xl drop-shadow-md">📝</span>
                        <p className="text-white font-medium">책을 읽고도 기록이 남지 않는 사람</p>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                        <span className="text-2xl drop-shadow-md">💖</span>
                        <p className="text-white font-medium">인상 깊은 문장을 모아두고 싶은 사람</p>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                        <span className="text-2xl drop-shadow-md">📈</span>
                        <p className="text-white font-medium">독서 습관을 만들고 싶은 사람</p>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                        <span className="text-2xl drop-shadow-md">🎨</span>
                        <p className="text-white font-medium">깔끔한 노션 독서 템플릿을 찾는 사람</p>
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-white/5 rounded-2xl">
                <h2 className="text-white text-2xl font-bold mb-8 text-center font-display">자주 묻는 질문</h2>
                <div className="space-y-6 max-w-md mx-auto">
                    <div>
                        <p className="text-white font-bold mb-2 flex items-center gap-2"><span className="text-accent font-black text-xl">Q.</span> 노션은 무료인가요?</p>
                        <p className="text-gray-400 text-sm pl-7">네, 개인 사용자는 무료로 모든 기기에서 동기화하여 사용할 수 있습니다.</p>
                    </div>
                    <div>
                        <p className="text-white font-bold mb-2 flex items-center gap-2"><span className="text-accent font-black text-xl">Q.</span> 노션이 처음인데 괜찮을까요?</p>
                        <p className="text-gray-400 text-sm pl-7">직관적인 인터페이스와 친절한 영상 가이드가 있어 금방 적응하실 수 있습니다.</p>
                    </div>
                    <div>
                        <p className="text-white font-bold mb-2 flex items-center gap-2"><span className="text-accent font-black text-xl">Q.</span> 커스터마이징이 가능한가요?</p>
                        <p className="text-gray-400 text-sm pl-7">네, 본인의 스타일에 맞게 자유롭게 수정하여 사용할 수 있습니다.</p>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-accent/5 rounded-2xl flex flex-col items-center text-center gap-6 shadow-sm border border-white/5">
                <span className="text-5xl drop-shadow-md">📚</span>
                <div className="flex flex-col gap-3">
                    <h2 className="text-white text-2xl font-bold leading-tight">
                        독서를 기록으로 끝내지 말고,<br />나만의 문장과 생각으로 쌓아보세요.
                    </h2>
                </div>
                <div className="flex flex-col w-full max-w-sm gap-3 mt-4">
                    <Button className="w-full bg-accent text-[#061A14] hover:bg-white hover:text-accent font-bold py-6 text-lg transition-all rounded-xl h-14" onClick={() => {
                        const formElement = document.getElementById('template-form-section');
                        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        템플릿 무료로 받기
                    </Button>
                </div>
            </section>
        </div >
    );
}
