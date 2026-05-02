import { MetadataRoute } from 'next';
import {
    listLetters,
    listCurations,
    listIsChoiceBooks,
    listCurationCategories,
} from '@/lib/firestore-models';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BASE_URL = 'https://bookfit.kr';

const STATIC_ROUTES: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/curation`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/recommend`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/bestsellers`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/bookfit-letter`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/search`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/newsletter`, changeFrequency: 'monthly', priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const safeQuery = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
        try {
            return await fn();
        } catch (error) {
            console.error('sitemap query failed', error);
            return fallback;
        }
    };

    const [letters, curations, popularBooks, categories] = await Promise.all([
        safeQuery(() => listLetters({ status: 'PUBLISHED', limit: 500 }), []),
        safeQuery(
            () =>
                listCurations({
                    status: 'published',
                    requireSlug: true,
                    limit: 500,
                    orderBy: [
                        { field: 'publishedAt', dir: 'desc' },
                        { field: 'createdAt', dir: 'desc' },
                    ],
                }),
            [],
        ),
        safeQuery(() => listIsChoiceBooks(200), []),
        safeQuery(() => listCurationCategories(), [] as string[]),
    ]);

    const letterUrls: MetadataRoute.Sitemap = letters.map((l) => ({
        url: `${BASE_URL}/bookfit-letter/${l.slug}`,
        lastModified: l.updatedAt || l.publishedAt || now,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const curationUrls: MetadataRoute.Sitemap = curations
        .filter((c) => !!c.slug)
        .map((c) => ({
            url: `${BASE_URL}/curation/${c.slug}`,
            lastModified: c.publishedAt || c.createdAt,
            changeFrequency: 'monthly',
            priority: 0.7,
        }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${BASE_URL}/curation/category/${encodeURIComponent(category)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
    }));

    const bookUrls: MetadataRoute.Sitemap = popularBooks.map((b) => ({
        url: `${BASE_URL}/books/${b.id}`,
        lastModified: b.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
    }));

    return [
        ...STATIC_ROUTES.map((r) => ({ ...r, lastModified: now })),
        ...letterUrls,
        ...curationUrls,
        ...categoryUrls,
        ...bookUrls,
    ];
}
