
import axios from 'axios';
import crypto from 'crypto';

const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY || '';
const SECRET_KEY = process.env.COUPANG_SECRET_KEY || '';

/**
 * 쿠팡 파트너스 API 인증 헤더 생성
 */
function getAuthHeader(method: string, path: string, query: string = '') {
    const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
    const message = datetime + method + path + query;

    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(message)
        .digest('hex');

    return `CEA algorithm=HmacSHA256, access-key=${ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`;
}

/**
 * 쿠팡 상품 검색 및 딥링크 생성
 * 파트너스 API를 통해 가장 관련성 높은 상품 하나를 찾아 딥링크를 반환합니다.
 */
export async function getCoupangLink(keyword: string): Promise<string | null> {
    if (!ACCESS_KEY || !SECRET_KEY) {
        console.error('Coupang API keys are not configured');
        return null;
    }

    try {
        const method = 'GET';
        const path = '/v2/providers/v1/open/products/search';
        const query = `keyword=${encodeURIComponent(keyword)}&limit=1`;
        
        const url = `https://api-gateway.coupang.com${path}?${query}`;
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': getAuthHeader(method, path, `keyword=${keyword}&limit=1`),
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.data && response.data.data.productData && response.data.data.productData.length > 0) {
            // 쿠팡 파트너스 딥링크 생성 API를 호출하거나, 검색 API가 리턴하는 숏링크(productUrl)를 사용
            // 검색 API의 결과에는 이미 파트너스 링크가 포함된 productUrl이 올 수 있음
            return response.data.data.productData[0].productUrl || null;
        }

        return null;
    } catch (error) {
        console.error('Coupang API Search Error:', error);
        return null;
    }
}
