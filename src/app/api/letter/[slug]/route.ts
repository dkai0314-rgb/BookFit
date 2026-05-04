import { NextResponse } from 'next/server';
import {
    getLetterBySlug,
    getLetterWithBooks,
    upsertLetter,
    deleteLetter,
    findLetterBySlug,
    type LetterKind,
} from '@/lib/firestore-models';
import { dispatchEmail, buildLetterEmailHtml } from '@/lib/brevo-dispatch';

type Params = { params: Promise<{ slug: string }> };

const ALLOWED_FIELDS = [
    'title',
    'headlineTitle',
    'metaTitle',
    'metaDescription',
    'ogImageUrl',
    'coverImageUrl',
    'category',
    'curatorNote',
    'contentMarkdown',
    'isFeatured',
    'status',
    'readingTime',
    'tags',
    'kind',
    'bookIds',
    'authors',
    'publisher',
    'publishedDate',
    'isbn13',
    'googleVolumeId',
    'source',
] as const;

const ALLOWED_KIND = new Set<LetterKind>(['letter', 'weekly', 'monthly_pick', 'special']);

export async function GET(_request: Request, { params }: Params) {
    try {
        const { slug } = await params;
        const letter = await getLetterBySlug(slug);
        if (!letter) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, letter });
    } catch (error) {
        console.error('GET /api/letter/[slug] failed', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        const { slug } = await params;
        const body = (await request.json()) as Record<string, unknown>;

        const existing = await getLetterBySlug(slug);
        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // slug rename support: body.newSlug 으로 doc id 변경
        const newSlug = typeof body.newSlug === 'string' ? body.newSlug.trim() : slug;
        if (newSlug !== slug) {
            const conflict = await findLetterBySlug(newSlug, slug);
            if (conflict) {
                return NextResponse.json({ error: '이미 사용중인 slug 입니다.' }, { status: 409 });
            }
        }

        const data: Record<string, unknown> = {};
        for (const key of ALLOWED_FIELDS) {
            if (key in body) data[key] = body[key];
        }
        if (typeof data.kind === 'string' && !ALLOWED_KIND.has(data.kind as LetterKind)) {
            return NextResponse.json({ error: 'invalid kind' }, { status: 400 });
        }

        const isPublishing =
            (data.status === 'PUBLISHED' || data.status === 'published') &&
            existing.status !== 'PUBLISHED' &&
            existing.status !== 'published';

        const willBePublished =
            data.status === 'PUBLISHED' || data.status === 'published';
        if (willBePublished && !existing.publishedAt && !data.publishedAt) {
            data.publishedAt = new Date();
        }

        // slug rename = doc 새로 만들고 기존 삭제
        let resultSlug = slug;
        if (newSlug !== slug) {
            const merged = {
                ...existing,
                ...data,
                slug: newSlug,
            };
            // upsertLetter는 새 slug로 새 doc 생성
            const { id: _id, slug: _slug, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = merged;
            void _id; void _slug; void _createdAt; void _updatedAt;
            await upsertLetter(newSlug, rest as Parameters<typeof upsertLetter>[1]);
            await deleteLetter(slug);
            resultSlug = newSlug;
        } else {
            const { books: _books, ...existingRest } = existing as never as Record<string, unknown> & { books?: unknown };
            void _books;
            await upsertLetter(slug, { ...(existingRest as object), ...data } as Parameters<typeof upsertLetter>[1]);
        }

        const updated = await getLetterBySlug(resultSlug);
        if (!updated) {
            return NextResponse.json({ error: 'Failed to read after update' }, { status: 500 });
        }

        // published 전환 → Brevo 자동 발송 (idempotent in helper)
        let dispatch: { sentCount: number; skipped: boolean; error?: string } | null = null;
        if (isPublishing) {
            try {
                const withBooks = await getLetterWithBooks(updated.slug);
                const { subject, htmlBody } = buildLetterEmailHtml({
                    slug: updated.slug,
                    headlineTitle: updated.headlineTitle,
                    title: updated.title,
                    metaDescription: updated.metaDescription,
                    contentMarkdown: updated.contentMarkdown,
                    coverImageUrl: updated.coverImageUrl,
                    kind: updated.kind,
                    curatorNote: updated.curatorNote,
                    books: withBooks?.books.map((b) => ({
                        title: b.title,
                        author: b.author,
                        imageUrl: b.imageUrl,
                    })),
                });
                dispatch = await dispatchEmail({
                    type: 'letter',
                    targetId: updated.id,
                    subject,
                    htmlBody,
                    idempotent: true,
                });
            } catch (e) {
                console.error('letter dispatch failed', e);
                dispatch = {
                    sentCount: 0,
                    skipped: false,
                    error: e instanceof Error ? e.message : String(e),
                };
            }
        }

        return NextResponse.json({ success: true, letter: updated, dispatch });
    } catch (error) {
        console.error('PATCH /api/letter/[slug] failed', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { slug } = await params;
        await deleteLetter(slug);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/letter/[slug] failed', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
