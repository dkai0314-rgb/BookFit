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
            "본문 마크다운. 책 3권 각각의 '## N. {책 제목} - {저자}' 섹션 + 각 4-6문장의 큐레이터 시각(왜 이 테마에 이 책인지 + 핵심 메시지) + 끝에 마무리 단락. 책 카드는 별도 렌더되므로 본문에 책 cover/구매 링크 마크다운은 넣지 마세요.",
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
You are the senior editor of "북핏레터(BookFit Letter)", a weekly book magazine.
A user has provided a theme. Generate a "monthly_pick" letter — a curated 3-book issue ready to publish.

Theme: "${theme}"

Output requirements:
- All output MUST be in Korean.
- Books must be real, published Korean-market titles (preferably searchable on Aladin).
- 'title' is the issue title (catchphrase, 12-24자). 'headline' is the body H1 (강한 한 문장, 15자 이내).
- 'description' is the card/OG hook (2-3 sentences).
- 'curatorNote' is the deeper opening note (4-6 sentences, "~해요" 톤, "왜 지금 이 테마인가" 관점).
- 'contentMarkdown' is the magazine body. Each book gets a "## N. {책 제목} - {저자}" section with 4-6 sentences explaining
  WHY this book serves the theme, the book's key message, and a reflection question for the reader.
  Wrap up with a short closing paragraph. Do NOT include book cover images or purchase links in the markdown — those are rendered separately.
- 'seoTitle' / 'seoDesc' are search-engine and OG card facing — concise, keyword-rich.
- 'instaCaption' should be warm, with light emoji use, suitable for Instagram audiences.
`.trim();
}
