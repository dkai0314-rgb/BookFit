import type { Metadata, Viewport } from "next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://bookfit.club";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "BookFit - 당신을 위한 AI 북 카운셀러",
  description: "현재 상황과 감정에 딱 맞는 책을 처방해드립니다. AI 분석으로 지금 당신에게 필요한 단 한 권의 책을 찾아보세요.",
  keywords: ["도서 추천", "AI 북 카운셀러", "독서 큐레이션", "심리 기반 도서 추천", "북핏", "BookFit"],
  authors: [{ name: "BookFit Team" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "BookFit - AI 기반 개인 맞춤형 도서 추천 서비스",
    description: "지금 당신의 감정과 상황에 완벽하게 어울리는 책을 AI가 추천해드립니다.",
    url: SITE_URL,
    siteName: "BookFit",
    images: [
      {
        url: `${SITE_URL}/logo-square.png`,
        width: 1200,
        height: 630,
        alt: "BookFit - AI Book Counselor",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookFit - AI 북 카운셀러",
    description: "지금 당신에게 필요한 단 한 권의 책을 AI가 처방해드립니다.",
    images: [`${SITE_URL}/logo-square.png`],
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
        <JsonLd data={organizationData} />
        <JsonLd data={websiteData} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
