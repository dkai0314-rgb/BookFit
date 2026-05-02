import { NextResponse } from 'next/server';
import {
    getCuration,
    getBooksByIds,
    findCurationBySlug,
    updateCuration,
    deleteCuration,
} from '@/lib/firestore-models';
import { slugifyKo } from '@/lib/prompts/curation';

type Params = { params: Promise<{ id: string }> };

const ALLOWED_FIELDS = [
    'title',
    'description',
    'curatorNote',
    'seoTitle',
    'seoDesc',
    'ogImage',
    'cardImageUrl',
    'category',
    'slug',
    'isFeatured',
    'status',
    'readingTime',
    'instaCaption',
    'theme',
] as const;

export async function PATCH(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = (await request.json()) as Record<string, unknown>;

        const data: Record<string, unknown> = {};
        for (const key of ALLOWED_FIELDS) {
            if (key in body) data[key] = body[key];
        }

        if (typeof data.slug === 'string') {
            const slug = slugifyKo(data.slug as string) || (data.slug as string);
            const conflict = await findCurationBySlug(slug, id);
            if (conflict) {
                return NextResponse.json(
                    { error: '이미 사용중인 slug입니다.' },
                    { status: 409 },
                );
            }
            data.slug = slug;
        }

        if (data.status === 'published') {
            const current = await getCuration(id);
            if (!current?.slug && !data.slug) {
                return NextResponse.json(
                    { error: 'published 전환 전에 slug를 먼저 지정하세요.' },
                    { status: 400 },
                );
            }
            if (!current?.publishedAt) {
                data.publishedAt = new Date();
            }
            data.isPublished = true;
        }

        if (data.status === 'draft') {
            data.isPublished = false;
        }

        const updated = await updateCuration(id, data);
        if (!updated) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const books = await getBooksByIds(updated.bookIds);
        return NextResponse.json({ success: true, curation: { ...updated, books } });
    } catch (error) {
        console.error('PATCH /api/curation/[id] failed:', error);
        return NextResponse.json(
            { error: 'Failed to update curation' },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { id } = await params;
        await deleteCuration(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/curation/[id] failed:', error);
        return NextResponse.json(
            { error: 'Failed to delete curation' },
            { status: 500 },
        );
    }
}

export async function GET(_request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const curation = await getCuration(id);
        if (!curation) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const books = await getBooksByIds(curation.bookIds);
        return NextResponse.json({ success: true, curation: { ...curation, books } });
    } catch (error) {
        console.error('GET /api/curation/[id] failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch curation' },
            { status: 500 },
        );
    }
}
