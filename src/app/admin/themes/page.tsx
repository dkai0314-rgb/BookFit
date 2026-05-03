import { listThemes, type ThemePoolEntry } from '@/lib/firestore-models';
import AdminThemesClient from './AdminThemesClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminThemesPage() {
    let themes: ThemePoolEntry[] = [];
    let dbError: string | null = null;
    try {
        themes = await listThemes();
    } catch (error) {
        const err = error as Error;
        console.error('admin/themes query failed', err);
        dbError = err.message || 'Firestore 쿼리 실패';
    }

    return (
        <AdminThemesClient
            initial={themes.map((t) => ({
                ...t,
                createdAt: t.createdAt.toISOString(),
                usedAt: t.usedAt ? t.usedAt.toISOString() : null,
            }))}
            dbError={dbError}
        />
    );
}

export type SerializedTheme = Omit<ThemePoolEntry, 'createdAt' | 'usedAt'> & {
    createdAt: string;
    usedAt: string | null;
};
