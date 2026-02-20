import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, MessageSquare, BookCheck, Lightbulb } from "lucide-react";
import CurationSection from "@/components/CurationSection";
import BeehiivEmbed from "@/components/BeehiivEmbed";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center gap-2 font-serif tracking-tight cursor-pointer">
            <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm">BookFit</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <Link href="#curation" className="hover:text-accent transition-colors">이달의북핏</Link>
            <Link href="/bestsellers" className="hover:text-accent transition-colors">베스트셀러</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">Login</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative w-full py-32 md:py-48 text-center flex flex-col items-center space-y-8 overflow-hidden">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/library_background.png')" }}
            />
            {/* Adjusted overlay for better visibility of background based on feedback */}
            <div className="absolute inset-0 bg-[#061A14]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061A14] via-transparent to-[#061A14]/60" />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-6 px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors">
              <Sparkles className="w-3 h-3 mr-1 text-accent" />
              근거 있는 맞춤 도서 추천
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white break-keep drop-shadow-sm leading-tight">
              지금 당신에게 필요한 <br className="md:hidden" />
              <span className="text-accent italic">
                딱 한 권
              </span>
            </h1>
            <p className="max-w-[700px] text-gray-300 md:text-xl break-keep leading-relaxed drop-shadow-sm font-light">
              AI 분석으로 지금의 당신에게 필요한 책을 찾습니다.<br />
              읽어야 할 이유를 먼저 확인하고, 확신 있게 선택하세요.
            </p>
            <div className="flex gap-4 pt-6">
              <Link href="/recommend">
                <Button size="lg" className="rounded-md bg-accent text-[#061A14] hover:bg-white hover:text-accent font-bold px-8 py-6 text-lg shadow-lg shadow-black/20 transition-all hover:scale-105 border border-transparent">
                  <Sparkles className="mr-2 h-5 w-5" />
                  AI 맞춤 추천
                </Button>
              </Link>
              <Link href="/bestsellers">
                <Button variant="outline" size="lg" className="rounded-md border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm transition-all hover:border-white/40">
                  베스트셀러
                </Button>
              </Link>
            </div>
          </div>
        </section>


        {/* BookFit Choice (Google Sheets Integration) */}
        <CurationSection id="curation" />

        {/* Your BookFit Journey (Previously The BookFit Approach) - Updated */}
        <section className="w-full py-24 px-6 relative">
          <div className="max-w-6xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">Your BookFit Journey</h2>
              <div className="w-12 h-0.5 bg-accent/30 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              <div className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-transparent group-hover:bg-white/5 transition-colors">
                  <MessageSquare className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white">상황 분석</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto break-keep">
                  당신의 목표, 고민, 관심사를 짧은 질문으로 정리해 핵심 키워드를 뽑아냅니다.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-transparent group-hover:bg-white/5 transition-colors">
                  <BookCheck className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white">딱 맞는 추천</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto break-keep">
                  분석된 키워드로 지금 당신에게 가장 필요한 책 한 권을 정밀하게 추천합니다.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-transparent group-hover:bg-white/5 transition-colors">
                  <Lightbulb className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white">추천 근거</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto break-keep">
                  ‘왜 이 책인지’를 한눈에 이해하도록, 추천 이유와 적용 포인트를 함께 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Email Subscription Section - Beehiiv Integration */}
        <section className="w-full py-24 px-6 relative mt-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0B2A1F] to-[#04120e] rounded-2xl p-10 md:p-16 text-center border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent/5 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white font-serif leading-tight">
                  당신만의 서재를 <br />완성할 준비가 되셨나요?
                </h2>
                <p className="text-gray-400 font-light">
                  매주 수요일, 북핏이 선정한 영감의 문장을 메일함으로 보내드립니다.
                </p>
              </div>

              {/* Beehiiv Embed Component */}
              <div className="pt-4">
                <BeehiivEmbed />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-sm text-gray-600 border-t border-[rgba(255,255,255,0.05)] bg-[#04120e]">
        <p>© 2026 BookFit. All rights reserved.</p>
      </footer>
    </div>
  );
}
