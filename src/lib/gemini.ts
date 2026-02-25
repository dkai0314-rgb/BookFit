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
    customQuery?: string; // New: Natural language query for Taste
    // Mind inputs
    emotion?: string[];
    situation?: string;
}

export interface RecommendedBookBase {
    title: string;
    author: string;
    reason: string;
    coreMessage: string;
    userConnectionPoint: string;
}

export async function getRecommendations(request: RecommendationRequest): Promise<RecommendedBookBase[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    if (request.mode === 'TASTE') {
        prompt = `
        [Role]
        당신은 "Premium High-End Book Curator"입니다. 
        사용자의 지적 호기심과 구체적인 요구사항을 완벽하게 충족시켜줄 책을 5권 엄선해주세요. (이 중 검증된 상위 3권만 사용자에게 보여줄 예정입니다)

        [User Request]
        - 사용자의 구체적인 요구사항(Natural Language): "${request.customQuery || "별도 요청 없음"}"
        - 관심 키워드(Tags): ${request.topics?.join(", ") || "없음"}
        - 선호 스타일: ${request.style || "상관없음"}

        [Task]
        1. **최우선 순위**: 사용자가 작성한 "구체적인 요구사항" 텍스트를 면밀히 분석하여, 단순한 주제 매칭을 넘어 사용자의 '진짜 의도(난이도, 목적, 깊이)'를 파악하십시오.
        2. 해당 의도에 가장 부합하는 고품질의 도서 5권을 선정하십시오. (반드시 실제로 출판된, ISBN이 존재하는 책이어야 합니다. 없는 책이나 가상의 제목을 지어내지 마십시오.)
        3. 각 책에 대해 구체적이고 논리적인 추천 이유를 작성하십시오. (추상적인 칭찬 금지)

        [Output Format]
        JSON Array 형태로 다음 필드를 포함해야 합니다:
        - title: 책 제목 (정확하게)
        - author: 저자 이름
        - coreMessage: 이 책의 핵심 메시지 한 문장
        - reason: 추천 이유 (2~3문장, 사용자의 관심사/목적과 구체적으로 연결)
        - userConnectionPoint: 사용자의 입력(키워드/목적)과 연결되는 핵심 포인트 (단답형)

        * 응답은 오직 JSON 데이터만 출력하십시오. 마크다운 포맷팅 없이.
        `;
    } else {
        prompt = `
        [Role]
        당신은 "Soul Therapist & Book Curator"입니다.
        사용자의 감정과 상황을 깊이 공감하고, 책 속의 문장으로 위로와 해답을 건네주세요.

        [User Emotion/Situation]
        - 사용자가 직접 작성한 상황/고민: "${request.situation || "별도 설명 없음"}"
        - 참고용 감정 키워드: ${request.emotion?.join(", ") || "없음"}

        [Task]
        1. **최우선 순위**: 사용자가 작성한 "상화/고민" 텍스트를 깊이 읽고, 그 안에 숨겨진 감정과 뉘앙스, 결핍을 분석하십시오. (키워드는 단순 참고용입니다)
        2. 단순한 키워드 매칭이 아니라, 사용자의 구체적인 상황에 공감하고 실질적인 위로를 줄 수 있는 책 5권을 선정하십시오. (반드시 실제로 출판된, ISBN이 존재하는 책이어야 합니다. 없는 책이나 가상의 제목을 지어내지 마십시오.)
        3. 뻔한 자기계발서보다는, 마음을 어루만지는 에세이, 심리학, 혹은 깊이 있는 인문학 도서를 우선 고려하십시오.
        4. "처방"이 아닌 "동행"의 언어로 추천 이유를 작성하십시오. (~해요체)

        [Output Format]
        JSON Array 형태로 다음 필드를 포함해야 합니다:
        - title: 책 제목 (정확하게)
        - author: 저자 이름
        - coreMessage: 이 책이 전하는 따뜻한 메시지 한 문장
        - reason: 추천 이유 (2~3문장, 기대 효과와 위로의 메시지 중심, ~해요체)
        - userConnectionPoint: 사용자의 감정/상태과 연결되는 포인트 (예: 불안을 잠재우는 문장)

        * 응답은 오직 JSON 데이터만 출력하십시오. 마크다운 포맷팅 없이.
        `;
    }

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Remove markdown formatting if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Recommendation Error:", error);
        return [];
    }
}

export async function generateBookFitLetter(book: BookMeta): Promise<string> {
    // 오늘 날짜 구하기 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 기본 제목 (추후 수정 가능)
    const baseTitle = `${book.title} 요약: 출간 배경과 핵심 특징`;
    const baseDesc = `${book.title}의 주요 내용과 핵심 정리입니다.`;

    const template = `---
meta_title: "${baseTitle}"
meta_description: "${baseDesc}"
slug: "bookfit-${book.sourceId}"
published_at: "${today}"
source: "aladin"
item_id: "${book.sourceId}"
isbn13: "${book.isbn13 || ''}"
---

# ${book.title} 요약

<!--META_INFO_START-->
## 📖 책 한눈에 보기
| 항목 | 내용 |
|---|---|
| 제목 | ${book.title} |
| 저자 | ${book.authors?.join(', ') || '(정보 확인 필요)'} |
| 분류 | ${book.categories?.join(', ') || '(정보 확인 필요)'} |
<!--META_INFO_END-->

## 💡 핵심 요약
- [도서의 가장 중요한 가치나 핵심 메시지 1]
- [핵심 메시지 2]
- [핵심 메시지 3]

---

## 🎯 북핏 핵심 인사이트
### 1) [아이디어 1 소제목 - 핵심을 찌르는 한 문장]
> [아이디어 1에 대한 상세 설명 및 근거. 3~4문장 분량으로 부드럽게 설명]

### 2) [아이디어 2 소제목]
> [아이디어 2 상세 설명]

### 3) [아이디어 3 소제목]
> [아이디어 3 상세 설명]

---

## 📅 적용 실험
[기간]: 7일

[규칙]: [책 내용에 맞는 구체적이고 실천 가능한 일상 행동 규칙 제안 (예: 매일 10분 명상하기)]
예: [구체적인 예시 1~2개]

[목표]: [7일 뒤 달성할 목표 제안]
정리 문장(예시): "[다짐하는 문장 한 줄 작성]"

---

## 🙋‍♀️ 추천하는 경우
- [이런 분들에게 추천해요 1]
- [이런 분들에게 추천해요 2]
- [이런 분들에게 추천해요 3]

---

## 🎁 감사합니다
지금 이 책이 필요하다면, 아래 링크로 바로 이동해 구매를 이어가세요!

[👉 이 책 확인하고 내 삶에 적용해보기](링크를_여기에_입력하세요)
`;

    // 에디터 로직을 우회하여 AI 호츌 없이 템플릿 반환
    return template;
}
