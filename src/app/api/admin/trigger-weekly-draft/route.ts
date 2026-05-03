import { NextResponse } from 'next/server';
import {
    pickNextTheme,
    markThemeUsed,
} from '@/lib/firestore-models';
import { generateMonthlyPickDraft } from '@/lib/letter-generation';
import {
    notifyAdmin,
    buildDraftReadyEmail,
    buildEmptyPoolEmail,
} from '@/lib/admin-notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * POST /api/admin/trigger-weekly-draft
 *
 * cron route(/api/cron/weekly-draft)와 동일한 로직 — admin Basic Auth로 보호된 수동 트리거.
 * proxy.ts가 /api/admin/* 자동 보호.
 *
 * 사용처: /admin/themes 페이지의 "지금 실행" 버튼
 */
export async function POST() {
    try {
        const theme = await pickNextTheme();
        if (!theme) {
            const { subject, htmlBody } = buildEmptyPoolEmail();
            await notifyAdmin({ subject, htmlBody }).catch(() => undefined);
            return NextResponse.json({
                success: false,
                skipped: true,
                reason: '미사용 테마가 없어요. 테마 풀에 새 테마를 등록해주세요.',
            });
        }

        if (theme.kind === 'weekly') {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        'weekly kind는 자동 트리거 미지원. 테마의 kind를 monthly_pick으로 변경하거나, /admin/letters 에서 직접 책 검색으로 weekly 회차를 만들어주세요.',
                    themeId: theme.id,
                },
                { status: 400 },
            );
        }

        const letter = await generateMonthlyPickDraft(theme.theme);
        await markThemeUsed(theme.id, letter.slug);

        const { subject, htmlBody } = buildDraftReadyEmail({
            slug: letter.slug,
            title: letter.title,
            headlineTitle: letter.headlineTitle,
            kind: letter.kind,
            theme: theme.theme,
        });
        const notify = await notifyAdmin({ subject, htmlBody });

        return NextResponse.json({
            success: true,
            theme: theme.theme,
            letterSlug: letter.slug,
            letterTitle: letter.title,
            notifyOk: notify.ok,
            notifyError: notify.error,
        });
    } catch (error) {
        console.error('manual trigger failed', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}
