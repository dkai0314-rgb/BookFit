import { NextResponse } from 'next/server';
import {
    listLetters,
    upsertLetter,
    type LetterKind,
} from '@/lib/firestore-models';

const ALLOWED_KIND = new Set<LetterKind>(['weekly', 'monthly_pick', 'special']);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const kind = url.searchParams.get('kind') as LetterKind | null;
        const status = url.searchParams.get('status') ?? undefined;
        const limit = Number(url.searchParams.get('limit') ?? 50);

        const letters = await listLetters({
            status,
            kind: kind && ALLOWED_KIND.has(kind) ? kind : undefined,
            limit,
        });
        return NextResponse.json({ letters });
    } catch (error) {
        console.error('GET /api/letter failed', error);
        return NextResponse.json({ error: 'Failed to list letters' }, { status: 500 });
    }
}

/**
 * POST /api/letter — admin이 직접 본문을 수동 upsert (예: weekly letter draft 저장)
 * 새 회차를 Claude로 생성하려면 /api/letter/generate 사용.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const slug = body.slug as string;
        if (!slug) {
            return NextResponse.json({ error: 'slug required' }, { status: 400 });
        }
        const kind = (body.kind ?? 'weekly') as LetterKind;
        if (!ALLOWED_KIND.has(kind)) {
            return NextResponse.json({ error: 'invalid kind' }, { status: 400 });
        }

        const letter = await upsertLetter(slug, {
            title: body.title ?? '',
            contentMarkdown: body.contentMarkdown ?? '',
            kind,
            bookIds: Array.isArray(body.bookIds) ? body.bookIds : [],
            curatorNote: body.curatorNote ?? null,
            category: body.category ?? null,
            status: body.status ?? 'draft',
            isFeatured: !!body.isFeatured,
            headlineTitle: body.headlineTitle ?? null,
            metaTitle: body.metaTitle ?? null,
            metaDescription: body.metaDescription ?? null,
            ogImageUrl: body.ogImageUrl ?? null,
            coverImageUrl: body.coverImageUrl ?? null,
            readingTime: body.readingTime ?? null,
            authors: body.authors ?? null,
            publisher: body.publisher ?? null,
            publishedDate: body.publishedDate ?? null,
            isbn13: body.isbn13 ?? null,
            googleVolumeId: body.googleVolumeId ?? null,
            source: body.source ?? 'aladin',
            tags: body.tags ?? null,
        });

        return NextResponse.json({ success: true, letter });
    } catch (error) {
        console.error('POST /api/letter failed', error);
        return NextResponse.json({ error: 'Failed to save letter' }, { status: 500 });
    }
}
