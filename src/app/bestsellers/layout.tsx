import type { Metadata } from "next";

// page.tsx는 클라이언트 컴포넌트라 metadata export 불가 — layout에서 선언.
export const metadata: Metadata = {
    title: "베스트셀러 추천 | 북핏 BookFit",
    description:
        "지금 서점가에서 가장 사랑받는 베스트셀러를 분야별로 한눈에. 북핏 AI가 베스트셀러 속에서 당신 취향에 맞는 책을 찾아드립니다.",
    alternates: { canonical: "/bestsellers" },
    openGraph: {
        title: "베스트셀러 추천 | 북핏 BookFit",
        description:
            "지금 서점가에서 가장 사랑받는 베스트셀러를 분야별로 한눈에. 북핏 AI가 베스트셀러 속에서 당신 취향에 맞는 책을 찾아드립니다.",
        url: "/bestsellers",
        type: "website",
    },
};

export default function BestsellersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
