/**
 * Vercel Cron 요청 인증.
 *
 * Vercel Cron Jobs는 자동으로 다음 헤더를 주입합니다:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * CRON_SECRET 은 Vercel 프로젝트 환경변수에 등록된 값과 일치해야 합니다.
 * 미등록 시 Vercel이 자동 생성한 secret을 사용 — 수동 호출은 불가, Vercel cron만 통과.
 */

export function isAuthorizedCron(request: Request): boolean {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader) return false;
    const expected = process.env.CRON_SECRET;
    if (!expected) {
        // Secret 미설정 시 보수적으로 거부 (production 안전)
        console.warn('CRON_SECRET env not set — rejecting cron call');
        return false;
    }
    return authHeader === `Bearer ${expected}`;
}

export function unauthorizedCronResponse(): Response {
    return new Response(JSON.stringify({ error: 'Unauthorized cron request' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    });
}
