import { NextResponse } from 'next/server';
import {
    listThemes,
    createTheme,
    type LetterKind,
} from '@/lib/firestore-models';

const ALLOWED_KIND = new Set<LetterKind>(['weekly', 'monthly_pick', 'special']);

export async function GET() {
    try {
        const all = await listThemes();
        return NextResponse.json({ themes: all });
    } catch (error) {
        console.error('GET /api/admin/themes failed', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            theme?: string;
            kind?: string;
            priority?: number;
            note?: string | null;
        };
        if (!body.theme || !body.theme.trim()) {
            return NextResponse.json({ error: '테마 텍스트가 필요합니다.' }, { status: 400 });
        }
        const kind = (body.kind ?? 'monthly_pick') as LetterKind;
        if (!ALLOWED_KIND.has(kind)) {
            return NextResponse.json({ error: 'invalid kind' }, { status: 400 });
        }
        const theme = await createTheme({
            theme: body.theme.trim(),
            kind,
            priority: typeof body.priority === 'number' ? body.priority : 100,
            note: body.note ?? null,
        });
        return NextResponse.json({ theme });
    } catch (error) {
        console.error('POST /api/admin/themes failed', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
        );
    }
}
