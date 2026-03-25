import { GoogleGenerativeAI } from "@google/generative-ai";
import { BookMeta } from './book-apis';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export type RecommendMode = 'TASTE' | 'MIND';

export interface RecommendationRequest {
    mode: RecommendMode;
    customQuery?: string;  // TASTE mode
    situation?: string;    // MIND mode
}

export interface RecommendedBookBase {
    title: string;
    author: string;
    reason: string;
    coreMessage: string;
    userConnectionPoint: string;
}

const COMMON_CONSTRAINTS = `
[핵심 제약 조건 - 반드시 준수]
1. 한국 알라딘(aladin.co.kr)에서 실제 구매 가능한 도서만 추천하십시오.
2. 교재, 학술 논문, 잡지, 만화, 아동서는 제외하십시오.
3. 반드시 실제 ISBN이 존재하는 도서만 추천하십시오. 제목을 절대 지어내지 마십시오.
4. 동일 저자의 책은 1권만 추천하십시오.
5. 베스트셀러 편중을 피하고, 진짜 이 상황에 맞는 책을 큐레이션하십시오.
6. title 필드는 알라딘에서 검색 가능한 정확한 한국어 제목으로 작성하십시오. 번역서는 반드시 한국어 번역 제목을 사용하십시오.
7. 너무 생소하거나 절판된 책보다는 현재 유통 중인 책을 우선적으로 추천하십시오.
`;

export async function getRecommendations(request: RecommendationRequest): Promise<RecommendedBookBase[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let prompt = "";

    if (request.mode === 'TASTE') {
        prompt = `
[Role]
당신은 "Premium High-End Book Curator"입니다. 사용자의 독서 취향과 요청을 깊이 이해하고, 진짜 그 사람에게 맞는 책을 큐레이션하는 전문가입니다.

[User Request]
${request.customQuery}

[Task]
위 요청을 분석하여 가장 적합한 책 10권을 추천하십시오.
요청의 맥락(주제, 목적, 난이도, 분위기 등)을 최대한 반영하십시오.

${COMMON_CONSTRAINTS}

[Output Format]
반드시 아래 JSON 배열 형식으로만 응답하십시오. 다른 텍스트는 포함하지 마십시오.
[
  {
    "title": "알라딘에서 검색 가능한 정확한 한국어 책 제목",
    "author": "저자명",
    "reason": "이 책을 추천하는 이유 (사용자 요청과의 연관성 중심, 2-3문장)",
    "coreMessage": "이 책의 핵심 메시지 한 문장",
    "userConnectionPoint": "이 책이 독자에게 주는 가치 (10자 이내 키워드)"
  }
]
`;
    } else {
        prompt = `
[Role]
당신은 "Soul Therapist & Book Curator"입니다. 사용자의 감정과 상황을 깊이 공감하고, 지금 이 순간 그 사람에게 진심으로 필요한 책을 찾아주는 따뜻한 큐레이터입니다.

[User Situation]
${request.situation}

[Task]
위 상황에 처한 사람에게 가장 도움이 될 책 10권을 추천하십시오.
처방이 아닌 동행의 관점으로, 이 상황과 감정에 공명할 수 있는 책을 선택하십시오.

${COMMON_CONSTRAINTS}

[Output Format]
반드시 아래 JSON 배열 형식으로만 응답하십시오. 다른 텍스트는 포함하지 마십시오.
[
  {
    "title": "알라딘에서 검색 가능한 정확한 한국어 책 제목",
    "author": "저자명",
    "reason": "이 책을 추천하는 이유 (사용자 상황과의 공명 중심, 2-3문장)",
    "coreMessage": "이 책의 핵심 메시지 한 문장",
    "userConnectionPoint": "이 책이 독자에게 주는 위로/가치 (10자 이내 키워드)"
  }
]
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

    const templatePrompt = `
[Role]
당신은 "Premium Content Strategist"입니다.
제공된 도서 정보를 바탕으로 독자의 호기심을 자극하고 클릭을 유도하는 매력적인 요약 레터 초안을 작성하십시오.

[Constraint]
1. headline 및 제목 생성 규칙:
   - headline: 독자의 페인포인트(Pain-point)를 건드리거나 해결책을 제시하는 강렬한 한 문장 (15자 이내 권장).
   - 책 제목을 그대로 headline에 사용하지 마십시오.

2. 섹션별 작성 가이드:
   - **핵심 요약**: 책의 핵심 메시지 3가지를 '[핵심 요약]' 형식으로 작성. 각 요약은 2~3문장의 단락으로 구성.
   - **북핏 핵심 인사이트**: 상세한 설명(3~4문장: 개념→사례→의미)과 함께 독자가 스스로에게 질문할 수 있는 '[리플렉션 질문]' 포함.
   - **적용 실험**: 독자가 7일~14일 동안 실천할 수 있는 구체적인 규칙과 과정 중심의 목표 설정.
   - **추천 대상**: 단순 나열이 아닌 '상황 묘사형'으로 작성하여 공감 유도.

3. tags 생성 규칙:
   - 키워드 단위로 3~5개 생성 (예: ["성장", "심리학", "저자명", "북핏추천"]).

4. 모든 내용은 한국어로 작성하며, 마크다운(Markdown)과 YAML Frontmatter 형식을 완벽히 준수하십시오.

[Book Info]
- 제목: ${book.title}
- 저자: ${book.authors?.join(', ') || '정보 없음'}
- 분야: ${book.categories?.join(', ') || '정보 없음'}
- 주요 내용: ${book.sourceText || '정보 없음'}

[Output Structure]
---
meta_title: "[책 핵심키워드] 요약 | 핵심 인사이트 정리 [북핏]"
meta_description: "${book.title}의 주요 내용과 핵심 인사이트 정리. 지금 바로 확인하세요."
og_title: "${book.title} - 북핏 핵심 요약"
og_description: "[책의 핵심 메시지 한 줄]"
headline: "[독자 호기심을 자극하는 핵심 문장 1줄]"
slug: "bookfit-${book.sourceId}"
canonical_url: "https://bookfit.kr/bookfit-letter/bookfit-${book.sourceId}"
published_at: "${today}"
updated_at: "${today}"
category: "${book.categories?.[0] || '미분류'}"
tags: ["키워드1", "키워드2", "${book.authors?.[0] || ''}", "북핏추천"]
reading_time: "5분"
source: "aladin"
item_id: "${book.sourceId}"
isbn13: "${book.isbn13 || ''}"
---

# [headline과 동일한 핵심 문장 1줄]

안녕하세요 북핏입니다. [발행 시점의 시즌/맥락 한 줄 — 독자가 공감할 상황 묘사].
그럴 때 필요한 건 [거창한 해결책]이 아니라, [이 책이 주는 작은 전환점]일지도 모릅니다.

---

## 핵심 요약

[핵심 요약 1 — 한 단락, 2~3문장. 책의 첫 번째 핵심 메시지]

[핵심 요약 2 — 한 단락, 2~3문장. 책의 두 번째 핵심 메시지]

[핵심 요약 3 — 한 단락, 2~3문장. 책의 세 번째 핵심 메시지]

---

## 북핏 핵심 인사이트

**1) [인사이트 제목]**
[상세 설명 3~4문장. 개념 → 사례 → 의미 순으로 전개]
[리플렉션 질문] [독자가 자신에게 적용해볼 수 있는 리플렉션 질문 1개]

**2) [인사이트 제목]**
[상세 설명 3~4문장. 개념 → 사례 → 의미 순으로 전개]
[리플렉션 질문] [독자가 자신에게 적용해볼 수 있는 리플렉션 질문 1개]

**3) [인사이트 제목]**
[상세 설명 3~4문장. 개념 → 사례 → 의미 순으로 전개]
[리플렉션 질문] [독자가 자신에게 적용해볼 수 있는 리플렉션 질문 1개]

---

## 적용 실험

**[기간]**
- [권장 기간 — 예: 2주(14일)]

**[규칙]**
- [실천 규칙 1]
- [실천 규칙 2]
- [실천 규칙 3]

**[목표]**
"[결과 목표가 아닌, 과정 목표 문장]"

---

## 추천하는 경우

- [추천 대상 1 — 상황 묘사형으로 공감 유도]
- [추천 대상 2 — 상황 묘사형으로 공감 유도]
- [추천 대상 3 — 상황 묘사형으로 공감 유도]

---

[${book.title} 지금 바로 보기](링크를_여기에_입력하세요)

> *이 링크는 쿠팡파트너스 제휴 링크로, 구매 시 일정 수수료가 북핏에 지급됩니다.*
`;

    const template = `---
meta_title: "[핵심키워드] 요약 | 핵심 인사이트 정리 [북핏]"
meta_description: "${book.title}의 주요 내용과 핵심 인사이트 정리. 지금 바로 확인하세요."
og_title: "${book.title} - 북핏 핵심 요약"
og_description: "[책의 핵심 메시지 한 줄]"
headline: "[독자 호기심을 자극하는 핵심 문장 1줄]"
slug: "bookfit-${book.sourceId}"
canonical_url: "https://bookfit.kr/bookfit-letter/bookfit-${book.sourceId}"
published_at: "${today}"
updated_at: "${today}"
category: "${book.categories?.[0] || '미분류'}"
tags: ["${book.title.split(' ')[0]}", "${book.authors?.[0] || ''}", "북핏추천"]
reading_time: "5분"
source: "aladin"
item_id: "${book.sourceId}"
isbn13: "${book.isbn13 || ''}"
---

# [핵심 문장 1줄]

안녕하세요 북핏입니다. [발행 시점의 시즌/맥락 한 줄 — 독자가 공감할 상황 묘사].
그럴 때 필요한 건 [해결책]이 아니라, [작은 전환점]일지도 모릅니다.

---

## 💡 핵심 요약

✅ [핵심 요약 1 — 한 단락, 2~3문장]

✅ [핵심 요약 2 — 한 단락, 2~3문장]

✅ [핵심 요약 3 — 한 단락, 2~3문장]

---

## 🎯 북핏 핵심 인사이트

**1) [인사이트 제목]**
[상세 설명 3~4문장. 개념 → 사례 → 의미 순으로 전개]
🤔 [리플렉션 질문 1개]

**2) [인사이트 제목]**
[상세 설명 3~4문장. 개념 → 사례 → 의미 순으로 전개]
🤔 [리플렉션 질문 1개]

**3) [인사이트 제목]**
[상세 설명 3~4문장. 개념 → 사례 → 의미 순으로 전개]
🤔 [리플렉션 질문 1개]

---

## 📅 적용 실험

**[기간]**
- 2주(14일)

**[규칙]**
- [실천 규칙 1]
- [실천 규칙 2]
- [실천 규칙 3]

**[목표]**
"[과정 목표 문장]"

---

## 🙋 추천하는 경우

- [추천 대상 1 — 상황 묘사형]
- [추천 대상 2 — 상황 묘사형]
- [추천 대상 3 — 상황 묘사형]

---

[👉 ${book.title} 지금 바로 보기](링크를_여기에_입력하세요)

> *이 링크는 쿠팡파트너스 제휴 링크로, 구매 시 일정 수수료가 북핏에 지급됩니다.*
`;
    return template;
}
