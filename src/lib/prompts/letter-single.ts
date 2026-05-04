import { z } from 'zod';
import type { BookMeta } from '../book-apis';

export const singleLetterSchema = z.object({
    // SEO
    metaTitle: z.string().describe('SEO title 40-60자. "[책제목] 서평·요약 | 북핏레터" 형식'),
    metaDescription: z.string().describe('SEO description 110-140자. 독자 베네핏 중심'),
    ogTitle: z.string().describe('SNS 공유 제목. 책 제목 + 핵심 메시지 한 줄'),
    ogDescription: z.string().describe('SNS 공유 설명 1문장'),
    tags: z.array(z.string()).describe('관련 키워드 4-6개'),

    // Core hook
    headline: z.string().describe('웹 H1 · 이메일 제목 · 카드01 타이틀. 15자 이내. 독자 페인포인트 건드리는 강한 훅. 책 제목 그대로 금지'),
    subheadline: z.string().describe('headline을 보조하는 2-3문장. 웹 리드문 · 이메일 프리뷰 · 카드01 본문'),

    // Editor voice
    curatorNote: z.string().describe('편집자 육성. "왜 지금 이 책인가" 4-6문장. "~해요" 톤. 독자가 "맞아 나 지금 딱 이런 상태야" 느끼게. 마지막 문장: 이 책이 그 상황을 어떻게 연결하는지'),
    keyQuote: z.string().describe('책에서 가장 인상 깊은 문장 1개. 카드02 임팩트 슬라이드 주인공'),

    // Deep dive (단권 특화)
    insights: z.array(z.object({
        title: z.string().describe('인사이트 제목 (10자 이내)'),
        body: z.string().describe('개념→사례→의미 흐름으로 3-4문장. 독자 삶에 직접 연결'),
        reflection: z.string().describe('독자 스스로에게 던질 질문 1개'),
    })).length(3).describe('핵심 인사이트 3개. 카드03·04·05 각 1슬라이드'),

    // Action
    twoWeekChallenge: z.object({
        rules: z.array(z.string()).length(3).describe('책에서 바로 꺼낼 수 있는 행동 3개 (1문장씩)'),
        goal: z.string().describe('결과가 아닌 과정 목표 1문장'),
    }).describe('2주 적용 실험. 카드06 하단'),

    // Targeting
    recommendation: z.array(z.string()).length(3).describe('이런 분께 특히 추천해요. 구체적 상황 묘사형 3가지. 카드06'),
    afterReading: z.array(z.string()).length(3).describe('읽고 나면 달라지는 것 3가지. 관점·감각·행동 변화 중심'),

    // Social
    instagramCaption: z.string().describe('인스타 캡션. 따뜻한 톤 + 이모지 + 해시태그 5-8개'),
});

export type SingleLetterOutput = z.infer<typeof singleLetterSchema>;

export function buildSingleLetterPrompt(book: BookMeta): string {
    return `당신은 "북핏레터(BookFit Letter)"의 수석 에디터입니다.
독자가 레터를 읽고 "이 책, 나한테 꼭 필요한 것 같다"고 느끼게 만드는 것이 핵심 미션입니다.

**책 정보**
- 제목: ${book.title}
- 저자: ${book.authors?.join(', ') || '정보 없음'}
- 출판사: ${book.publisher || '정보 없음'}
- 분야: ${book.categories?.join(', ') || '정보 없음'}
- 책 소개: ${book.sourceText || '(정보 없음)'}

**작성 원칙**
- 단순 줄거리 요약이나 책 소개 금지. 큐레이터가 실제로 읽은 사람처럼 쓸 것.
- 독자가 "맞아, 나 지금 딱 이런 상태야"라고 느끼도록 상황을 구체적으로 묘사.
- insights: 개념 설명보다 독자 삶에 직결되는 관점·행동 변화를 담을 것.
- keyQuote: 책의 핵심을 압축하는 가장 강한 문장 선택.
- recommendation: 추상적("성장하고 싶은 사람") 금지. 상황 묘사형("회의에서 말은 맞는데 아무도 안 따르는 것 같은 사람")으로.
- 없는 사실 금지. 주어진 책 소개 정보 기반으로 전개.
- 모든 출력은 한국어로.`.trim();
}
