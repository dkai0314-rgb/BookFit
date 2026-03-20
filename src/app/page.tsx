import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, BookCheck, Lightbulb } from "lucide-react";
import CurationSection from "@/components/CurationSection";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";

export default function Home() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "북핏(BookFit)은 어떤 서비스인가요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "북핏은 사용자의 취향과 현재 감정, 상황을 AI가 분석하여 가장 완벽한 '책 추천'을 제공하는 AI 북 카운셀링 서비스입니다."
        }
      },
      {
        "@type": "Question",
        "name": "어떤 책을 추천받을 수 있나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "심리 기반 책 추천, 개인의 취향 맞춤 도서, 그리고 최근 인기 있는 베스트셀러 추천까지 나에게 꼭 맞는 단 한 권의 책을 찾아드립니다."
        }
      },
      {
        "@type": "Question",
        "name": "AI 책 추천은 어떻게 이루어지나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "간단한 질문을 통해 당신의 목표, 고민, 관심사를 파악하여 핵심 키워드를 추출하고, 이를 기반으로 가장 적합한 취향책추천과 추천 근거를 함께 제공합니다."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center overflow-x-hidden">
      <JsonLd data={faqData} />
      {/* Header */}
      <Header />

      <main className="flex-1 w-full flex flex-col items-center" id="main-content">
        {/* Hero Section */}
        <section className="relative w-full py-32 md:py-48 text-center flex flex-col items-center space-y-8 overflow-hidden" aria-labelledby="hero-title">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/library_background.png')" }}
            />
            {/* Adjusted overlay for better visibility of background based on feedback */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-6 px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/10 bg-white/80 backdrop-blur-md px-4 py-2 text-base font-semibold text-primary transition-colors shadow-sm">
              수만 권 중 지금 당신의 책은? 📚
            </div>
            <h1 id="hero-title" className="text-4xl md:text-7xl font-extrabold tracking-tight text-primary break-keep drop-shadow-sm leading-tight relative">
              <span className="sr-only">BookFit(북핏) - AI 책 추천, 취향 맞춤 도서 및 베스트셀러 큐레이션</span>
              지금 당신에게 필요한 <br className="md:hidden" />
              <span className="text-accent italic">
                딱 한 권
              </span>
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl break-keep leading-relaxed drop-shadow-sm font-medium">
              취향도, 기분도 다른 당신에게 딱 맞는 한 권을 골라드려요.
            </p>
            <div className="flex flex-col gap-4 pt-6 w-full max-w-sm mx-auto">
              <Link href="/recommend" className="w-full">
                <Button size="lg" className="w-full rounded-md bg-accent text-white hover:bg-primary font-extrabold px-8 py-8 text-xl shadow-lg shadow-accent/20 transition-all hover:scale-105 border border-transparent" aria-label="지금 내 책 찾기">
                  지금 내 책 찾기 🔍
                </Button>
              </Link>
              <Link href="/template" className="w-full">
                <Button variant="outline" size="lg" className="w-full rounded-md border-primary/20 bg-white/50 text-primary hover:bg-primary/5 px-8 py-6 text-lg backdrop-blur-sm transition-all hover:border-primary/40 shadow-sm" aria-label="독서관 노션 템플릿 확인하기">
                  <BookCheck className="mr-2 h-5 w-5" />
                  독서관 노션 템플릿
                </Button>
              </Link>
            </div>
          </div>
        </section>


        {/* BookFit Choice (Google Sheets Integration) */}
        <CurationSection id="curation" />

        {/* Your BookFit Journey (Previously The BookFit Approach) - Updated */}
        <section className="w-full py-24 px-6 relative bg-white border-t border-border" aria-labelledby="journey-title">
          <div className="max-w-6xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <h2 id="journey-title" className="text-3xl md:text-4xl font-bold text-primary font-serif">Your BookFit Journey</h2>
              <div className="w-12 h-0.5 bg-accent/50 mx-auto" aria-hidden="true"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              <article className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-secondary group-hover:bg-accent/10 transition-colors" aria-hidden="true">
                  <MessageSquare className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-primary">상황 분석</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto break-keep">
                  당신의 목표, 고민, 관심사를 짧은 질문으로 정리해 핵심 키워드를 뽑아냅니다.
                </p>
              </article>
              <article className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-secondary group-hover:bg-accent/10 transition-colors" aria-hidden="true">
                  <BookCheck className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-primary">딱 맞는 추천</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto break-keep">
                  분석된 키워드로 지금 당신에게 가장 필요한 책 한 권을 정밀하게 추천합니다.
                </p>
              </article>
              <article className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-secondary group-hover:bg-accent/10 transition-colors" aria-hidden="true">
                  <Lightbulb className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-primary">추천 근거</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto break-keep">
                  ‘왜 이 책인지’를 한눈에 이해하도록, 추천 이유와 적용 포인트를 함께 제공합니다.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
