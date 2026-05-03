import { NextResponse } from 'next/server';
import { notifyAdmin } from '@/lib/admin-notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/test-email
 *
 * Brevo 이메일 발송 연결 테스트 (admin Basic Auth로 보호됨).
 * Draft 생성 없이 이메일 단독 테스트.
 */
export async function POST() {
    const result = await notifyAdmin({
        subject: '[북핏] Brevo 연결 테스트',
        htmlBody: `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;padding:32px;color:#222;">
  <h2>✅ Brevo 이메일 테스트 성공</h2>
  <p>이 메일이 도착했다면 Brevo 설정이 정상입니다.</p>
  <p style="color:#888;font-size:12px;">발송 시각: ${new Date().toISOString()}</p>
</body></html>`,
        textBody: 'Brevo 이메일 테스트 성공. 이 메일이 도착했다면 Brevo 설정이 정상입니다.',
    });

    if (!result.ok) {
        return NextResponse.json(
            { ok: false, error: result.error },
            { status: 500 },
        );
    }

    return NextResponse.json({ ok: true, message: '테스트 이메일 발송 완료' });
}
