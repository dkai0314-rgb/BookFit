import type { Metadata, Viewport } from "next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://bookfit.club";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "BookFit - ?�신???�한 AI �?카운?�??,
  description: "?�재 ?�황�?감정????맞는 책을 처방?�드립니?? AI 분석?�로 지�??�신?�게 ?�요??????권의 책을 찾아보세??",
  keywords: ["책추�?, "ai책추�?, "�?추천", "AI �?추천", "?�서 추천", "AI �?카운?�??, "?�서 ?�레?�션", "?�리 기반 ?�서 추천", "북핏", "BookFit"],
  authors: [{ name: "BookFit Team" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "BookFit - AI 기반 개인 맞춤???�서 추천 ?�비??,
    description: "지�??�신??감정�??�황???�벽?�게 ?�울리는 책을 AI가 추천?�드립니??",
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
    title: "BookFit - AI �?카운?�??,
    description: "지�??�신?�게 ?�요??????권의 책을 AI가 처방?�드립니??",
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
    "description": "AI 기반 개인???�서 추천 �??�서 경험 가?�드 ?�비??,
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
