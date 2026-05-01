import { z } from 'zod';

export const curationSchema = z.object({
    title: z.string().describe("A catchy, emotional title for the book collection (Korean, 8-20 chars)"),
    description: z.string().describe("A warm, empathetic 2-3 sentence introduction to the collection (Korean)"),
    curatorNote: z.string().describe("A deeper 4-6 sentence curator's note explaining why this theme matters now (Korean, 친근한 '~해요' tone)"),
    seoTitle: z.string().describe("SEO meta title (Korean, 40-60 chars, include theme keyword + '북핏')"),
    seoDesc: z.string().describe("SEO meta description (Korean, 110-140 chars, action-oriented)"),
    instaCaption: z.string().describe("An engaging Instagram caption with line breaks, emojis, and 5-8 hashtags (Korean)"),
    books: z.array(z.object({
        title: z.string().describe("Exact, real Korean book title"),
        reason: z.string().describe("2 sentences on why this book fits the theme (Korean)"),
    })).length(3),
});

export type CurationOutput = z.infer<typeof curationSchema>;

export function buildCurationPrompt(theme: string): string {
    return `
You are an expert book curator for "BookFit", an AI book magazine.
A user has provided a theme. Generate a 3-book curation entry that captures the essence of the theme and is ready for publication as a magazine article.

Theme: "${theme}"

Output requirements:
- All output MUST be in Korean.
- Books must be real, published Korean-market titles (preferably searchable on Aladin).
- 'description' is a short hook (2-3 sentences). 'curatorNote' is a deeper 4-6 sentence note ("왜 지금 이 테마인가" 관점, "~해요" 톤).
- 'reason' for each book: 2 sentences on how this specific book serves the theme emotionally or practically.
- 'seoTitle' / 'seoDesc' are search-engine and OG card facing — concise, keyword-rich.
- 'instaCaption' should be warm, with light emoji use, suitable for Instagram audiences.
`.trim();
}

export function slugifyKo(title: string): string {
    return title
        .normalize('NFKC')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w가-힣ㄱ-ㅎㅏ-ㅣ\-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);
}

export function shortHash(): string {
    return Math.random().toString(36).slice(2, 6);
}

export function buildCurationSlug(title: string): string {
    const base = slugifyKo(title) || 'curation';
    return `${base}-${shortHash()}`;
}

export function estimateReadingTime(...sources: (string | null | undefined)[]): number {
    const text = sources.filter(Boolean).join(' ');
    const charCount = text.length;
    return Math.max(1, Math.round(charCount / 400));
}
