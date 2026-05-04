import { z } from 'zod';

export const monthlyPickSchema = z.object({
    // SEO
    metaTitle: z.string().describe('SEO title 40-60자'),
    metaDescription: z.string().describe('SEO description 110-140자'),
    ogTitle: z.string().describe('SNS 공유 제목'),
    ogDescription: z.string().describe('SNS 공유 설명 1문장'),
    tags: z.array(z.string()).describe('관련 키워드 4-6개'),

    // Core hook
    headline: z.string().describe('15자 이내 강한 훅. 테마의 본질을 건드리는 한 문장'),
    subheadline: z.string().describe('2-3문장 부제. 왜 지금 이 테마인지'),

    // Editor voice
    curatorNote: z.string().describe('편집자 육성 4-6문장. "~해요" 톤. 왜 지금 이 세 권인지. 마지막 문장: 세 권을 함께 읽으면 무엇이 달라지는지'),

    // 3-book picks
    books: z.array(z.object({
        title: z.string().describe('실제 한국 시장 도서 제목 (알라딘 검색 가능)'),
        author: z.string().describe('저자명'),
        forWhom: z.string().describe('이런 분께 특히. 구체적 상황 묘사 1-2문장'),
        curatorPick: z.string().describe('큐레이터 감상+핵심 메시지 3-4문장. 줄거리 요약 금지'),
        afterReading: z.string().describe('읽고 나면 달라지는 것 1-2문장'),
        reflection: z.string().describe('독자 리플렉션 질문 1개'),
    })).length(3),

    // Synthesis
    themeConclusion: z.string().describe('세 권을 함께 읽는 맥락 연결 2-3문장. 독자가 책 펼치고 싶어지는 톤'),

    // Targeting
    recommendation: z.array(z.string()).length(3).describe('이 테마 레터를 봐야 할 상황 묘사형 3가지'),
    afterReading: z.array(z.string()).length(3).describe('이 세 권을 읽고 나면 달라지는 것 3가지'),

    // Social
    instagramCaption: z.string().describe('인스타 캡션. 따뜻한 톤 + 이모지 + 해시태그 5-8개'),
});

export type MonthlyPickOutput = z.infer<typeof monthlyPickSchema>;

export function buildMonthlyPickPrompt(theme: string): string {
    return `당신은 "북핏레터(BookFit Letter)"의 수석 에디터입니다.
독자가 레터를 읽고 "이 책들, 나한테 꼭 필요한 것 같다"고 느끼게 만드는 것이 핵심 미션입니다.

테마: "${theme}"

**작성 원칙**
- 단순 책 소개 금지. 편집자가 실제로 읽은 사람처럼 쓸 것.
- 각 책의 forWhom: 추상적("성장하고 싶은 사람") 금지. 구체적 상황 묘사.
- curatorPick: 책의 핵심 메시지를 테마와 연결해 큐레이터 시각으로.
- afterReading: 독자 삶에 실제로 생기는 변화·관점·행동 중심.
- books: 실제 한국 서점(알라딘)에서 검색 가능한 도서만.
- 모든 출력은 한국어로.`.trim();
}
