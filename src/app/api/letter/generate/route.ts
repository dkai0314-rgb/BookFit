import { NextResponse } from 'next/server';
import {
    generateSingleLetterDraft,
    generateThemeLetterDraft,
} from '@/lib/letter-generation';
import type { LetterKind } from '@/lib/firestore-models';
import type { BookMeta } from '@/lib/book-apis';

/**
 * POST /api/letter/generate
 *
 * 기본 흐름: body { theme: string } → 테마 기반 3권 포맷(generateThemeLetterDraft) 사용.
 * 단권: body { kind: 'weekly' | 'special', book: BookMeta } → generateSingleLetterDraft 호출.
 * kind 기본값: 'letter'
 *
 * 하위호환 별칭: generateWeeklyLetterDraft / generateMonthlyPickDraft는 letter-generation.ts에서 재export됨.
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            kind?: LetterKind;
            book?: BookMeta;
            theme?: string;
        };
        const kind = body.kind ?? 'letter';

        if (kind === 'weekly' || kind === 'special') {
            if (!body.book) {
                return NextResponse.json(
                    { error: '단권 회차 생성에는 book 메타데이터가 필요합니다.' },
                    { status: 400 },
                );
            }
            const letter = await generateSingleLetterDraft(body.book);
            return NextResponse.json({ success: true, letter });
        }

        // 'letter' | 'monthly_pick' | 기타 → 테마 기반 3권 포맷
        const letter = await generateThemeLetterDraft(body.theme ?? '');
        return NextResponse.json({ success: true, letter });
    } catch (error) {
        console.error('POST /api/letter/generate failed', error);
        const msg = error instanceof Error ? error.message : 'Failed to generate letter';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
