import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function PATCH(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = (await request.json()) as Record<string, unknown>;

        const data: Record<string, unknown> = {};
        for (const key of ALLOWED_FIELDS) {
            if (key in body) data[key as AllowedField] = body[key];
        }

        if (typeof data.slug === 'string') {
            const slug = slugifyKo(data.slug as string) || (data.slug as string);
            const conflict = await prisma.curation.findFirst({
                where: { slug, NOT: { id } },
            });
            if (conflict) {
                return NextResponse.json(
                    { error: '이미 사용중인 slug입니다.' },
                    { status: 409 },
                );
            }
            data.slug = slug;
        }

        if (data.status === 'published') {
            const current = await prisma.curation.findUnique({
                where: { id },
                select: { publishedAt: true, slug: true },
            });
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

        const updated = await prisma.curation.update({
            where: { id },
            data,
            include: { books: true },
        });

        return NextResponse.json({ success: true, curation: updated });
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
        await prisma.curation.delete({ where: { id } });
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
        const curation = await prisma.curation.findUnique({
            where: { id },
            include: { books: true },
        });
        if (!curation) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, curation });
    } catch (error) {
        console.error('GET /api/curation/[id] failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch curation' },
            { status: 500 },
        );
    }
}
