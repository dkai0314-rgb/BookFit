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
    curations: 'curations',
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

export type Curation = {
    id: string;
    theme: string;
    title: string;
    description: string;
    instaCaption: string | null;
    cardImageUrl: string | null;
    slug: string | null;
    category: string | null;
    curatorNote: string | null;
    seoTitle: string | null;
    seoDesc: string | null;
    ogImage: string | null;
    readingTime: number | null;
    publishedAt: Date | null;
    status: string; // draft | published
    viewCount: number;
    isFeatured: boolean;
    isPublished: boolean;
    bookIds: string[]; // book ids (denormalized join)
    createdAt: Date;
};

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

function curationFromDoc(doc: admin.firestore.DocumentSnapshot): Curation {
    const d = doc.data() ?? {};
    return {
        id: doc.id,
        theme: d.theme ?? '',
        title: d.title ?? '',
        description: d.description ?? '',
        instaCaption: d.instaCaption ?? null,
        cardImageUrl: d.cardImageUrl ?? null,
        slug: d.slug ?? null,
        category: d.category ?? null,
        curatorNote: d.curatorNote ?? null,
        seoTitle: d.seoTitle ?? null,
        seoDesc: d.seoDesc ?? null,
        ogImage: d.ogImage ?? null,
        readingTime: typeof d.readingTime === 'number' ? d.readingTime : null,
        publishedAt: tsToDate(d.publishedAt),
        status: d.status ?? 'draft',
        viewCount: typeof d.viewCount === 'number' ? d.viewCount : 0,
        isFeatured: !!d.isFeatured,
        isPublished: !!d.isPublished,
        bookIds: Array.isArray(d.bookIds) ? d.bookIds : [],
        createdAt: tsToDate(d.createdAt) ?? new Date(),
    };
}

function letterFromDoc(doc: admin.firestore.DocumentSnapshot): Letter {
    const d = doc.data() ?? {};
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

// ===== Curations =====

export async function getCuration(id: string): Promise<Curation | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db.collection(COLLECTIONS.curations).doc(id).get();
    if (!snap.exists) return null;
    return curationFromDoc(snap);
}

export async function getCurationBySlug(slug: string): Promise<Curation | null> {
    const db = tryDb();
    if (!db) return null;
    const snap = await db
        .collection(COLLECTIONS.curations)
        .where('slug', '==', slug)
        .limit(1)
        .get();
    if (snap.empty) return null;
    return curationFromDoc(snap.docs[0]);
}

export async function findCurationBySlug(
    slug: string,
    excludeId?: string,
): Promise<Curation | null> {
    const c = await getCurationBySlug(slug);
    if (c && excludeId && c.id === excludeId) return null;
    return c;
}

export type CurationListOpts = {
    status?: 'draft' | 'published';
    category?: string;
    requireSlug?: boolean;
    limit?: number;
    orderBy?: Array<{ field: string; dir: 'asc' | 'desc' }>;
};

export async function listCurations(opts: CurationListOpts = {}): Promise<Curation[]> {
    const db = tryDb();
    if (!db) return [];
    let q: admin.firestore.Query = db.collection(COLLECTIONS.curations);
    if (opts.status) q = q.where('status', '==', opts.status);
    if (opts.category) q = q.where('category', '==', opts.category);
    const orderBy = opts.orderBy ?? [{ field: 'createdAt', dir: 'desc' as const }];
    for (const o of orderBy) q = q.orderBy(o.field, o.dir);
    if (opts.limit) q = q.limit(opts.limit);
    const snap = await q.get();
    let list = snap.docs.map(curationFromDoc);
    if (opts.requireSlug) list = list.filter((c) => !!c.slug);
    return list;
}

export async function listCurationCategories(): Promise<string[]> {
    const list = await listCurations({ status: 'published' });
    const set = new Set<string>();
    for (const c of list) if (c.category) set.add(c.category);
    return Array.from(set);
}

export async function createCuration(data: {
    theme: string;
    title: string;
    description: string;
    instaCaption: string | null;
    slug: string;
    curatorNote: string | null;
    seoTitle: string | null;
    seoDesc: string | null;
    readingTime: number | null;
    bookIds: string[];
}): Promise<Curation> {
    const db = getDb();
    const id = randomUUID();
    const payload = {
        ...data,
        cardImageUrl: null,
        category: null,
        ogImage: null,
        publishedAt: null,
        status: 'draft',
        viewCount: 0,
        isFeatured: false,
        isPublished: false,
        createdAt: new Date(),
    };
    await db.collection(COLLECTIONS.curations).doc(id).set(payload);
    return { id, ...payload };
}

const CURATION_ALLOWED_FIELDS = new Set([
    'title',
    'description',
    'curatorNote',
    'seoTitle',
    'seoDesc',
    'ogImage',
    'cardImageUrl',
    'category',
    'slug',
    'isFeatured',
    'status',
    'isPublished',
    'readingTime',
    'instaCaption',
    'theme',
    'publishedAt',
    'viewCount',
]);

export async function updateCuration(
    id: string,
    data: Record<string, unknown>,
): Promise<Curation | null> {
    const db = getDb();
    const filtered: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
        if (CURATION_ALLOWED_FIELDS.has(k)) filtered[k] = v;
    }
    if (Object.keys(filtered).length === 0) return getCuration(id);
    await db.collection(COLLECTIONS.curations).doc(id).update(filtered);
    return getCuration(id);
}

export async function deleteCuration(id: string): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.curations).doc(id).delete();
}

export async function curationLatestForChoice(): Promise<Curation | null> {
    const list = await listCurations({
        status: 'published',
        limit: 1,
        orderBy: [
            { field: 'isFeatured', dir: 'desc' },
            { field: 'publishedAt', dir: 'desc' },
            { field: 'createdAt', dir: 'desc' },
        ],
    });
    return list[0] ?? null;
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
    limit?: number;
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
    q = q.orderBy('publishedAt', 'desc');
    if (opts.limit) q = q.limit(opts.limit);
    const snap = await q.get();
    return snap.docs.map(letterFromDoc);
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

// ===== Curation count helpers (admin) =====

export async function countCurations(opts: { status?: string; sinceDate?: Date } = {}): Promise<number> {
    const db = tryDb();
    if (!db) return 0;
    let q: admin.firestore.Query = db.collection(COLLECTIONS.curations);
    if (opts.status) q = q.where('status', '==', opts.status);
    if (opts.sinceDate) q = q.where('publishedAt', '>=', opts.sinceDate);
    const snap = await q.count().get();
    return snap.data().count;
}

// Re-export FieldValue for downstream increments etc.
export { FieldValue };
