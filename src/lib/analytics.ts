/**
 * Google Analytics 4 helper.
 * Calls gtag if window.gtag is available; no-ops otherwise.
 */

declare global {
    interface Window {
        gtag?: (
            command: 'event' | 'config' | 'js' | 'set',
            ...args: unknown[]
        ) => void;
        dataLayer?: unknown[];
    }
}

export type AnalyticsEvent =
    | { name: 'recommend_complete'; mode: 'TASTE' | 'MIND'; resultCount: number }
    | { name: 'letter_view'; slug: string }
    | { name: 'curation_view'; slug: string }
    | { name: 'coupang_click'; bookId?: string; bookTitle?: string }
    | { name: 'shelf_add'; bookId: string; status: 'want' | 'reading' | 'done' }
    | { name: 'shelf_remove'; bookId: string }
    | { name: 'personal_recommend_view'; cached: boolean };

export function trackEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const { name, ...params } = event;
    window.gtag('event', name, params);
}
