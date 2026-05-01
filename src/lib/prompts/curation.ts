import { z } from 'zod';

export const curationSchema = z.object({
    title: z.string().describe("A catchy, emotional title for the book collection"),
    description: z.string().describe("A warm, empathetic introduction to the collection (approx. 2-3 sentences)"),
    books: z.array(z.object({
        title: z.string(),
        reason: z.string().describe("Why this book fits the theme (1 sentence)"),
    })).length(3),
    instaCaption: z.string().describe("An engaging Instagram caption with emojis and hashtags"),
});

export type CurationOutput = z.infer<typeof curationSchema>;

export function buildCurationPrompt(theme: string): string {
    return `
You are an expert book curator for "BookFit", an AI book prescription service.
Create a curated collection of 3 books for the following theme: "${theme}".

The tone should be:
- Empathetic, warm, and professional.
- Like a close friend recommending books.
- Korean language only.

For the Instagram caption:
- Use line breaks for readability.
- Include hashtags like #북핏 #BookFit #책추천 #[ThemeKeywords].
- Use emojis relevant to the theme.
`.trim();
}
