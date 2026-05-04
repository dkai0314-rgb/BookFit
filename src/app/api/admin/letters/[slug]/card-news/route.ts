import { NextResponse } from 'next/server';
import { getLetterBySlug } from '@/lib/firestore-models';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/letters/[slug]/card-news
// 카드뉴스 7슬라이드 텍스트 데이터 반환
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const letter = await getLetterBySlug(slug);
    if (!letter) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const sc = letter.structuredContent;
    if (!sc) {
        return NextResponse.json({ error: 'structuredContent 없음. 새 형식으로 재생성 필요.' }, { status: 400 });
    }

    // 7슬라이드 데이터 구성
    const insightOrBookSlides =
        sc.type === 'single' && sc.insights
            ? sc.insights.map((ins, i) => ({
                  slide: 3 + i,
                  role: `Insight ${i + 1}`,
                  headline: ins.title,
                  body: ins.body,
                  note: `🤔 ${ins.reflection}`,
              }))
            : (sc.themeBooks ?? []).map((b, i) => ({
                  slide: 3 + i,
                  role: `Book ${i + 1}`,
                  headline: b.title,
                  body: b.curatorPick,
                  note: `이런 분께: ${b.forWhom} | 읽고 나면: ${b.afterReading}`,
              }));

    const slides = [
        {
            slide: 1,
            role: 'Cover (훅)',
            headline: sc.headline,
            body: sc.subheadline,
            note: '책 표지 이미지 + 북핏 로고',
        },
        {
            slide: 2,
            role: 'Impact',
            headline:
                sc.type === 'single'
                    ? sc.keyQuote
                        ? `"${sc.keyQuote}"`
                        : sc.curatorNote.slice(0, 80)
                    : sc.curatorNote.slice(0, 100),
            body: sc.curatorNote,
            note: '편집자 목소리 / 핵심 인용구',
        },
        ...insightOrBookSlides,
        {
            slide: 6,
            role: 'Recommendation',
            headline: '이런 분께 특히 추천해요',
            body: sc.recommendation.map((r, i) => `${i + 1}. ${r}`).join('\n'),
            note: sc.afterReading.map((a) => `✅ ${a}`).join('\n'),
        },
        {
            slide: 7,
            role: 'CTA',
            headline: '북핏레터 구독하기',
            body: '매주 당신에게 꼭 맞는 책 한 권을 큐레이션합니다.',
            note: '📧 bookfit.kr | @bookfit_letter',
        },
    ];

    return NextResponse.json({
        success: true,
        letterSlug: slug,
        letterTitle: letter.headlineTitle || letter.title,
        instagramCaption: sc.instagramCaption,
        slides,
    });
}
