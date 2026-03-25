
import axios from 'axios';
import { createHmac } from 'crypto';

const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY || '';
const SECRET_KEY = process.env.COUPANG_SECRET_KEY || '';

/**
 * 쿠팡 파트너스 API 인증 헤더 생성
 */
function getAuthHeader(method: string, path: string, query: string = '') {
    const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
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
        console.error('Coupang API keys are not configured');
        return null;
    }

    try {
        // 1. 상품 검색 시도
        const searchPath = '/v2/providers/v1/open/products/search';
        const searchQuery = `keyword=${encodeURIComponent(keyword)}&limit=1`;
        const searchUrl = `https://api-gateway.coupang.com${searchPath}?${searchQuery}`;
        
        const searchResponse = await axios.get(searchUrl, {
            headers: {
                'Authorization': getAuthHeader('GET', searchPath, `keyword=${keyword}&limit=1`),
                'Content-Type': 'application/json'
            }
        });

        if (searchResponse.data?.data?.productData?.length > 0) {
            return searchResponse.data.data.productData[0].productUrl;
        }
        console.warn('[Coupang] Product search returned no results for:', keyword);

        // 2. 검색 결과가 없을 경우, 검색 페이지 딥링크 생성
        const targetSearchUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;

        const deeplinkPath = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
        const deeplinkData = {
            coupangUrls: [targetSearchUrl]
        };

        const deeplinkResponse = await axios.post(`https://api-gateway.coupang.com${deeplinkPath}`, deeplinkData, {
            headers: {
                'Authorization': getAuthHeader('POST', deeplinkPath),
                'Content-Type': 'application/json'
            }
        });

        console.log('[Coupang] Deeplink response status:', deeplinkResponse.status, JSON.stringify(deeplinkResponse.data));

        if (deeplinkResponse.data?.data?.[0]?.shortenUrl) {
            return deeplinkResponse.data.data[0].shortenUrl;
        }

        return null;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('[Coupang] API Error:', error.response?.status, JSON.stringify(error.response?.data));
        } else {
            console.error('[Coupang] Unexpected Error:', error);
        }
        return null;
    }
}
