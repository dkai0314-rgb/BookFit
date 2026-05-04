import {
    findRecentSuccessfulDispatch,
    createDispatchLog,
    type StructuredContent,
} from './firestore-models';

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
        const existing = await findRecentSuccessfulDispatch(input.type, input.targetId);
        if (existing) {
            return { sentCount: existing.sentCount, skipped: true };
        }
    }

    let recipients: string[] = [];
    try {
        recipients = await fetchAllContacts(BREVO_LIST_ID);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await createDispatchLog({
            type: input.type,
            targetId: input.targetId,
            sentCount: 0,
            errorMessage: `list fetch failed: ${msg}`,
        });
        return { sentCount: 0, skipped: false, error: msg };
    }

    if (recipients.length === 0) {
        await createDispatchLog({
            type: input.type,
            targetId: input.targetId,
            sentCount: 0,
            errorMessage: 'no recipients',
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

    await createDispatchLog({
        type: input.type,
        targetId: input.targetId,
        sentCount,
        errorMessage: lastError ?? null,
    });

    return { sentCount, skipped: false, error: lastError };
}

export type LetterEmailKind = 'letter' | 'weekly' | 'monthly_pick' | 'special';

const KIND_BADGE: Record<LetterEmailKind, string> = {
    letter: '북핏레터',
    weekly: '북핏레터',
    monthly_pick: '북핏레터',
    special: '북핏레터',
};

export function buildLetterEmailHtml(letter: {
    slug: string;
    headlineTitle: string | null;
    title: string;
    metaDescription: string | null;
    contentMarkdown: string;
    coverImageUrl: string | null;
    kind?: LetterEmailKind;
    books?: { title: string; author: string; imageUrl: string | null }[];
    curatorNote?: string | null;
    structuredContent?: StructuredContent | null;
}): { subject: string; htmlBody: string } {
    const sc = letter.structuredContent;
    const subject = `[북핏레터] ${sc?.headline || letter.headlineTitle || letter.title}`;
    const url = `${SITE_ORIGIN}/bookfit-letter/${letter.slug}`;
    const kind = letter.kind ?? 'letter';
    const badge = KIND_BADGE[kind] ?? '북핏레터';

    const cover =
        letter.coverImageUrl ||
        letter.books?.find((b) => !!b.imageUrl)?.imageUrl ||
        '';
    const normalize = (u: string) =>
        u.replace('coversum', 'cover500').replace(/^http:/i, 'https:');

    let coverBlock = '';
    if (letter.books && letter.books.length >= 2) {
        const cells = letter.books
            .slice(0, 3)
            .map((b) =>
                b.imageUrl
                    ? `<td align="center" style="padding:0 6px;"><img src="${escapeAttr(normalize(b.imageUrl))}" alt="${escapeAttr(b.title)}" width="160" style="display:block;width:100%;max-width:160px;height:auto;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.12);" /></td>`
                    : '<td></td>',
            )
            .join('');
        coverBlock = `<tr><td style="padding:32px 32px 0 32px;background:#faf8f5;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>${cells}</tr></table></td></tr>`;
    } else if (cover) {
        coverBlock = `<tr><td><img src="${escapeAttr(normalize(cover))}" alt="" style="display:block;width:100%;height:auto;" /></td></tr>`;
    }

    let bodyRows = '';

    if (sc) {
        // 구조화 콘텐츠 기반 이메일 렌더
        const headlineHtml = escapeHtml(sc.headline || letter.headlineTitle || letter.title);
        const subheadlineHtml = escapeHtml(sc.subheadline || letter.metaDescription || '');
        const curatorNoteHtml = escapeHtml(sc.curatorNote || '');

        bodyRows += `<tr><td style="padding:32px 32px 16px 32px;">
            <div style="font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#a87f5b;">${escapeHtml(badge)}</div>
            <h1 style="margin:8px 0 16px 0;font-size:24px;line-height:1.4;color:#222;">${headlineHtml}</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#555;">${subheadlineHtml}</p>
          </td></tr>`;

        if (curatorNoteHtml) {
            bodyRows += `<tr><td style="padding:0 32px 24px 32px;"><div style="background:#fdf8f0;border-left:3px solid #a87f5b;padding:16px 20px;border-radius:0 6px 6px 0;font-size:14px;line-height:1.7;color:#5a4a35;white-space:pre-line;">${curatorNoteHtml}</div></td></tr>`;
        }

        // 단권: keyQuote + insights 3개 요약
        if (sc.type === 'single') {
            if (sc.keyQuote) {
                bodyRows += `<tr><td style="padding:0 32px 24px 32px;"><blockquote style="margin:0;padding:16px 20px;background:#f8f8f8;border-left:4px solid #a87f5b;border-radius:0 8px 8px 0;font-size:16px;line-height:1.6;color:#333;font-style:italic;">"${escapeHtml(sc.keyQuote)}"</blockquote></td></tr>`;
            }
            if (sc.insights && sc.insights.length > 0) {
                const insightsHtml = sc.insights.map((ins) =>
                    `<div style="margin-bottom:16px;padding:16px;background:#f9f9f9;border-radius:8px;">
                        <div style="font-weight:bold;font-size:14px;color:#222;margin-bottom:6px;">${escapeHtml(ins.title)}</div>
                        <div style="font-size:13px;line-height:1.6;color:#555;">${escapeHtml(ins.body.split(/[.。]/)[0] + '.')}</div>
                    </div>`
                ).join('');
                bodyRows += `<tr><td style="padding:0 32px 16px 32px;"><div style="font-weight:bold;font-size:14px;color:#333;margin-bottom:12px;">핵심 인사이트</div>${insightsHtml}</td></tr>`;
            }
        }

        // 테마: themeBooks 3권 각각 요약
        if (sc.type === 'theme' && sc.themeBooks && sc.themeBooks.length > 0) {
            const booksHtml = sc.themeBooks.map((b, i) =>
                `<div style="margin-bottom:16px;padding:16px;background:#f9f9f9;border-radius:8px;">
                    <div style="font-size:11px;font-weight:bold;color:#a87f5b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Book ${i + 1}</div>
                    <div style="font-weight:bold;font-size:15px;color:#222;">${escapeHtml(b.title)}</div>
                    <div style="font-size:12px;color:#888;margin-bottom:8px;">— ${escapeHtml(b.author)}</div>
                    <div style="font-size:12px;color:#666;font-style:italic;margin-bottom:6px;">${escapeHtml(b.forWhom)}</div>
                    <div style="font-size:13px;color:#555;line-height:1.5;">${escapeHtml(b.afterReading)}</div>
                </div>`
            ).join('');
            bodyRows += `<tr><td style="padding:0 32px 16px 32px;"><div style="font-weight:bold;font-size:14px;color:#333;margin-bottom:12px;">이번 레터의 책 3권</div>${booksHtml}</td></tr>`;
        }

        // 공통: recommendation + afterReading
        if (sc.recommendation.length > 0) {
            const recHtml = sc.recommendation.map((r) => `<div style="margin:4px 0;font-size:13px;color:#555;">✓ ${escapeHtml(r)}</div>`).join('');
            bodyRows += `<tr><td style="padding:0 32px 16px 32px;"><div style="font-weight:bold;font-size:14px;color:#333;margin-bottom:8px;">이런 분께 특히 추천해요</div>${recHtml}</td></tr>`;
        }
        if (sc.afterReading.length > 0) {
            const arHtml = sc.afterReading.map((a) => `<div style="margin:4px 0;font-size:13px;color:#555;">✅ ${escapeHtml(a)}</div>`).join('');
            bodyRows += `<tr><td style="padding:0 32px 24px 32px;"><div style="font-weight:bold;font-size:14px;color:#333;margin-bottom:8px;">읽고 나면</div>${arHtml}</td></tr>`;
        }
    } else {
        // Fallback: 기존 로직
        const desc = letter.metaDescription || '';
        bodyRows += `<tr><td style="padding:32px 32px 16px 32px;">
            <div style="font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#a87f5b;">${escapeHtml(badge)}</div>
            <h1 style="margin:8px 0 16px 0;font-size:24px;line-height:1.4;color:#222;">${escapeHtml(letter.headlineTitle || letter.title)}</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#555;">${escapeHtml(desc)}</p>
          </td></tr>`;

        if (letter.curatorNote) {
            bodyRows += `<tr><td style="padding:0 32px 24px 32px;"><div style="background:#faf6ee;border-left:3px solid #a87f5b;padding:16px 20px;border-radius:6px;font-size:14px;line-height:1.7;color:#5a4a35;white-space:pre-line;">${escapeHtml(letter.curatorNote)}</div></td></tr>`;
        }

        if (letter.books && letter.books.length > 0) {
            const bookListHtml = letter.books
                .map((b) => `<div style="margin:4px 0;">· <strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(b.author)}</div>`)
                .join('');
            bodyRows += `<tr><td style="padding:0 32px 24px 32px;font-size:13px;color:#666;"><div style="font-weight:bold;color:#333;margin-bottom:8px;">이번 회차의 책</div>${bookListHtml}</td></tr>`;
        }
    }

    const htmlBody = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f7f6f4;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;color:#222;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f6f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          ${coverBlock}
          ${bodyRows}
          <tr><td style="padding:0 32px 32px 32px;">
            <a href="${escapeAttr(url)}" style="display:inline-block;background:#a87f5b;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:8px;">전체 글 읽기 →</a>
          </td></tr>
          <tr><td style="padding:24px 32px;border-top:1px solid #efebe5;font-size:12px;color:#888;">
            BookFit · 책으로 만나는 매주의 회차.<br/>
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
