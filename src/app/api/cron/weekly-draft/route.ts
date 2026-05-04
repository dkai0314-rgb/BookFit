import { NextResponse } from 'next/server';
import { isAuthorizedCron, unauthorizedCronResponse } from '@/lib/cron-auth';
import {
    pickNextTheme,
    markThemeUsed,
} from '@/lib/firestore-models';
import {
    generateMonthlyPickDraft,
} from '@/lib/letter-generation';
import {
    notifyAdmin,
    buildDraftReadyEmail,
    buildEmptyPoolEmail,
} from '@/lib/admin-notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Vercel Cron이 5분 이상 걸리는 함수도 동작하도록 maxDuration 확장
export const maxDuration = 300;

/**
 * GET /api/cron/weekly-draft
 *
 * Vercel Cron이 매주 일요일 23:00 KST (= 14:00 UTC)에 호출.
 * 흐름:
 *   1. themePool에서 미사용 테마 1개 pick (priority 우선, 같으면 오래된 것)
 *   2. 테마 없으면 운영자에게 "풀 비었음" 알림 + 종료
 *   3. 항상 테마 기반 3권 포맷(generateMonthlyPickDraft) 으로 draft 생성
 *   4. markThemeUsed
 *   5. 운영자에게 draft 검토 알림 발송
 */
export async function GET(request: Request) {
    if (!isAuthorizedCron(request)) {
        return unauthorizedCronResponse();
    }

    try {
        const theme = await pickNextTheme();
        if (!theme) {
            const { subject, htmlBody } = buildEmptyPoolEmail();
            await notifyAdmin({ subject, htmlBody });
            return NextResponse.json({
                success: true,
                skipped: true,
                reason: 'theme pool empty',
            });
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
            notifyOk: notify.ok,
            notifyError: notify.error,
        });
    } catch (error) {
        console.error('cron/weekly-draft failed', error);
        const msg = error instanceof Error ? error.message : String(error);
        // 에러도 운영자에게 알림 (best-effort)
        await notifyAdmin({
            subject: '[북핏 자동화] ❌ cron 실행 실패',
            htmlBody: `<p>에러:</p><pre style="white-space:pre-wrap;background:#fef2f2;padding:12px;border-radius:6px;">${msg.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] ?? c))}</pre>`,
        }).catch(() => undefined);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
