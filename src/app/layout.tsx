import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookFit - 당신을 위한 AI 북 카운셀러",
  description: "현재 상황과 감정에 딱 맞는 책을 처방해드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
