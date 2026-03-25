
import axios from 'axios';
import { createHmac } from 'crypto';

const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY || '';
const SECRET_KEY = process.env.COUPANG_SECRET_KEY || '';

/**
 * 쿠팡 파트너스 API 인증 헤더 생성
 */
function getAuthHeader(method: string, path: string, query: string = '') {
    // 공식 가이드 형식: YYMMDD[T]HHmmss[Z] (2자리 연도)
    const now = new Date();
    const yy = String(now.getUTCFullYear()).slice(2);
    const MM = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const HH = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const ss = String(now.getUTCSeconds()).padStart(2, '0');
    const datetime = `${yy}${MM}${dd}T${HH}${mm}${ss}Z`;

    const message = datetime + method + path + query;

    const signature = createHmac('sha256', SECRET_KEY)
        .update(message)
        .digest('hex');

    return `CEA algorithm=HmacSHA256, access-key=${ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`;
}

/**
 * 쿠팡 상품 검색 또는 검색 페이지 딥링크 생성
 * 1. 우선 API를 통해 직접적인 상품 링크를 찾습니다.
 * 2. 상품 링크가 없을 경우, 해당 키워드의 쿠팡 검색 결과 페이지 딥링크를 생성합니다.
 */
export async function getCoupangLink(keyword: string): Promise<string | null> {
    if (!ACCESS_KEY || !SECRET_KEY) {
        console.error('[Coupang] API keys are not configured');
        return null;
    }

    // 딥링크 생성 (파트너스 추적 링크)
    const targetSearchUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;
    const deeplinkPath = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';

    try {
        const deeplinkResponse = await axios.post(
            `https://api-gateway.coupang.com${deeplinkPath}`,
            { coupangUrls: [targetSearchUrl] },
            {
                headers: {
                    'Authorization': getAuthHeader('POST', deeplinkPath),
                    'Content-Type': 'application/json'
                }
            }
        );

        const raw = JSON.stringify(deeplinkResponse.data).slice(0, 300);
        console.error('[Coupang] status=' + deeplinkResponse.status + ' body=' + raw);

        const shortenUrl = deeplinkResponse.data?.data?.[0]?.shortenUrl;
        if (shortenUrl) return shortenUrl;

        console.error('[Coupang] shortenUrl not found in response');
        return null;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const errBody = JSON.stringify(error.response?.data).slice(0, 200);
            console.error('[Coupang] Error ' + error.response?.status + ': ' + errBody);
        } else {
            console.error('[Coupang] Error: ' + String(error).slice(0, 200));
        }
        return null;
    }
}
