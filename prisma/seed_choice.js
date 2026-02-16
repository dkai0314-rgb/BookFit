
/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const books = [
        {
            title: "세이노의 가르침 (화이트 에디션)",
            author: "세이노",
            category: "자기계발",
            description: "2000년부터 발표된 그의 주옥같은 글들. 독자들이 자발적으로 만든 제본서는 물론, 전자책과 앱까지 나왔던 《세이노의 가르침》이 드디어 전국 서점에서 독자들을 마주한다.",
            summary: "피보다 진하게 살아라. 2000년부터 발표된 그의 주옥같은 글들. 독자들이 자발적으로 만든 제본서는 물론, 전자책과 앱까지 나왔던 《세이노의 가르침》이 드디어 전국 서점에서 독자들을 마주한다.",
            imageUrl: "https://image.aladin.co.kr/product/30929/51/coversum/s192030030_1.jpg",
            purchaseLink: "https://link.coupang.com/a/dNtjOA",
            isChoice: true
        },
        {
            title: "웰씽킹 WEALTHINKING",
            author: "켈리 최",
            category: "자기계발",
            description: "부를 창조한 사람들이 갖고 있는 생각의 뿌리를 이해하고 체득하기 위해 ‘풍요의 생각’을 이야기하는 책이다.",
            summary: "부를 창조한 사람들이 갖고 있는 생각의 뿌리를 이해하고 체득하기 위해 ‘풍요의 생각’을 이야기하는 책이다. 풍요의 생각은 결핍의 생각과 반대되는 개념이다.",
            imageUrl: "https://image.aladin.co.kr/product/28273/37/coversum/s242836112_3.jpg",
            purchaseLink: "https://link.coupang.com/a/dNtl2a",
            isChoice: true
        },
        {
            title: "하마터면 열심히 살 뻔했다",
            author: "하완",
            category: "에세이",
            description: "야매 득도 에세이. 4수 끝에 미대에 들어갔고 3년 동안 회사를 다니다 일러스트레이터로 독립했다. 인생이 계획대로 풀리지 않기에, 더더욱 계획 없이 살기로 했다.",
            summary: "이번에 새롭게 선보이는 개정증보판은 한층 세련되고 여유로운 초록의 표지 그림과 함께, '나만의 속도로 살아갈 결심'이라는 새로운 부제를 통해 '끌려가는 삶이 아닌 끌고 가는 삶'을 살고자 하는 저자의 메시지를 전한다.",
            imageUrl: "https://image.aladin.co.kr/product/33999/86/coversum/k672930658_1.jpg",
            purchaseLink: "https://link.coupang.com/a/dNtnud",
            isChoice: true
        },
        {
            title: "더블 클릭",
            author: "알간지",
            category: "자기계발",
            description: "112만 구독자 알간지의 첫 책으로, 선택과 실행을 주제로 삶의 기준을 다시 세우는 방법을 다룬다.",
            summary: "112만 구독자 알간지의 첫 책으로, 선택과 실행을 주제로 삶의 기준을 다시 세우는 방법을 다룬다. 원클릭과 더블 클릭의 구조로 완벽주의와 계획 중독을 넘어 실행 가능한 삶의 기술을 정리한다.",
            imageUrl: "https://image.aladin.co.kr/product/38361/32/coversum/k722135362_1.jpg",
            purchaseLink: "https://link.coupang.com/a/dNto4A",
            isChoice: true
        },
        {
            title: "세상 끝의 카페",
            author: "존 스트레레키",
            category: "소설/자기계발",
            description: "소설 형식의 자기계발서인 이 책은 주인공인 존이 피로와 짜증에 가득 찬 상태로 우연히 찾게 된 카페에서 벌어지는 일을 그린다.",
            summary: "주인공 존은 그곳에서 만난 사람들과의 대화를 통해 삶을 송두리째 바꿀 만한 깨달음을 하나씩 얻어간다. '존재의 목적'에 대해 질문을 던지는 책.",
            imageUrl: "https://image.aladin.co.kr/product/31186/54/coversum/k172831854_1.jpg",
            purchaseLink: "https://link.coupang.com/a/dNtwBj",
            isChoice: true
        },
        {
            title: "이어령의 마지막 수업",
            author: "김지수, 이어령",
            category: "인문학",
            description: "시대의 지성 이어령과 ‘인터스텔라’ 김지수의 ‘라스트 인터뷰’. 삶과 죽음에 대한 마지막 인생 수업.",
            summary: "“나는 곧 죽을 거라네. 그것도 오래지 않아. 그러니 지금 할 수 있는 모든 이야기를 쏟아놓을 참이야.” 삶과 죽음, 사랑과 용서, 그리고 잃어버린 것들에 대한 마지막 수업.",
            imageUrl: "https://image.aladin.co.kr/product/28212/10/coversum/k762835176_3.jpg",
            purchaseLink: "https://link.coupang.com/a/dNtydK",
            isChoice: true
        }
    ];

    console.log('Seeding BookFit Choice (Replacing)...');

    // 1. Clear existing choices
    await prisma.book.deleteMany({
        where: { isChoice: true }
    });
    console.log('Deleted existing Choice books.');

    // 2. Insert new choices
    for (const book of books) {
        await prisma.book.create({ data: book });
        console.log(`Created: ${book.title}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
