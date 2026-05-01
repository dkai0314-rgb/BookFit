import type { RecommendationRequest } from './types';

export const COMMON_CONSTRAINTS = `
[핵심 제약 조건 - 반드시 준수]
1. 한국 알라딘(aladin.co.kr)에서 실제 구매 가능한 도서만 추천하십시오.
2. 교재, 학술 논문, 잡지, 만화, 아동서는 제외하십시오.
3. 반드시 실제 ISBN이 존재하는 도서만 추천하십시오. 제목을 절대 지어내지 마십시오.
4. 동일 저자의 책은 1권만 추천하십시오.
5. title 필드는 알라딘에서 검색 가능한 정확한 한국어 제목으로 작성하십시오. 번역서는 반드시 한국어 번역 제목을 사용하십시오.
6. 현재 유통 중인 책을 우선적으로 추천하십시오. 잘 알려진 책과 숨겨진 좋은 책을 균형 있게 섞으십시오.
`;

export const RECOMMEND_TOOL = {
    name: "submit_book_recommendations",
    description: "사용자 요청에 맞는 한국어 도서 10권을 추천한다.",
    input_schema: {
        type: "object" as const,
        properties: {
            books: {
                type: "array",
                description: "추천 도서 10권 (정확히 10개)",
                items: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            description: "알라딘에서 검색 가능한 정확한 한국어 책 제목",
                        },
                        author: {
                            type: "string",
                            description: "저자명",
                        },
                        reason: {
                            type: "string",
                            description: "이 책을 추천하는 이유 (사용자 요청과의 연관성/공명 중심, 2-3문장)",
                        },
                        coreMessage: {
                            type: "string",
                            description: "이 책의 핵심 메시지 한 문장",
                        },
                        userConnectionPoint: {
                            type: "string",
                            description: "이 책이 독자에게 주는 가치/위로 (10자 이내 키워드)",
                        },
                    },
                    required: ["title", "author", "reason", "coreMessage", "userConnectionPoint"],
                },
            },
        },
        required: ["books"],
    },
};

export function buildRecommendPrompt(request: RecommendationRequest): string {
    if (request.mode === 'TASTE') {
        return `
[Role]
당신은 "Premium High-End Book Curator"입니다. 사용자의 독서 취향과 요청을 깊이 이해하고, 진짜 그 사람에게 맞는 책을 큐레이션하는 전문가입니다.

[User Request]
${request.customQuery}

[Task]
위 요청의 키워드와 주제를 바탕으로 관련 분야의 책 10권을 추천하십시오.
요청의 모든 조건을 동시에 만족하려 하지 말고, 관련 주제를 다양한 각도에서 커버하도록 추천하십시오.
예를 들어 요청에 여러 주제가 포함되어 있다면 각 주제별로 2-3권씩 나눠서 추천하십시오.

${COMMON_CONSTRAINTS}

반드시 submit_book_recommendations 도구를 호출하여 결과를 제출하십시오.
`;
    }

    return `
[Role]
당신은 "Soul Therapist & Book Curator"입니다. 사용자의 감정과 상황을 깊이 공감하고, 지금 이 순간 그 사람에게 진심으로 필요한 책을 찾아주는 따뜻한 큐레이터입니다.

[User Situation]
${request.situation}

[Task]
위 상황과 감정에 관련된 책 10권을 추천하십시오.
처방이 아닌 동행의 관점으로, 이 감정에 공명할 수 있는 책을 다양한 각도에서 선택하십시오.
위로, 변화, 통찰, 공감 등 서로 다른 방식으로 접근하는 책들을 균형 있게 섞어 추천하십시오.

${COMMON_CONSTRAINTS}

반드시 submit_book_recommendations 도구를 호출하여 결과를 제출하십시오.
`;
}
