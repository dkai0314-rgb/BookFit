import { NextResponse } from 'next/server';
import { upsertLetter } from '@/lib/firestore-models';
import { dispatchEmail, buildLetterEmailHtml } from '@/lib/brevo-dispatch';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, slug, content, metadata, status = 'DRAFT' } = body;

        let cleanContent = content as string;
        let metaTitleFM = '';
        let metaDescFM = '';
        let slugFM = slug as string;
        let publishedAtFM = '';
        let sourceFM = metadata?.source || 'aladin';
        let itemIdFM = metadata?.sourceId || metadata?.volumeId || '';
        let isbn13FM = metadata?.isbn13 || '';

        const frontmatterMatch = cleanContent.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
            const fmText = frontmatterMatch[1];
            cleanContent = cleanContent.slice(frontmatterMatch[0].length).trim();
            const lines = fmText.split('\n');
            lines.forEach((line: string) => {
                const idx = line.indexOf(':');
                if (idx > -1) {
                    const key = line.slice(0, idx).trim();
                    const val = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
                    switch (key) {
                        case 'meta_title': metaTitleFM = val; break;
                        case 'meta_description': metaDescFM = val; break;
                        case 'slug': slugFM = val; break;
                        case 'published_at': publishedAtFM = val; break;
                        case 'source': sourceFM = val; break;
                        case 'item_id': itemIdFM = val; break;
                        case 'isbn13': isbn13FM = val; break;
                    }
                }
            });
        }

        let generatedHeadline = '';
        const h1Match = cleanContent.match(/^#\s+(.*)$/m);
        if (h1Match) {
            generatedHeadline = h1Match[1].trim();
        } else {
            generatedHeadline = metaTitleFM || `${title} 요약`;
        }

        let generatedMetaDesc = metaDescFM || '';
        if (!generatedMetaDesc) {
            const stripped = cleanContent
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/[#*>\-`]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            generatedMetaDesc = stripped.substring(0, 100);
        }

        const newLetter = await upsertLetter(slugFM, {
            title,
            contentMarkdown: cleanContent,
            googleVolumeId: itemIdFM || metadata?.sourceId || metadata?.volumeId || null,
            isbn13: isbn13FM || metadata?.isbn13 || null,
            source: sourceFM || 'aladin',
            authors: metadata?.authors ? metadata.authors.join(', ') : null,
            publisher: metadata?.publisher || null,
            publishedDate: metadata?.publishedDate || null,
            coverImageUrl: metadata?.coverImageUrl || null,
            headlineTitle: generatedHeadline,
            metaTitle: metaTitleFM || null,
            metaDescription: generatedMetaDesc,
            publishedAt: publishedAtFM ? new Date(publishedAtFM) : null,
            status,
        });

        // W4-2: published 상태로 발행되면 Brevo로 자동 발송 (idempotent)
        let dispatch: { sentCount: number; skipped: boolean; error?: string } | null = null;
        if (status === 'PUBLISHED' || status === 'published') {
            try {
                const { subject, htmlBody } = buildLetterEmailHtml({
                    slug: newLetter.slug,
                    headlineTitle: newLetter.headlineTitle,
                    title: newLetter.title,
                    metaDescription: newLetter.metaDescription,
                    contentMarkdown: newLetter.contentMarkdown,
                    coverImageUrl: newLetter.coverImageUrl,
                });
                dispatch = await dispatchEmail({
                    type: 'letter',
                    targetId: newLetter.id,
                    subject,
                    htmlBody,
                    idempotent: true,
                });
            } catch (e) {
                console.error('[bookfit-letter] dispatch failed', e);
                dispatch = {
                    sentCount: 0,
                    skipped: false,
                    error: e instanceof Error ? e.message : String(e),
                };
            }
        }

        return NextResponse.json({ success: true, newLetter, dispatch });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('[API] /api/bookfit-letter error:', err);
        return NextResponse.json({ error: err.message || '저장 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
