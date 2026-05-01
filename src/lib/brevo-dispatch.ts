import { prisma } from './db';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_BASE_URL = process.env.BREVO_BASE_URL || 'https://api.brevo.com/v3';
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '7', 10);
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'newsletter@bookfit.kr';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'BookFit';

const SITE_ORIGIN = 'https://bookfit.kr';

export type DispatchType = 'letter' | 'curation';

export type DispatchInput = {
    type: DispatchType;
    targetId: string;
    subject: string;
    htmlBody: string;
    /** 안전장치 — 같은 type+targetId 로 이미 발송 로그가 있으면 skip */
    idempotent?: boolean;
};

export type DispatchResult = {
    sentCount: number;
    skipped: boolean;
    error?: string;
};

type BrevoContact = { email: string; emailBlacklisted?: boolean; listUnsubscribed?: boolean };

async function fetchAllContacts(listId: number): Promise<string[]> {
    const collected: string[] = [];
    let offset = 0;
    const limit = 500;

    while (true) {
        const res = await fetch(
            `${BREVO_BASE_URL}/contacts/lists/${listId}/contacts?limit=${limit}&offset=${offset}`,
            {
                headers: {
                    Accept: 'application/json',
                    'api-key': BREVO_API_KEY,
                },
            },
        );
        if (!res.ok) {
            throw new Error(`Brevo list ${listId} fetch failed: ${res.status}`);
        }
        const json = (await res.json()) as { contacts?: BrevoContact[]; count?: number };
        const contacts = json.contacts || [];
        for (const c of contacts) {
            if (c.email && !c.emailBlacklisted && !c.listUnsubscribed) {
                collected.push(c.email);
            }
        }
        if (contacts.length < limit) break;
        offset += limit;
        if (offset > 50000) break; // safety bound
    }
    return collected;
}

async function sendBatch(
    subject: string,
    htmlBody: string,
    recipients: string[],
): Promise<{ ok: boolean; error?: string }> {
    if (recipients.length === 0) return { ok: true };

    const messageVersions = recipients.map((email) => ({ to: [{ email }] }));

    const res = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
            subject,
            htmlContent: htmlBody,
            messageVersions,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        return { ok: false, error: `Brevo send ${res.status}: ${errorText.slice(0, 200)}` };
    }
    return { ok: true };
}

export async function dispatchEmail(input: DispatchInput): Promise<DispatchResult> {
    if (!BREVO_API_KEY) {
        return { sentCount: 0, skipped: true, error: 'BREVO_API_KEY 미설정' };
    }

    if (input.idempotent) {
        const existing = await prisma.emailDispatchLog.findFirst({
            where: { type: input.type, targetId: input.targetId, errorMessage: null },
            orderBy: { sentAt: 'desc' },
        });
        if (existing) {
            return { sentCount: existing.sentCount, skipped: true };
        }
    }

    let recipients: string[] = [];
    try {
        recipients = await fetchAllContacts(BREVO_LIST_ID);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await prisma.emailDispatchLog.create({
            data: {
                type: input.type,
                targetId: input.targetId,
                sentCount: 0,
                errorMessage: `list fetch failed: ${msg}`,
            },
        });
        return { sentCount: 0, skipped: false, error: msg };
    }

    if (recipients.length === 0) {
        await prisma.emailDispatchLog.create({
            data: {
                type: input.type,
                targetId: input.targetId,
                sentCount: 0,
                errorMessage: 'no recipients',
            },
        });
        return { sentCount: 0, skipped: false };
    }

    const CHUNK = 50;
    let sentCount = 0;
    let lastError: string | undefined;

    for (let i = 0; i < recipients.length; i += CHUNK) {
        const chunk = recipients.slice(i, i + CHUNK);
        const result = await sendBatch(input.subject, input.htmlBody, chunk);
        if (result.ok) {
            sentCount += chunk.length;
        } else {
            lastError = result.error;
            break;
        }
    }

    await prisma.emailDispatchLog.create({
        data: {
            type: input.type,
            targetId: input.targetId,
            sentCount,
            errorMessage: lastError ?? null,
        },
    });

    return { sentCount, skipped: false, error: lastError };
}

export function buildLetterEmailHtml(letter: {
    slug: string;
    headlineTitle: string | null;
    title: string;
    metaDescription: string | null;
    contentMarkdown: string;
    coverImageUrl: string | null;
}): { subject: string; htmlBody: string } {
    const subject = `[북핏레터] ${letter.headlineTitle || letter.title}`;
    const url = `${SITE_ORIGIN}/bookfit-letter/${letter.slug}`;
    const desc = letter.metaDescription || '';
    const cover = letter.coverImageUrl || '';

    const htmlBody = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f7f6f4;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;color:#222;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f6f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          ${cover ? `<tr><td><img src="${escapeAttr(cover)}" alt="" style="display:block;width:100%;height:auto;" /></td></tr>` : ''}
          <tr><td style="padding:32px 32px 16px 32px;">
            <div style="font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#a87f5b;">Weekly Letter</div>
            <h1 style="margin:8px 0 16px 0;font-size:24px;line-height:1.4;color:#222;">${escapeHtml(letter.headlineTitle || letter.title)}</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#555;">${escapeHtml(desc)}</p>
          </td></tr>
          <tr><td style="padding:0 32px 32px 32px;">
            <a href="${escapeAttr(url)}" style="display:inline-block;background:#a87f5b;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:8px;">전체 글 읽기 →</a>
          </td></tr>
          <tr><td style="padding:24px 32px;border-top:1px solid #efebe5;font-size:12px;color:#888;">
            BookFit · 매주 한 권의 책에서 인사이트를 정리해 보내드려요.<br/>
            <a href="${SITE_ORIGIN}" style="color:#a87f5b;text-decoration:none;">bookfit.kr</a>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
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

function escapeAttr(s: string): string {
    return escapeHtml(s);
}
