
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";

    if (request.mode === 'TASTE') {
        prompt = `
        [Role]
        당신은 "Premium High-End Book Curator"입니다. 
        사용자의 지적 호기심과 구체적인 요구사항을 완벽하게 충족시켜줄 책을 3권 엄선해주세요.

        [User Request]
        - 사용자의 구체적인 요구사항(Natural Language): "${request.customQuery || "별도 요청 없음"}"
        - 관심 키워드(Tags): ${request.topics?.join(", ") || "없음"}
        - 선호 스타일: ${request.style || "상관없음"}

        [Task]
        1. **최우선 순위**: 사용자가 작성한 "구체적인 요구사항" 텍스트를 면밀히 분석하여, 단순한 주제 매칭을 넘어 사용자의 '진짜 의도(난이도, 목적, 깊이)'를 파악하십시오.
        2. 해당 의도에 가장 부합하는 고품질의 도서 3권을 선정하십시오. (뻔한 베스트셀러보다는 신뢰할 수 있는 명저나 숨겨진 양서를 발굴하십시오)
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
        2. 단순한 키워드 매칭이 아니라, 사용자의 구체적인 상황에 공감하고 실질적인 위로를 줄 수 있는 책 3권을 선정하십시오.
        3. 뻔한 자기계발서보다는, 마음을 어루만지는 에세이, 심리학, 혹은 깊이 있는 인문학 도서를 우선 고려하십시오.
        4. "처방"이 아닌 "동행"의 언어로 추천 이유를 작성하십시오. (~해요체)

        [Output Format]
        JSON Array 형태로 다음 필드를 포함해야 합니다:
        - title: 책 제목 (정확하게)
        - author: 저자 이름
        - coreMessage: 이 책이 전하는 따뜻한 메시지 한 문장
        - reason: 추천 이유 (2~3문장, 기대 효과와 위로의 메시지 중심, ~해요체)
        - userConnectionPoint: 사용자의 감정/상태와 연결되는 포인트 (예: 불안을 잠재우는 문장)

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
