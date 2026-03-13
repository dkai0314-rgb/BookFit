import { GoogleGenerativeAI } from "@google/generative-ai";
import { BookMeta } from './book-apis';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export type RecommendMode = 'TASTE' | 'MIND';

export interface RecommendationRequest {
    mode: RecommendMode;
    // Taste inputs
    topics?: string[];
    style?: string;
    customQuery?: string;
    purpose?: string;      // NEW: 배경지식 | 실무적용 | 영감 | 재미
    readingLevel?: string; // NEW: 입문 | 중급 | 심화
    // Mind inputs
    emotion?: string[];
    situation?: string;
    wantTo?: string;       // NEW: 위로 | 이해 | 변화 | 현실도피
    readingMood?: string;  // NEW: 가볍게 | 깊이
}

export interface RecommendedBookBase {
    title: string;
    author: string;
    reason: string;
    coreMessage: string;
    userConnectionPoint: string;
}

// ─────────────────────────────────────────
// 공통 제약 조건 (TASTE/MIND 모두 적용)
// ─────────────────────────────────────────
const COMMON_CONSTRAINTS = `
[핵심 제약 조건 - 반드시 준수]
1. 한국 알라딘(aladin.co.kr)에서 실제 구매 가능한 도서만 추천하십시오.
   - 한국어 번역본이 존재하는 해외 도서 또는 국내 저자의 도서 우선
   - 출판된 지 10년 이상 된 비주류 도서는 지양 (절판 가능성 높음)
   - 단, 스테디셀러로 지금도 판매 중인 고전은 허용
2. 교재, 학술 논문, 잡지, 만화, 아동서는 제외하십시오.
3. 반드시 실제 ISBN이 존재하는 도서만 추천하십시오. 제목을 절대 지어내지 마십시오.
4. 동일 저자의 책은 1권만 추천하십시오. (다양성 확보)
5. 베스트셀러 편중을 피하고, 진짜 이 상황에 맞는 책을 큐레이션하십시오.
`;

export async function getRecommendations(request: RecommendationRequest): Promise<RecommendedBookBase[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    if (request.mode === 'TASTE') {
        prompt = `
[Role]
당신은 "Premium High-End Book Curator"입니다.
사용자의 지적 호기심과 구체적인 요구사항을 완벽하게 충족시켜줄 책을 10권 엄선해주세요.
(이 중 검증된 상위 3권만 사용자에게 보여줄 예정입니다)

[User Request]
- 사용자가 직접 작성한 요청: "${request.customQuery || "별도 요청 없음"}"
- 관심 키워드 (참고용): ${request.topics?.join(", ") || "없음"}
- 선호 스타일: ${request.style || "상관없음"}
- 이 책의 목적: ${request.purpose || "명시 없음"}
- 원하는 난이도: ${request.readingLevel || "중급으로 가정"}

[사용자 의도 분석 Framework]
추천 전 반드시 아래 3가지를 추출하고 이를 기준으로 책을 선정하십시오:
1. 난이도: "${request.readingLevel || "중급"}" 기준으로 해당 수준에 맞는 책 선정
   - 입문: 개념 설명 중심, 사례 위주, 쉬운 문체
   - 중급: 이론과 실전의 균형, 어느 정도의 배경지식 가정
   - 심화: 원리와 구조, 비판적 사고, 전문 용어 허용
2. 목적: "${request.purpose || "없음"}" 기준으로 책의 성격 결정
   - 배경지식: 넓고 구조적인 이해를 주는 책
   - 실무적용: 바로 써먹을 수 있는 액션 중심 책
   - 영감: 관점을 바꿔주는 인사이트 중심 책
   - 재미: 몰입감 있고 가독성 높은 책
3. 자연어 핵심 의도: 사용자의 문장에서 '진짜 원하는 것'을 한 줄로 요약 후 그에 맞는 책 선정

${COMMON_CONSTRAINTS}

[Output Format - JSON Array only, no markdown]
[
  {
    "title": "책 제목 (정확하게)",
    "author": "저자 이름",
    "coreMessage": "이 책의 핵심 메시지 한 문장",
    "reason": "추천 이유 (2~3문장, 사용자의 목적/난이도/관심사와 구체적으로 연결)",
    "userConnectionPoint": "사용자 입력과 연결되는 핵심 포인트 (단답형, 예: '마케팅 실무 입문자에게 최적')"
  }
]
* 응답은 오직 JSON 데이터만 출력하십시오. 마크다운 포맷팅 없이.
`;

    } else {
        prompt = `
[Role]
당신은 "Soul Therapist & Book Curator"입니다.
사용자의 감정과 상황을 깊이 공감하고, 책 속의 문장으로 위로와 해답을 건네주세요.
사용자에게 선물할 책 10권을 신중하게 골라주세요.

[User Emotion/Situation]
- 사용자가 직접 작성한 상황/고민: "${request.situation || "별도 설명 없음"}"
- 감정 키워드 (참고용): ${request.emotion?.join(", ") || "없음"}
- 책에서 원하는 것: ${request.wantTo || "명시 없음"}
- 독서 무드: ${request.readingMood || "명시 없음"}

[감정-도서 매핑 원칙]
사용자의 자연어와 "책에서 원하는 것"을 조합하여 책의 성격을 결정하십시오:
- 원하는 것이 "위로"일 때 → 따뜻한 에세이, 회복 서사, 공감 중심
- 원하는 것이 "이해"일 때 → 심리학, 철학, 내 상황을 설명해주는 책
- 원하는 것이 "변화"일 때 → 실천 가능한 자기계발 + 인문 융합
- 원하는 것이 "현실도피"일 때 → 몰입도 높은 소설, 에세이, 여행기

독서 무드 반영:
- "가볍게": 쉽고 짧은 문장, 빠르게 읽히는 책 우선
- "깊이": 묵직하고 사유를 자극하는 책 허용

감정 키워드별 추가 가이드:
- 지침/번아웃 → 느린 삶, 자기돌봄, 회복 서사
- 불안/걱정 → 심리학적 위로, 인지행동 관련, 철학적 안정
- 자존감 하락 → 자기수용, 내면 탐구, 용기 있는 에세이
- 관계의 어려움 → 관계 심리학, 경계 설정, 공감 에세이
- 무기력 → 작은 실천, 동기부여, 일상 회복 서사
- 새로운 시작 → 변화의 심리학, 설렘을 주는 에세이
- 위로가 필요해 → 따뜻한 문체, 공감 100% 에세이

"처방"이 아닌 "동행"의 언어로 추천 이유를 작성하십시오. (~해요체)

${COMMON_CONSTRAINTS}

[Output Format - JSON Array only, no markdown]
[
  {
    "title": "책 제목 (정확하게)",
    "author": "저자 이름",
    "coreMessage": "이 책이 전하는 따뜻한 메시지 한 문장",
    "reason": "추천 이유 (2~3문장, 기대 효과와 위로의 메시지 중심, ~해요체)",
    "userConnectionPoint": "사용자의 감정/상태와 연결되는 포인트 (예: 번아웃으로 지친 마음을 쉬게 해줘요)"
  }
]
* 응답은 오직 JSON 데이터만 출력하십시오. 마크다운 포맷팅 없이.
`;
    }

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Recommendation Error:", error);
        return [];
    }
}

export async function generateBookFitLetter(book: BookMeta): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const baseTitle = `${book.title} 요약 | 핵심 인사이트 정리 [북핏]`;
    const baseDesc = `${book.title}의 주요 내용과 핵심 정리입니다. 지금 바로 확인하세요.`;

    const template = `---
meta_title: "${baseTitle}"
meta_description: "${baseDesc}"
og_title: "${book.title} - 북핏 핵심 요약"
og_description: "${book.title}의 주요 내용. 북핏 핵심 요약."
slug: "bookfit-${book.sourceId}"
canonical_url: "https://bookfit.kr/bookfit-letter/bookfit-${book.sourceId}"
published_at: "${today}"
updated_at: "${today}"
category: "${book.categories?.[0] || '미분류'}"
tags: ["${book.title.replace(/\s/g, '')}", "북핏추천"]
reading_time: "5분"
source: "aladin"
item_id: "${book.sourceId}"
isbn13: "${book.isbn13 || ''}"
---

# ${book.title}

> "이 책의 핵심을 관통하는 강렬한 한 문장 (작성 필요)"

[이 책을 꼭 읽어야 하는 이유, 서론 1~2문장을 여기에 작성해주세요]

---

<!--META_INFO_START-->
## 📖 책 한눈에 보기

| 항목 | 내용 |
|---|---|
| 저자 | ${book.authors?.join(', ') || '(정보 확인 필요)'} |
| 출판 | ${book.publisher || '(정보 확인 필요)'} |
| 출간 | ${book.publishedDate || '(정보 확인 필요)'} |
| 분야 | ${book.categories?.join(' / ') || '(정보 확인 필요)'} |
| 난이도 | ⭐⭐⭐☆☆ (누구나 읽기 쉬움) |
| 분량 | 중간 (빠른 독자 기준 4~5시간) |
<!--META_INFO_END-->

---

## 💡 이 책을 한 줄로 말하면

> **"성공은... (이 책 전체를 관통하는 핵심 메시지 1문장)"**

---

## 🎯 북핏 핵심 인사이트 3

### 1) [핵심 인사이트 1 제목]
[핵심 인사이트 1에 대한 상세 설명 및 시사점]

### 2) [핵심 인사이트 2 제목]
[핵심 인사이트 2에 대한 상세 설명 및 시사점]

### 3) [핵심 인사이트 3 제목]
[핵심 인사이트 3에 대한 상세 설명 및 시사점]

---

## 📅 7일 적용 실험

**기간:** 7일
**규칙:** [매일 실천할 수 있는 작고 구체적인 행동 규칙]
**목표:** 7일 뒤 예상되는 나의 변화

---

## 🙋 이런 분께 추천해요

- [추천 대상 1]
- [추천 대상 2]
- [추천 대상 3]

---

## ❓ 자주 묻는 질문 (FAQ)

**Q. 이 책은 어떤 책인가요?**
A. [책에 대한 간략한 답변]

**Q. 비슷한 다른 책과 무엇이 다른가요?**
A. [차별점에 대한 간략한 답변]

**Q. 읽기 어렵지는 않나요?**
A. [난이도에 대한 간략한 답변]

---

[👉 ${book.title} 지금 바로 보기](링크를_여기에_입력하세요)
`;
    return template;
}
