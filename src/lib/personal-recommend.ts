import Anthropic from '@anthropic-ai/sdk';
import {
    getPersonalRecommendCache,
    upsertPersonalRecommendCache,
} from './firestore-models';
import { createHash } from 'crypto';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const MODEL = 'claude-haiku-4-5';
const CACHE_TTL_HOURS = 24;
export const MIN_BOOKS_FOR_PERSONAL_RECOMMEND = 5;

export type ShelfBook = {
    bookId: string;
    title: string;
    author: string;
    category: string | null;
    status: string;
};

export type PersonalRecommendation = {
    title: string;
    author: string;
    reason: string;
};

const PERSONAL_TOOL = {
    name: 'submit_personal_recommendations',
    description: '사용자의 독서 패턴을 분석해 다음에 읽을 책 5권을 추천한다.',
    input_schema: {
        type: 'object' as const,
        properties: {
            books: {
                type: 'array',
                description: '추천 도서 5권 (정확히 5개)',
                items: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', description: '한국어 책 제목' },
                        author: { type: 'string', description: '저자명' },
                        reason: {
                            type: 'string',
                            description: '이 책을 추천하는 이유 (사용자 독서 패턴과의 연관성, 2-3문장)',
                        },
                    },
                    required: ['title', 'author', 'reason'],
                },
            },
        },
        required: ['books'],
    },
};

export function computeFingerprint(books: ShelfBook[]): string {
    const sorted = [...books]
        .map((b) => `${b.bookId}:${b.status}`)
        .sort()
        .join('|');
    return createHash('sha256').update(sorted).digest('hex').slice(0, 16);
}

function buildPrompt(books: ShelfBook[]): string {
    const lines = books
        .map((b, i) => `${i + 1}. ${b.title} - ${b.author} [${b.category || '미분류'}] (${b.status})`)
        .join('\n');

    return `
[Role]
당신은 "Personal Reading Curator"입니다. 한 독자의 책장을 보고, 그 사람의 다음 한 권을 정밀하게 추천하는 큐레이터입니다.

[User Bookshelf]
${lines}

[Task]
이 독자가 다음에 읽으면 좋을 책 5권을 추천하십시오.
- 위 책장의 패턴(주제·장르·관심사·완독률)을 읽어내고, 자연스러운 다음 단계가 될 책을 고르십시오.
- 같은 주제를 깊게 파고드는 책 + 인접 주제로 시야를 넓히는 책을 균형있게 섞으십시오.
- 책장에 있는 책은 추천하지 마십시오.
- 모두 한국 알라딘에서 구매 가능한 한국어 책이어야 합니다.

반드시 submit_personal_recommendations 도구를 호출하여 결과를 제출하십시오.
`.trim();
}

async function callClaude(books: ShelfBook[]): Promise<PersonalRecommendation[]> {
    const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        tools: [PERSONAL_TOOL],
        tool_choice: { type: 'tool', name: 'submit_personal_recommendations' },
        messages: [{ role: 'user', content: buildPrompt(books) }],
    });

    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') return [];
    const input = toolUse.input as { books?: PersonalRecommendation[] };
    return input.books || [];
}

export async function getPersonalRecommendations(
    userId: string,
    books: ShelfBook[],
): Promise<{ recommendations: PersonalRecommendation[]; cached: boolean; eligible: boolean }> {
    if (books.length < MIN_BOOKS_FOR_PERSONAL_RECOMMEND) {
        return { recommendations: [], cached: false, eligible: false };
    }

    const fingerprint = computeFingerprint(books);
    const now = new Date();

    const existing = await getPersonalRecommendCache(userId, fingerprint);

    if (existing && existing.expiresAt > now) {
        try {
            const recs = JSON.parse(existing.payload) as PersonalRecommendation[];
            return { recommendations: recs, cached: true, eligible: true };
        } catch {
            // fallthrough to regenerate
        }
    }

    const recommendations = await callClaude(books);
    const expiresAt = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000);
    const payload = JSON.stringify(recommendations);

    await upsertPersonalRecommendCache(userId, fingerprint, payload, expiresAt);

    return { recommendations, cached: false, eligible: true };
}
