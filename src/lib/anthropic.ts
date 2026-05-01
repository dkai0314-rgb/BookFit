import Anthropic from "@anthropic-ai/sdk";
import { BookMeta } from './book-apis';
import { buildRecommendPrompt, RECOMMEND_TOOL } from './prompts/recommend';
import {
    buildBookFitLetterPrompt,
    BOOKFIT_LETTER_SYSTEM,
    BOOKFIT_LETTER_FALLBACK,
} from './prompts/bookfit-letter';
import type {
    RecommendMode,
    RecommendationRequest,
    RecommendedBookBase,
} from './prompts/types';

export type { RecommendMode, RecommendationRequest, RecommendedBookBase };

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

const RECOMMEND_MODEL = "claude-haiku-4-5";
const LETTER_MODEL = "claude-sonnet-4-6";

export async function getRecommendations(
    request: RecommendationRequest,
): Promise<RecommendedBookBase[]> {
    const prompt = buildRecommendPrompt(request);

    try {
        const response = await client.messages.create({
            model: RECOMMEND_MODEL,
            max_tokens: 4096,
            tools: [RECOMMEND_TOOL],
            tool_choice: { type: "tool", name: "submit_book_recommendations" },
            messages: [{ role: "user", content: prompt }],
        });

        const toolUse = response.content.find((block) => block.type === "tool_use");
        if (!toolUse || toolUse.type !== "tool_use") {
            console.error("Anthropic Recommendation Error: tool_use 블록 없음");
            return [];
        }

        const input = toolUse.input as { books: RecommendedBookBase[] };
        return input.books || [];
    } catch (error) {
        console.error("Anthropic Recommendation Error:", error);
        return [];
    }
}

export async function generateBookFitLetter(book: BookMeta): Promise<string> {
    try {
        const response = await client.messages.create({
            model: LETTER_MODEL,
            max_tokens: 4096,
            system: BOOKFIT_LETTER_SYSTEM,
            messages: [{ role: "user", content: buildBookFitLetterPrompt(book) }],
        });

        const textBlock = response.content.find((block) => block.type === "text");
        const text = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

        if (!text || !text.startsWith("---")) {
            console.error("Anthropic Letter Error: frontmatter 없는 응답");
            return BOOKFIT_LETTER_FALLBACK(book);
        }

        return text;
    } catch (error) {
        console.error("Anthropic Letter Error:", error);
        return BOOKFIT_LETTER_FALLBACK(book);
    }
}
