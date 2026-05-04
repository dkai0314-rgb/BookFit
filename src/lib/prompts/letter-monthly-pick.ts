import { z } from 'zod';

export const monthlyPickSchema = z.object({
    title: z.string().describe("회차 제목 (Korean, 12-24자, 호기심을 끄는 한 문장)"),
    headline: z.string().describe("본문 H1 — 15자 이내의 강한 한 문장. 'title'과 다르게 페인포인트를 건드림"),
    description: z.string().describe("이번 회차의 짧은 도입 (Korean, 2-3 sentences). 카드 미리보기와 OG 설명용."),
    curatorNote: z.string().describe("큐레이터 도입 단락 (Korean, 4-6 sentences, '~해요' 톤). '왜 지금 이 테마인가' 관점."),
    seoTitle: z.string().describe("SEO meta title (Korean, 40-60자, 테마 키워드 + '북핏레터')"),
    seoDesc: z.string().describe("SEO meta description (Korean, 110-140자)"),
    contentMarkdown: z
        .string()
        .describe(
            "본문 마크다운. 책 3권 각각 '## N. {책 제목} — {저자}' 섹션으로 구성. 각 섹션에는: (1) **이런 분께 추천해요**: 구체적 독자 상황 1~2문장, (2) 큐레이터 감상+핵심 메시지 3~4문장 (줄거리 요약 X, 큐레이터 해석·감상), (3) **읽고 나면**: 독자에게 생기는 변화·관점 1~2문장, (4) 🤔 오늘의 질문 리플렉션 1개. 마지막에 세 권을 연결하는 마무리 단락. 책 커버·구매 링크 마크다운은 넣지 마세요 (별도 렌더됨).",
        ),
    instaCaption: z.string().describe("Instagram 캡션 (Korean, 줄바꿈 + 이모지 + 5~8 해시태그)"),
    books: z
        .array(
            z.object({
                title: z.string().describe("실제 한국어 책 제목 (알라딘 검색 가능)"),
                reason: z.string().describe("이 회차에 이 책을 고른 이유 1문장"),
            }),
        )
        .length(3),
});

export type MonthlyPickOutput = z.infer<typeof monthlyPickSchema>;

export function buildMonthlyPickPrompt(theme: string): string {
    return `
당신은 "북핏레터(BookFit Letter)"의 수석 에디터입니다.
독자가 레터를 읽고 나서 "이 책, 나한테 꼭 필요한 것 같다"고 느끼게 만드는 것이 핵심 미션입니다.

테마: "${theme}"

**전체 방향**
단순한 책 소개나 줄거리 요약이 아닙니다. 큐레이터가 실제로 읽어본 사람처럼 씁니다.
- 독자가 지금 어떤 상황에서 이 책이 필요한지를 구체적으로 묘사하세요.
- "이런 분께 특히 추천합니다"처럼 타겟 독자를 명확히 짚어주세요.
- 이 책을 읽고 나면 무엇이 달라지는지, 어떤 감각·관점·행동이 생기는지를 전달하세요.
- 책에 대한 단순 설명보다 큐레이터의 시각과 감상이 있어야 합니다.

**출력 필드 지침**

'title': 회차 제목 (12-24자). 독자의 상황을 건드리는 카피. 예: "지쳐있는 밤, 그래도 책을 집어든 당신에게"

'headline': 본문 H1 (15자 이내). 강한 한 문장. title을 그대로 쓰지 말 것.

'description': 카드 미리보기용 훅 (2-3문장). "왜 지금 이 테마인가"를 독자 공감 언어로.

'curatorNote': 큐레이터 도입 단락 (4-6문장, "~해요" 톤).
  - 왜 지금 이 테마를 골랐는지 편집자의 진심을 담을 것.
  - 독자가 "맞아, 나 지금 딱 이런 상태야"라고 느낄 수 있어야 함.
  - 이 세 권을 함께 읽으면 무엇이 달라지는지 한 문장으로 마무리.

'contentMarkdown': 본문 마크다운. 책 3권 각각 아래 구조로 작성:
  ## N. {책 제목} — {저자}

  **이런 분께 추천해요**: 이 책이 필요한 독자의 구체적인 상황 1~2문장. (예: "이직을 앞두고 자신의 강점이 뭔지 모르겠다는 분께")

  [큐레이터 감상 + 핵심 메시지] 이 책을 읽으면서 어떤 생각이 들었는지, 책이 전하는 핵심 메시지가 왜 지금의 독자에게 유효한지를 3~4문장으로. 줄거리 요약이 아니라 큐레이터의 해석·감상.

  **읽고 나면**: 이 책을 읽은 뒤 독자에게 생기는 변화·관점·행동을 1~2문장으로. (예: "막연하게 느꼈던 번아웃의 정체를 언어로 표현할 수 있게 됩니다.")

  > 🤔 **오늘의 질문**: 독자가 스스로에게 던져볼 리플렉션 질문 1개.

  마지막에 세 권을 함께 읽는 맥락을 연결하는 마무리 단락 (3~4문장). 이 레터를 읽은 독자가 책을 펼치고 싶어지는 톤.
  책 커버 이미지·구매 링크 마크다운은 넣지 마세요 (별도 렌더됨).

'seoTitle' / 'seoDesc': 검색·OG용. 테마 키워드 + 독자 베네핏 중심.

'instaCaption': 따뜻하고 가볍게. 이모지 적당히. 해시태그 5~8개.

모든 출력은 반드시 한국어로 작성하세요.
실제 한국 시장에서 유통·검색되는 책을 골라주세요 (알라딘 검색 가능).
`.trim();
}
