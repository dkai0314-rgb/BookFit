import { NextResponse } from 'next/server';
import {
    updateTheme,
    deleteTheme,
    type LetterKind,
} from '@/lib/firestore-models';

const ALLOWED_KIND = new Set<LetterKind>(['weekly', 'monthly_pick', 'special']);

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = (await request.json()) as Record<string, unknown>;
        const data: Record<string, unknown> = {};

        if (typeof body.theme === 'string') data.theme = body.theme.trim();
        if (typeof body.kind === 'string' && ALLOWED_KIND.has(body.kind as LetterKind)) {
            data.kind = body.kind;
        }
        if (typeof body.priority === 'number') data.priority = body.priority;
        if (typeof body.note === 'string' || body.note === null) data.note = body.note;
        if (typeof body.used === 'boolean') data.used = body.used;

        await updateTheme(id, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH /api/admin/themes/[id] failed', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { id } = await params;
        await deleteTheme(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/admin/themes/[id] failed', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
        );
    }
}
