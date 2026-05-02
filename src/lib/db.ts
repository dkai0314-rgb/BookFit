import { adminDb } from './firebase-admin';
import type * as admin from 'firebase-admin';

/**
 * Returns the initialized Firestore admin instance.
 * Throws if Firebase admin env vars are missing.
 */
export function getDb(): admin.firestore.Firestore {
    if (!adminDb) {
        throw new Error(
            'Firestore admin SDK not initialized. Check FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env.',
        );
    }
    return adminDb;
}

/** Returns null when adminDb is unavailable — useful for safe fallback in pages. */
export function tryDb(): admin.firestore.Firestore | null {
    return adminDb;
}

/** Convert Firestore Timestamp (or Date) to JS Date, or null. */
export function tsToDate(ts: unknown): Date | null {
    if (!ts) return null;
    if (ts instanceof Date) return ts;
    if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
        const fn = (ts as { toDate?: unknown }).toDate;
        if (typeof fn === 'function') return (fn as () => Date).call(ts);
    }
    return null;
}

export function tsToIso(ts: unknown): string | null {
    const d = tsToDate(ts);
    return d ? d.toISOString() : null;
}
