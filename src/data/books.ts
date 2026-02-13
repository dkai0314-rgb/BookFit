export interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    description: string;
    summary: string; // LLM-based summary explaining "Why this book?"
    coverColor: string; // Placeholder for now, can be image URL later
    purchaseLink: string;
}

export const monthlyBestsellers: Book[] = [
    {
        id: "1",
        title: "침묵의 기술",
        author: "조제프 앙투안 투생 디누아르",
        category: "PHILOSOPHY",
        description: "말하지 않음으로써 더 많은 것을 말하는 법",
        summary: "소음으로 가득 찬 세상에서, 침묵이 어떻게 가장 강력한 표현 수단이 될 수 있는지 통찰합니다. 복잡한 관계 속에서 지친 당신에게 '멈춤'의 미학을 선물합니다.",
        coverColor: "#a3b18a",
        purchaseLink: "https://www.coupang.com",
    },
    {
        id: "2",
        title: "건축의 고고학",
        author: "Unknown",
        category: "ART & ARCHITECTURE",
        description: "공간이 기억하는 시간의 흔적들",
        summary: "우리가 머무는 공간이 단순한 물리적 구조물이 아니라, 인간의 기억과 역사가 퇴적된 층위임을 보여줍니다. 공간에 대한 새로운 시각을 열어줄 것입니다.",
        coverColor: "#457b9d",
        purchaseLink: "https://www.coupang.com",
    },
    {
        id: "3",
        title: "언어의 온도",
        author: "이기주",
        category: "ESSAYS",
        description: "말과 글에는 나름의 온도가 있다",
        summary: "당신이 무심코 내뱉은 말 한마디가 누군가에게는 따뜻한 위로가, 누군가에게는 차가운 상처가 될 수 있음을 일깨웁니다. 관계의 온도를 높이고 싶은 분들께 추천합니다.",
        coverColor: "#e9c46a",
        purchaseLink: "https://www.coupang.com",
    },
    {
        id: "4",
        title: "이어령의 마지막 수업",
        author: "김지수, 이어령",
        category: "HUMANITIES",
        description: "라스트 인터뷰, 삶과 죽음에 대한 깊은 성찰",
        summary: "시대의 지성이 생의 마지막 순간에 남긴, 삶의 본질에 대한 빛나는 통찰들. 죽음 앞에서도 유머와 호기심을 잃지 않는 태도가 깊은 울림을 줍니다.",
        coverColor: "#e76f51",
        purchaseLink: "https://www.coupang.com",
    }
];
