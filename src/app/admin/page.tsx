import Link from 'next/link';
import {
    countLetters,
    listLetters,
    countShelfTotal,
    countShelfSince,
    listRecentDispatchLogs,
    sumDispatchSentCount,
} from '@/lib/firestore-models';
import { Mail, Sparkles, Bookmark, Send, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const sevenDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
};

const startOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

const safeQuery = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        console.error('admin/dashboard query failed', error);
        return fallback;
    }
};

export default async function AdminDashboardPage() {
    const since7d = sevenDaysAgo();
    const sinceMonth = startOfMonth();

    const [
        totalLetters,
        publishedLetters,
        weekLetters,
        monthLetters,
        monthlyPickCount,
        topLetters,
        totalShelf,
        weekShelf,
        recentDispatch,
        dispatchTotal,
    ] = await Promise.all([
        safeQuery(() => countLetters(), 0),
        safeQuery(() => countLetters({ status: 'PUBLISHED' }), 0),
        safeQuery(() => countLetters({ status: 'PUBLISHED', sinceDate: since7d }), 0),
        safeQuery(() => countLetters({ status: 'PUBLISHED', sinceDate: sinceMonth }), 0),
        safeQuery(
            () => listLetters({ status: 'PUBLISHED', kind: 'monthly_pick' }).then((l) => l.length),
            0,
        ),
        safeQuery(
            () =>
                listLetters({
                    status: 'PUBLISHED',
                    limit: 5,
                    orderBy: [
                        { field: 'viewCount', dir: 'desc' },
                        { field: 'publishedAt', dir: 'desc' },
                    ],
                }),
            [] as Awaited<ReturnType<typeof listLetters>>,
        ),
        safeQuery(() => countShelfTotal(), 0),
        safeQuery(() => countShelfSince(since7d), 0),
        safeQuery(() => listRecentDispatchLogs(5), [] as Awaited<ReturnType<typeof listRecentDispatchLogs>>),
        safeQuery(() => sumDispatchSentCount(), 0),
    ]);

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans text-gray-900">
            <header className="flex items-end justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        BookFit Admin
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">콘텐츠 발행 / 발송 / 사용자 활동 한 눈에 보기</p>
                </div>
                <nav className="flex gap-2 flex-wrap">
                    <AdminLink href="/admin/letters" label="북핏레터" />
                </nav>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<Mail className="w-5 h-5" />}
                    label="이번주 발행 레터"
                    value={`${weekLetters}건`}
                    sub={`전체 published ${publishedLetters} / 총 ${totalLetters}`}
                />
                <KpiCard
                    icon={<Sparkles className="w-5 h-5" />}
                    label="이번달 발행 회차"
                    value={`${monthLetters}건`}
                    sub={`이달의 픽 ${monthlyPickCount}건 포함`}
                />
                <KpiCard
                    icon={<Bookmark className="w-5 h-5" />}
                    label="이번주 신규 북마크"
                    value={`${weekShelf}건`}
                    sub={`전체 ${totalShelf}건`}
                />
                <KpiCard
                    icon={<Send className="w-5 h-5" />}
                    label="총 메일 발송 수"
                    value={`${dispatchTotal.toLocaleString()}통`}
                    sub={`최근 발송 ${recentDispatch.length}건 로그 보유`}
                />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Panel title="인기 레터 Top 5" icon={<BarChart3 className="w-5 h-5" />}>
                    {topLetters.length === 0 ? (
                        <EmptyHint>아직 published 레터가 없습니다.</EmptyHint>
                    ) : (
                        <ol className="space-y-2">
                            {topLetters.map((l, i) => (
                                <li
                                    key={l.id}
                                    className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="font-semibold truncate">{l.headlineTitle || l.title}</div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {l.kind === 'monthly_pick' ? '이달의 픽' : l.kind === 'weekly' ? '이주의 한 권' : '스페셜'}
                                                {l.category ? ` · ${l.category}` : ''}
                                                {l.publishedAt
                                                    ? ` · ${new Date(l.publishedAt).toLocaleDateString('ko-KR')}`
                                                    : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-bold">{l.viewCount.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">view</div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </Panel>

                <Panel title="최근 메일 발송 로그" icon={<Send className="w-5 h-5" />}>
                    {recentDispatch.length === 0 ? (
                        <EmptyHint>발송 로그가 없습니다. Letter publish 시 자동 기록됩니다.</EmptyHint>
                    ) : (
                        <ul className="space-y-2">
                            {recentDispatch.map((d) => (
                                <li
                                    key={d.id}
                                    className="p-3 rounded-lg border bg-white flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm">
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-bold mr-2">
                                                {d.type}
                                            </span>
                                            <span className="font-mono text-xs text-gray-500 truncate inline-block max-w-[200px] align-middle">
                                                {d.targetId}
                                            </span>
                                        </div>
                                        {d.errorMessage && (
                                            <div className="text-xs text-red-600 mt-1 truncate">
                                                err: {d.errorMessage}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-bold">{d.sentCount.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(d.sentAt).toLocaleDateString('ko-KR')}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </section>
        </div>
    );
}

function AdminLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="px-4 py-2 rounded-md border border-gray-200 bg-white text-sm font-medium hover:border-primary hover:text-primary transition-all"
        >
            {label} →
        </Link>
    );
}

function KpiCard({
    icon,
    label,
    value,
    sub,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-gray-600 text-xs font-bold uppercase tracking-widest">
                {icon}
                {label}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {sub && <div className="text-xs text-gray-500">{sub}</div>}
        </div>
    );
}

function Panel({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                {icon}
                {title}
            </div>
            {children}
        </div>
    );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
    return <div className="text-sm text-gray-500 text-center py-6">{children}</div>;
}
