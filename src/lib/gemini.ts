import { GoogleGenerativeAI } from "@google/generative-ai";
import { BookMeta } from './book-apis';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export type RecommendMode = 'TASTE' | 'MIND';

export interface RecommendationRequest {
    mode: RecommendMode;
    topics?: string[];
    style?: string;
    customQuery?: string;
    purpose?: string;
    readingLevel?: string;
    emotion?: string[];
    situation?: string;
    wantTo?: string;
    readingMood?: string;
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
`;

export async function getRecommendations(request: RecommendationRequest): Promise<RecommendedBookBase[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let prompt = "";

    if (request.mode === 'TASTE') {
        prompt = `
[Role]
당신은 "Premium High-End Book Curator"입니다.
...
${COMMON_CONSTRAINTS}
...
`;
    } else {
        prompt = `
[Role]
당신은 "Soul Therapist & Book Curator"입니다.
...
${COMMON_CONSTRAINTS}
...
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
1. headline 생성 규칙:
   - 책 제목을 그대로 사용하지 마십시오.
   - 독자의 페인포인트(Pain-point)를 건드리거나 해결책을 제시하는 강렬한 한 문장으로 작성하십시오.
   - 15자 이내(공백 포함) 권장, 최대 20자를 넘지 마십시오.
   - 질문형(?), 선언형(!), 또는 단정적인 문체를 사용하십시오.
   - 예: "왜 당신만 제자리걸음일까?", "퇴사 전 반드시 읽어야 할 책", "부자들의 1% 습관의 비밀"

2. tags 생성 규칙:
   - 책 제목을 통째로 넣는 방식 대신 키워드 단위로 3~5개 생성하십시오.
   - 예: ["사피엔스", "인류학", "유발하라리", "역사", "북핏추천"]

3. 모든 내용은 한국어로 작성하며, 마크다운(Markdown)과 YAML Frontmatter 형식을 완벽히 준수하십시오.

[Book Info]
- 제목: ${book.title}
- 저자: ${book.authors?.join(', ') || '정보 없음'}
- 분야: ${book.categories?.join(', ') || '정보 없음'}
- 주요 내용: ${book.description || '정보 없음'}

[Output Structure]
---
meta_title: "${baseTitle}"
meta_description: "${baseDesc}"
og_title: "${book.title} - 북핏 핵심 요약"
og_description: "${book.title}의 주요 내용. 북핏 핵심 요약."
headline: "여기에 생성한 강렬한 핵심 문장을 입력 (15자 이내)"
slug: "bookfit-${book.sourceId}"
canonical_url: "https://bookfit.kr/bookfit-letter/bookfit-${book.sourceId}"
published_at: "${today}"
updated_at: "${today}"
category: "${book.categories?.[0] || '미분류'}"
tags: ["키워드1", "키워드2", "북핏추천"]
reading_time: "5분"
source: "aladin"
item_id: "${book.sourceId}"
isbn13: "${book.isbn13 || ''}"
---

# ${book.title}

> "이 책의 핵심을 관통하는 강렬한 한 문장"

[...이후 생략...]
`;

    const template = `---
meta_title: "${baseTitle}"
meta_description: "${baseDesc}"
og_title: "${book.title} - 북핏 핵심 요약"
og_description: "${book.title}의 주요 내용. 북핏 핵심 요약."
headline: "핵심 문장 한 줄 (작성 필요)"
slug: "bookfit-${book.sourceId}"
canonical_url: "https://bookfit.kr/bookfit-letter/bookfit-${book.sourceId}"
published_at: "${today}"
updated_at: "${today}"
category: "${book.categories?.[0] || '미분류'}"
tags: ["${book.title.split(' ')[0]}", "북핏추천"]
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
