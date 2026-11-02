import { revalidatePath } from 'next/cache';

/**
 * 레터가 생성·수정·삭제·발행될 때 ISR 캐시를 즉시 무효화한다 (YOLD-0441).
 * 홈·레터 목록·해당 슬러그 상세·sitemap. 다음 방문 시 재생성된다.
 */
export function revalidateLetterPaths(slugs: Array<string | null | undefined>): void {
    try {
        revalidatePath('/');
        revalidatePath('/bookfit-letter');
        revalidatePath('/sitemap.xml');
        for (const slug of new Set(slugs)) {
            if (slug) revalidatePath(`/bookfit-letter/${slug}`);
        }
    } catch (error) {
        // 캐시 무효화 실패가 저장 자체를 실패시키면 안 된다 — 1h 뒤 자연 갱신된다.
        console.error('revalidateLetterPaths failed', error);
    }
}
