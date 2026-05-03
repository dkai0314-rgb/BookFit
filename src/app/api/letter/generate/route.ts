import { NextResponse } from 'next/server';
import {
    generateWeeklyLetterDraft,
    generateMonthlyPickDraft,
} from '@/lib/letter-generation';
import type { LetterKind } from '@/lib/firestore-models';
import type { BookMeta } from '@/lib/book-apis';

/**
 * POST /api/letter/generate
 *
 * weekly:       body { kind: 'weekly', book: BookMeta }
 * monthly_pick: body { kind: 'monthly_pick', theme: string }
 * special:      body { kind: 'special', book: BookMeta } (weekly와 동일 흐름, kind만 special)
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            kind?: LetterKind;
            book?: BookMeta;
            theme?: string;
        };
        const kind = body.kind ?? 'weekly';

        if (kind === 'monthly_pick') {
            const letter = await generateMonthlyPickDraft(body.theme ?? '');
            return NextResponse.json({ success: true, letter });
        }
        if (kind === 'weekly' || kind === 'special') {
            if (!body.book) {
                return NextResponse.json(
                    { error: 'weekly 회차 생성에는 book 메타데이터가 필요합니다.' },
                    { status: 400 },
                );
            }
            const letter = await generateWeeklyLetterDraft(body.book, kind);
            return NextResponse.json({ success: true, letter });
        }
        return NextResponse.json({ error: 'invalid kind' }, { status: 400 });
    } catch (error) {
        console.error('POST /api/letter/generate failed', error);
        const msg = error instanceof Error ? error.message : 'Failed to generate letter';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
