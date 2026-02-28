import type { Metadata, Viewport } from "next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";

const SITE_URL = "https://bookfit.kr";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "북핏 - 취향과 마음을 읽는 AI 북 카운셀러",
  description: "북핏은 자연어 기반의 '취향 추천'과 현재의 감정, 상황, 심리 상태를 분석하는 '마음 추천'으로 지금 당신에게 필요한 책을 추천하는 북 큐레이션 서비스입니다.",
  keywords: ["도서 추천", "AI 북 카운셀러", "독서 큐레이션", "심리 기반 도서 추천", "북핏", "BookFit", "책추천", "ai책추천", "취향책추천", "베스트셀러추천"],
  authors: [{ name: "BookFit Team" }],
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    other: {
      "naver-site-verification": "a5b78d876ec1482634394e62e269a06eea8b7a8d",
    },
  },
  openGraph: {
    title: "북핏 - 취향과 마음을 읽는 AI 북 카운셀러",
    description: "북핏은 자연어 기반의 '취향 추천'과 현재의 감정, 상황, 심리 상태를 분석하는 '마음 추천'으로 지금 당신에게 필요한 책을 추천하는 북 큐레이션 서비스입니다.",
    url: SITE_URL,
    siteName: "BookFit",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "북핏 - 취향과 마음을 읽는 AI 북 카운셀러",
    description: "북핏은 자연어 기반의 '취향 추천'과 현재의 감정, 상황, 심리 상태를 분석하는 '마음 추천'으로 지금 당신에게 필요한 책을 추천하는 북 큐레이션 서비스입니다.",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BookFit",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo-square.png`,
    "description": "AI 기반 개인화 도서 추천 및 독서 경험 가이드 서비스",
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BookFit",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/recommend?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="ko">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <JsonLd data={organizationData} />
        <JsonLd data={websiteData} />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
