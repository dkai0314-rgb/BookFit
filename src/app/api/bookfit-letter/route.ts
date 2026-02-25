import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Prisma 클라이언트 경로

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, slug, content, metadata, status = 'DRAFT' } = body;

        let generatedHeadline = '';
        let generatedMetaDesc = '';
        let cleanContent = content; // frontmatter 제거된 내용용

        let metaTitleFM = '';
        let metaDescFM = '';
        let slugFM = slug; // frontmatter slug가 있으면 덮어씌움
        let publishedAtFM = '';
        let sourceFM = metadata?.source || 'aladin';
        let itemIdFM = metadata?.sourceId || metadata?.volumeId || '';
        let isbn13FM = metadata?.isbn13 || '';

        // Frontmatter 파싱 (간단 정규식 활용)
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
            const fmText = frontmatterMatch[1];
            // 본문에서 프론트매터 블록 완전 제거
            cleanContent = content.slice(frontmatterMatch[0].length).trim();

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

        generatedHeadline = metaTitleFM || `${title} 요약`;
        generatedMetaDesc = metaDescFM || '';

        if (!generatedMetaDesc) {
            const stripped = cleanContent.replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/[#*>\-`]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            generatedMetaDesc = stripped.substring(0, 100);
        }

        // slug 중복 시 업데이트(upsert) 처리
        const newLetter = await prisma.letter.upsert({
            where: { slug },
            update: {
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
                status
            },
            create: {
                title,
                slug,
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
                status
            }
        });

        return NextResponse.json({ success: true, newLetter });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('[API] /api/bookfit-letter error:', err);
        return NextResponse.json({ error: err.message || '저장 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
