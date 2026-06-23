/**
 * 쿠팡 어필리에이트 검색 URL 빌더 (폴백용).
 *
 * 정상 경로: `getCoupangLink(keyword)` → 쿠팡 deeplink API (`link.coupang.com/a/...`).
 * 폴백 경로: API 실패/미가용 시 이 함수가 만든 AFFSRP URL을 쓴다.
 *
 * AFFSRP 엔드포인트는 쿠팡 파트너스 검색 redirect 표준. `lptag` 파라미터로 트래킹 ID(AF...)가 부착되어
 * 클릭이 본 계정 어필리에이트로 기록된다. 단순 `coupang.com/np/search?q=...`는 어필리에이트 트래킹 없음.
 */
const COUPANG_AFFILIATE_TAG = 'AF7778504';

export function buildCoupangAffiliateSearch(keyword: string): string {
    const pageKey = encodeURIComponent(keyword);
    return `https://link.coupang.com/re/AFFSRP?pageKey=${pageKey}&lptag=${COUPANG_AFFILIATE_TAG}`;
}
