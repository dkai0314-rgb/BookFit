/**
 * 운영자(어드민) 1명에게 transactional email 발송.
 * Brevo /smtp/email API의 단일 수신자 모드.
 *
 * ADMIN_NOTIFICATION_EMAIL env 미설정 시 dkai0314@gmail.com 으로 발송.
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_BASE_URL = process.env.BREVO_BASE_URL || 'https://api.brevo.com/v3';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'newsletter@bookfit.kr';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'BookFit';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'dkai0314@gmail.com';

const SITE_ORIGIN = 'https://bookfit.kr';

export async function notifyAdmin(input: {
    subject: string;
    htmlBody: string;
    textBody?: string;
}): Promise<{ ok: boolean; error?: string }> {
    if (!BREVO_API_KEY) {
        return { ok: false, error: 'BREVO_API_KEY 미설정' };
    }
    try {
        const res = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
                to: [{ email: ADMIN_EMAIL, name: '북핏 운영자' }],
                subject: input.subject,
                htmlContent: input.htmlBody,
                textContent: input.textBody,
            }),
        });
        if (!res.ok) {
            const text = await res.text();
            return { ok: false, error: `Brevo ${res.status}: ${text.slice(0, 200)}` };
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export function buildDraftReadyEmail(letter: {
    slug: string;
    title: string;
    headlineTitle: string | null;
    kind: string;
    theme?: string;
}): { subject: string; htmlBody: string } {
    const editUrl = `${SITE_ORIGIN}/admin/letters/${encodeURIComponent(letter.slug)}`;
    const subject = `[북핏 자동화] 새 레터 draft 생성됨`;
    const headline = letter.headlineTitle || letter.title;

    const htmlBody = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f7f6f4;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#222;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #efebe5;">
    <div style="padding:32px;">
      <div style="font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#a87f5b;">자동 생성 알림</div>
      <h1 style="margin:8px 0 16px 0;font-size:22px;line-height:1.4;">${escapeHtml(headline)}</h1>
      <p style="margin:0 0 8px 0;font-size:14px;color:#666;">
        형식: <strong>${escapeHtml(letter.kind)}</strong>
      </p>
      ${letter.theme ? `<p style="margin:0 0 8px 0;font-size:14px;color:#666;">테마: <strong>${escapeHtml(letter.theme)}</strong></p>` : ''}
      <p style="margin:16px 0 24px 0;font-size:14px;color:#555;line-height:1.6;">
        Claude가 새 draft를 작성했습니다. 검토 후 publish 해주세요.
      </p>
      <a href="${editUrl}" style="display:inline-block;background:#a87f5b;color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:8px;">검토하러 가기 →</a>
      <p style="margin:32px 0 0 0;font-size:12px;color:#888;">
        slug: <code>${escapeHtml(letter.slug)}</code>
      </p>
    </div>
  </div>
</body></html>`;

    return { subject, htmlBody };
}

export function buildEmptyPoolEmail(): { subject: string; htmlBody: string } {
    const subject = `[북핏 자동화] ⚠️ 테마 풀이 비었어요`;
    const htmlBody = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f7f6f4;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#222;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #efebe5;">
    <div style="padding:32px;">
      <h1 style="margin:0 0 16px 0;font-size:20px;color:#c8512c;">테마 풀이 비었습니다</h1>
      <p style="font-size:14px;color:#555;line-height:1.7;">
        이번 주 cron이 사용할 미사용 테마가 없어 자동 draft 생성을 건너뛰었습니다.<br/>
        다음 주 발행을 위해 새 테마를 등록해주세요.
      </p>
      <a href="${SITE_ORIGIN}/admin/themes" style="display:inline-block;margin-top:16px;background:#a87f5b;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px;">테마 풀 관리</a>
    </div>
  </div>
</body></html>`;
    return { subject, htmlBody };
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
