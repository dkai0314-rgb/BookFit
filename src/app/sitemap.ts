import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

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
        safeQuery(
            () =>
                prisma.letter.findMany({
                    where: { status: 'PUBLISHED' },
                    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
                    take: 500,
                    select: { slug: true, publishedAt: true, updatedAt: true },
                }),
            [] as { slug: string; publishedAt: Date | null; updatedAt: Date }[],
        ),
        safeQuery(
            () =>
                prisma.curation.findMany({
                    where: { status: 'published', slug: { not: null } },
                    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
                    take: 500,
                    select: { slug: true, publishedAt: true, createdAt: true, category: true },
                }),
            [] as { slug: string | null; publishedAt: Date | null; createdAt: Date; category: string | null }[],
        ),
        safeQuery(
            () =>
                prisma.book.findMany({
                    where: { isChoice: true },
                    orderBy: { updatedAt: 'desc' },
                    take: 200,
                    select: { id: true, updatedAt: true },
                }),
            [] as { id: string; updatedAt: Date }[],
        ),
        safeQuery(
            () =>
                prisma.curation.findMany({
                    where: { status: 'published', category: { not: null } },
                    distinct: ['category'],
                    select: { category: true },
                }),
            [] as { category: string | null }[],
        ),
    ]);

    const letterUrls: MetadataRoute.Sitemap = letters.map((l) => ({
        url: `${BASE_URL}/bookfit-letter/${l.slug}`,
        lastModified: l.updatedAt || l.publishedAt || now,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const curationUrls: MetadataRoute.Sitemap = curations
        .filter((c): c is { slug: string; publishedAt: Date | null; createdAt: Date; category: string | null } =>
            !!c.slug,
        )
        .map((c) => ({
            url: `${BASE_URL}/curation/${c.slug}`,
            lastModified: c.publishedAt || c.createdAt,
            changeFrequency: 'monthly',
            priority: 0.7,
        }));

    const categoryUrls: MetadataRoute.Sitemap = Array.from(
        new Set(categories.map((c) => c.category).filter((s): s is string => !!s)),
    ).map((category) => ({
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
