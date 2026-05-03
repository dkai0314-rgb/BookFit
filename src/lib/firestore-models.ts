import { getDb, tryDb, tsToDate } from './db';
import type * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';

const FieldValue = (() => {
    // Lazy require to avoid client bundling.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('firebase-admin').firestore.FieldValue;
})();

const COLLECTIONS = {
    books: 'books',
    letters: 'letters',
    monthlyBestsellers: 'monthlyBestsellers',
    templateRequests: 'templateRequests',
    emailDispatchLogs: 'emailDispatchLogs',
    personalRecommendCaches: 'personalRecommendCaches',
} as const;

// ===== Types =====

export type Book = {
    id: string;
    title: string;
    author: string;
    category: string;
    description: string;
    summary: string | null;
    recommendation: string | null;
    imageUrl: string | null;
    purchaseLink: string | null;
    isChoice: boolean;
    createdAt: Date;
    updatedAt: Date;
};

// Curation type/helpers는 W6에서 Letter로 흡수됨 — kind: 'monthly_pick' 으로 사용.

export type LetterKind = 'weekly' | 'monthly_pick' | 'special';

export const LETTER_KINDS: LetterKind[] = ['weekly', 'monthly_pick', 'special'];

export type Letter = {
    id: string; // = slug (we use slug as doc id)
    slug: string;
    title: string;
    publishedAt: Date | null;
    status: string; // draft | published / DRAFT | PUBLISHED
    source: string;
    googleVolumeId: string | null;
    isbn13: string | null;
    authors: string | null;
    publisher: string | null;
    publishedDate: string | null;
    categories: string | null;
    coverImageUrl: string | null;
    headlineTitle: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    contentMarkdown: string;
    tags: string | null;
    readingTime: number | null;
    ogImageUrl: string | null;
    seoKeywords: string | null;
    createdAt: Date;
    updatedAt: Date;

    // W6 — 큐레이션 흡수 (이달의북핏 ↔ 북핏레터 통합)
    kind: LetterKind;          // 'weekly'(단권 1) | 'monthly_pick'(3권 묶음) | 'special'(자유)
    bookIds: string[];         // 회차에 묶인 책. weekly=1, monthly_pick=3+, special=0~N
    curatorNote: string | null; // 도입 단락 (큐레이터 시각)
    category: string | null;   // 분류 ("감정","계절","직군","트렌드" 등)
    isFeatured: boolean;       // 홈/목록 우선 노출
    viewCount: number;
};

export type MonthlyBestseller = {
    id: string;
    snapshotMonth: string;
    rank: number;
    isbn13: string;
    title: string;
    author: string;
    publisher: string;
    coverUrl: string;
    categoryName: string | null;
    description: string | null;
    link: string | null;
    source: string;
    createdAt: Date;
};

export type ShelfStatus = 'want' | 'reading' | 'done';

export type UserBookShelfEntry = {
    id: string;
    userId: string;
    bookId: string;
    status: ShelfStatus;
    rating: number | null;
    oneLiner: string | null;
    createdAt: Date;
    updatedAt: Date;
    book?: Book;
};

export type EmailDispatchLog = {
    id: string;
    type: 'letter' | 'curation';
    targetId: string;
    sentCount: number;
    errorMessage: string | null;
    sentAt: Date;
};

export type PersonalRecommendCacheEntry = {
    id: string;
    userId: string;
    fingerprint: string;
    payload: string;
    expiresAt: Date;
    createdAt: Date;
};

// ===== Converters =====

function bookFromDoc(doc: admin.firestore.DocumentSnapshot): Book {
    const d = doc.data() ?? {};
    return {
        id: doc.id,
        title: d.title ?? '',
        author: d.author ?? '',
        category: d.category ?? '',
        description: d.description ?? '',
        summary: d.summary ?? null,
        recommendation: d.recommendation ?? null,
        imageUrl: d.imageUrl ?? null,
        purchaseLink: d.purchaseLink ?? null,
        isChoice: !!d.isChoice,
        createdAt: tsToDate(d.createdAt) ?? new Date(),
        updatedAt: tsToDate(d.updatedAt) ?? new Date(),
    };
}

function letterFromDoc(doc: admin.firestore.DocumentSnapshot): Letter {
    const d = doc.data() ?? {};
    const rawKind = d.kind;
    const kind: LetterKind =
        rawKind === 'monthly_pick' || rawKind === 'special' ? rawKind : 'weekly';
    return {
        id: doc.id,
        slug: d.slug ?? doc.id,
        title: d.title ?? '',
        publishedAt: tsToDate(d.publishedAt),
        status: d.status ?? 'draft',
        source: d.source ?? 'aladin',
        googleVolumeId: d.googleVolumeId ?? null,
        isbn13: d.isbn13 ?? null,
        authors: d.authors ?? null,
        publisher: d.publisher ?? null,
        publishedDate: d.publishedDate ?? null,
        categories: d.categories ?? null,
        coverImageUrl: d.coverImageUrl ?? null,
        headlineTitle: d.headlineTitle ?? null,
        metaTitle: d.metaTitle ?? null,
        metaDescription: d.metaDescription ?? null,
        contentMarkdown: d.contentMarkdown ?? '',
        tags: d.tags ?? null,
        readingTime: typeof d.readingTime === 'number' ? d.readingTime : null,
        ogImageUrl: d.ogImageUrl ?? null,
        seoKeywords: d.seoKeywords ?? null,
        createdAt: tsToDate(d.createdAt) ?? new Date(),
        updatedAt: tsToDate(d.updatedAt) ?? new Date(),
        kind,
        bookIds: Array.isArray(d.bookIds) ? d.bookIds : [],
        curatorNote: d.curatorNote ?? null,
        category: d.category ?? null,
        isFeatured: !!d.isFeatured,
        viewCount: typeof d.viewCount === 'number' ? d.viewCount : 0,
    };
}

function bestsellerFromDoc(doc: admin.firestore.DocumentSnapshot): MonthlyBestseller {
    const d = doc.data() ?? {};
    return {
        id: doc.id,
        snapshotMonth: d.snapshotMonth ?? '',
        rank: typeof d.rank === 'number' ? d.rank : 0,
        isbn13: d.isbn13 ?? '',
        title: d.title ?? '',
        author: d.author ?? '',
        publisher: d.publisher ?? '',
        coverUrl: d.coverUrl ?? '',
        categoryName: d.categoryName ?? null,
        description: d.description ?? null,
        link: d.link ?? null,
        source: d.source ?? 'aladin',
        createdAt: tsToDate(d.createdAt) ?? new Date(),
    };
}

function shelfFromDoc(
    doc: admin.firestore.DocumentSnapshot,
    userId: string,
): UserBookShelfEntry {
    const d = doc.data() ?? {};
    return {
        id: doc.id,
        userId,
        bookId: doc.id,
        status: (d.status ?? 'want') as ShelfStatus,
        rating: typeof d.rating === 'number' ? d.rating : null,
        oneLiner: d.oneLiner ?? null,
        createdAt: tsToDate(d.createdAt) ?? new Date(),
        updatedAt: tsToDate(d.updatedAt) ?? new Date(),
    };
}

function dispatchLogFromDoc(doc: admin.firestore.DocumentSnapshot): EmailDispatchLog {
    const d = doc.data() ?? {};
    return {
        id: doc.id,
        type: (d.type ?? 'letter') as 'letter' | 'curation',
        targetId: d.targetId ?? '',
        sentCount: typeof d.sentCount === 'number' ? d.sentCount : 0,
        errorMessage: d.errorMessage ?? null,
        sentAt: tsToDate(d.sentAt) ?? new Date(),
    };
}

function cacheFromDoc(
    doc: admin.firestore.DocumentSnapshot,
): PersonalRecommendCacheEntry {
    const d = doc.data() ?? {};
    return {
        id: doc.id,
        userId: d.userId ?? '',
        fingerprint: d.fingerprint ?? '',
        payload: d.payload ?? '',
        expiresAt: tsToDate(d.expiresAt) ?? new Date(0),
        createdAt: tsToDate(d.createdAt) ?? new Date(),
    };
}

// ===== Books =====

export async function getBook(id: string): Promise<Book | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db.collection(COLLECTIONS.books).doc(id).get();
    if (!snap.exists) return null;
    return bookFromDoc(snap);
}

export async function listIsChoiceBooks(limit = 200): Promise<Book[]> {
    const db = tryDb();
    if (!db) return [];
    const snap = await db
        .collection(COLLECTIONS.books)
        .where('isChoice', '==', true)
        .orderBy('updatedAt', 'desc')
        .limit(limit)
        .get();
    return snap.docs.map(bookFromDoc);
}

export async function findBookByTitle(title: string): Promise<Book | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db
        .collection(COLLECTIONS.books)
        .where('title', '==', title)
        .limit(1)
        .get();
    if (snap.empty) return null;
    return bookFromDoc(snap.docs[0]);
}

export async function getBooksByIds(ids: string[]): Promise<Book[]> {
    const db = tryDb();
    if (!db || ids.length === 0) return [];
    // Firestore in-query supports up to 30 ids per chunk.
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
    const results: Book[] = [];
    for (const chunk of chunks) {
        const refs = chunk.map((id) => db.collection(COLLECTIONS.books).doc(id));
        const snaps = await db.getAll(...refs);
        for (const snap of snaps) {
            if (snap.exists) results.push(bookFromDoc(snap));
        }
    }
    return results;
}

export async function createBook(data: {
    title: string;
    author: string;
    category: string;
    description: string;
    imageUrl: string | null;
    purchaseLink: string | null;
    recommendation: string | null;
}): Promise<Book> {
    const db = getDb();
    const id = randomUUID();
    const now = new Date();
    const payload = {
        ...data,
        summary: null,
        isChoice: false,
        createdAt: now,
        updatedAt: now,
    };
    await db.collection(COLLECTIONS.books).doc(id).set(payload);
    return { id, ...payload };
}

// ===== Letters =====

export async function getLetterBySlug(slug: string): Promise<Letter | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db.collection(COLLECTIONS.letters).doc(slug).get();
    if (!snap.exists) return null;
    return letterFromDoc(snap);
}

export type LetterListOpts = {
    status?: string; // 'PUBLISHED' or 'published'
    kind?: LetterKind;
    category?: string;
    limit?: number;
    orderBy?: Array<{ field: string; dir: 'asc' | 'desc' }>;
};

export async function listLetters(opts: LetterListOpts = {}): Promise<Letter[]> {
    const db = tryDb();
    if (!db) return [];
    let q: admin.firestore.Query = db.collection(COLLECTIONS.letters);
    if (opts.status) {
        // Letters use uppercase status historically; accept both.
        const statuses = [opts.status, opts.status.toLowerCase(), opts.status.toUpperCase()];
        q = q.where('status', 'in', Array.from(new Set(statuses)));
    }
    if (opts.kind) q = q.where('kind', '==', opts.kind);
    if (opts.category) q = q.where('category', '==', opts.category);
    const orderBy = opts.orderBy ?? [{ field: 'publishedAt', dir: 'desc' as const }];
    for (const o of orderBy) q = q.orderBy(o.field, o.dir);
    if (opts.limit) q = q.limit(opts.limit);
    const snap = await q.get();
    return snap.docs.map(letterFromDoc);
}

export type LetterWithBooks = Letter & { books: Book[] };

export async function listLettersWithBooks(
    opts: LetterListOpts = {},
): Promise<LetterWithBooks[]> {
    const letters = await listLetters(opts);
    const allBookIds = Array.from(new Set(letters.flatMap((l) => l.bookIds)));
    const books = await getBooksByIds(allBookIds);
    const bookMap = new Map(books.map((b) => [b.id, b]));
    return letters.map((l) => ({
        ...l,
        books: l.bookIds.map((id) => bookMap.get(id)).filter((b): b is Book => !!b),
    }));
}

export async function getLetterWithBooks(slug: string): Promise<LetterWithBooks | null> {
    const letter = await getLetterBySlug(slug);
    if (!letter) return null;
    const books = await getBooksByIds(letter.bookIds);
    return { ...letter, books };
}

export async function listLetterCategories(): Promise<string[]> {
    const list = await listLetters({ status: 'PUBLISHED' });
    const set = new Set<string>();
    for (const l of list) if (l.category) set.add(l.category);
    return Array.from(set);
}

export async function findLetterBySlug(
    slug: string,
    excludeId?: string,
): Promise<Letter | null> {
    const l = await getLetterBySlug(slug);
    if (l && excludeId && l.id === excludeId) return null;
    return l;
}

export async function deleteLetter(slug: string): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.letters).doc(slug).delete();
}

export async function upsertLetter(
    slug: string,
    data: Omit<Partial<Letter>, 'id' | 'slug' | 'createdAt' | 'updatedAt'> & {
        title: string;
        contentMarkdown: string;
    },
): Promise<Letter> {
    const db = getDb();
    const ref = db.collection(COLLECTIONS.letters).doc(slug);
    const existing = await ref.get();
    const now = new Date();
    if (existing.exists) {
        await ref.update({ ...data, updatedAt: now });
    } else {
        await ref.set({
            ...data,
            slug,
            createdAt: now,
            updatedAt: now,
        });
    }
    const after = await ref.get();
    return letterFromDoc(after);
}

export async function countLetters(opts: { status?: string; sinceDate?: Date } = {}): Promise<number> {
    const db = tryDb();
    if (!db) return 0;
    let q: admin.firestore.Query = db.collection(COLLECTIONS.letters);
    if (opts.status) {
        const statuses = [opts.status, opts.status.toLowerCase(), opts.status.toUpperCase()];
        q = q.where('status', 'in', Array.from(new Set(statuses)));
    }
    if (opts.sinceDate) q = q.where('publishedAt', '>=', opts.sinceDate);
    const snap = await q.count().get();
    return snap.data().count;
}

// ===== MonthlyBestsellers =====

export async function getLatestBestsellerMonth(): Promise<string | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db
        .collection(COLLECTIONS.monthlyBestsellers)
        .orderBy('snapshotMonth', 'desc')
        .limit(1)
        .get();
    if (snap.empty) return null;
    const d = snap.docs[0].data();
    return d.snapshotMonth ?? null;
}

export async function listBestsellersForMonth(
    snapshotMonth: string,
    limit = 8,
): Promise<MonthlyBestseller[]> {
    const db = tryDb();
    if (!db) return [];
    const snap = await db
        .collection(COLLECTIONS.monthlyBestsellers)
        .where('snapshotMonth', '==', snapshotMonth)
        .orderBy('rank', 'asc')
        .limit(limit)
        .get();
    return snap.docs.map(bestsellerFromDoc);
}

// ===== UserBookShelf =====

export async function getShelfEntry(
    userId: string,
    bookId: string,
): Promise<UserBookShelfEntry | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db
        .collection('users')
        .doc(userId)
        .collection('shelf')
        .doc(bookId)
        .get();
    if (!snap.exists) return null;
    return shelfFromDoc(snap, userId);
}

export async function listShelfEntries(
    userId: string,
): Promise<UserBookShelfEntry[]> {
    const db = tryDb();
    if (!db) return [];
    const snap = await db
        .collection('users')
        .doc(userId)
        .collection('shelf')
        .orderBy('updatedAt', 'desc')
        .get();
    const entries = snap.docs.map((d) => shelfFromDoc(d, userId));
    if (entries.length === 0) return entries;
    const books = await getBooksByIds(entries.map((e) => e.bookId));
    const bookMap = new Map(books.map((b) => [b.id, b]));
    for (const e of entries) {
        e.book = bookMap.get(e.bookId);
    }
    return entries;
}

export async function upsertShelfEntry(
    userId: string,
    bookId: string,
    data: { status: ShelfStatus; rating?: number | null; oneLiner?: string | null },
): Promise<UserBookShelfEntry> {
    const db = getDb();
    const ref = db.collection('users').doc(userId).collection('shelf').doc(bookId);
    const existing = await ref.get();
    const now = new Date();
    const payload = {
        status: data.status,
        rating: data.rating ?? null,
        oneLiner: data.oneLiner ?? null,
        updatedAt: now,
    };
    if (existing.exists) {
        await ref.update(payload);
    } else {
        await ref.set({ ...payload, createdAt: now });
    }
    const after = await ref.get();
    return shelfFromDoc(after, userId);
}

export async function deleteShelfEntry(userId: string, bookId: string): Promise<void> {
    const db = getDb();
    await db.collection('users').doc(userId).collection('shelf').doc(bookId).delete();
}

export async function countShelfTotal(): Promise<number> {
    const db = tryDb();
    if (!db) return 0;
    const snap = await db.collectionGroup('shelf').count().get();
    return snap.data().count;
}

export async function countShelfSince(sinceDate: Date): Promise<number> {
    const db = tryDb();
    if (!db) return 0;
    const snap = await db
        .collectionGroup('shelf')
        .where('createdAt', '>=', sinceDate)
        .count()
        .get();
    return snap.data().count;
}

// ===== EmailDispatchLog =====

export async function findRecentSuccessfulDispatch(
    type: 'letter' | 'curation',
    targetId: string,
): Promise<EmailDispatchLog | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db
        .collection(COLLECTIONS.emailDispatchLogs)
        .where('type', '==', type)
        .where('targetId', '==', targetId)
        .where('errorMessage', '==', null)
        .orderBy('sentAt', 'desc')
        .limit(1)
        .get();
    if (snap.empty) return null;
    return dispatchLogFromDoc(snap.docs[0]);
}

export async function createDispatchLog(data: {
    type: 'letter' | 'curation';
    targetId: string;
    sentCount: number;
    errorMessage: string | null;
}): Promise<EmailDispatchLog> {
    const db = getDb();
    const id = randomUUID();
    const payload = { ...data, sentAt: new Date() };
    await db.collection(COLLECTIONS.emailDispatchLogs).doc(id).set(payload);
    return { id, ...payload };
}

export async function listRecentDispatchLogs(limit = 5): Promise<EmailDispatchLog[]> {
    const db = tryDb();
    if (!db) return [];
    const snap = await db
        .collection(COLLECTIONS.emailDispatchLogs)
        .orderBy('sentAt', 'desc')
        .limit(limit)
        .get();
    return snap.docs.map(dispatchLogFromDoc);
}

export async function sumDispatchSentCount(): Promise<number> {
    const db = tryDb();
    if (!db) return 0;
    const snap = await db.collection(COLLECTIONS.emailDispatchLogs).get();
    let total = 0;
    for (const doc of snap.docs) {
        const d = doc.data();
        if (typeof d.sentCount === 'number') total += d.sentCount;
    }
    return total;
}

// ===== PersonalRecommendCache =====

function cacheDocId(userId: string, fingerprint: string): string {
    return `${userId}_${fingerprint}`;
}

export async function getPersonalRecommendCache(
    userId: string,
    fingerprint: string,
): Promise<PersonalRecommendCacheEntry | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db
        .collection(COLLECTIONS.personalRecommendCaches)
        .doc(cacheDocId(userId, fingerprint))
        .get();
    if (!snap.exists) return null;
    return cacheFromDoc(snap);
}

export async function upsertPersonalRecommendCache(
    userId: string,
    fingerprint: string,
    payload: string,
    expiresAt: Date,
): Promise<void> {
    const db = getDb();
    await db
        .collection(COLLECTIONS.personalRecommendCaches)
        .doc(cacheDocId(userId, fingerprint))
        .set({
            userId,
            fingerprint,
            payload,
            expiresAt,
            createdAt: new Date(),
        });
}

// Re-export FieldValue for downstream increments etc.
export { FieldValue };
