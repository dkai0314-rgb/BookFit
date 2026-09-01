'use client';

import { useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { BookCheck, PenLine, Trophy, Bookmark } from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

type ShelfEntry = { status: 'want' | 'reading' | 'done'; updatedAt: string };
type HighlightEntry = { createdAt: string };
type Challenge = { status: 'active' | 'done' | 'expired' };

function monthKey(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월`;
}

function lastSixMonthLabels(): string[] {
    const labels: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(`${d.getMonth() + 1}월`);
    }
    return labels;
}

export default function StatsTab({ user }: { user: User }) {
    const [shelf, setShelf] = useState<ShelfEntry[] | null>(null);
    const [highlights, setHighlights] = useState<HighlightEntry[] | null>(null);
    const [challenges, setChallenges] = useState<Challenge[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const token = await user.getIdToken();
            const [shelfRes, highlightRes, challengeRes] = await Promise.all([
                fetch('/api/shelf', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/highlights', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/challenges', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const [shelfJson, highlightJson, challengeJson] = await Promise.all([
                shelfRes.json(),
                highlightRes.json(),
                challengeRes.json(),
            ]);
            if (cancelled) return;
            setShelf(shelfJson.entries || []);
            setHighlights(highlightJson.highlights || []);
            setChallenges(challengeJson.challenges || []);
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    if (shelf === null || highlights === null || challenges === null) {
        return <div className="text-muted-foreground text-center py-12">불러오는 중...</div>;
    }

    const doneCount = shelf.filter((e) => e.status === 'done').length;
    const readingCount = shelf.filter((e) => e.status === 'reading').length;
    const activeChallenges = challenges.filter((c) => c.status === 'active').length;
    const doneChallenges = challenges.filter((c) => c.status === 'done').length;

    const labels = lastSixMonthLabels();
    const doneByMonth = new Map(labels.map((l) => [l, 0]));
    shelf
        .filter((e) => e.status === 'done')
        .forEach((e) => {
            const key = monthKey(e.updatedAt);
            if (doneByMonth.has(key)) {
                doneByMonth.set(key, (doneByMonth.get(key) ?? 0) + 1);
            }
        });
    const chartData = labels.map((label) => ({ month: label, 완독: doneByMonth.get(label) ?? 0 }));

    const cards = [
        { label: '완독한 책', value: doneCount, icon: BookCheck },
        { label: '읽는 중', value: readingCount, icon: Bookmark },
        { label: '남긴 하이라이트', value: highlights.length, icon: PenLine },
        { label: '진행중 챌린지', value: activeChallenges, icon: Trophy },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((c) => {
                    const Icon = c.icon;
                    return (
                        <div
                            key={c.label}
                            className="bg-background border border-border rounded-xl p-5 space-y-2"
                        >
                            <Icon className="w-5 h-5 text-accent" />
                            <div className="text-2xl font-bold text-foreground">{c.value}</div>
                            <div className="text-xs text-muted-foreground">{c.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-background border border-border rounded-xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-4">최근 6개월 완독 추이</h3>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" fontSize={12} stroke="var(--muted-foreground)" />
                            <YAxis allowDecimals={false} fontSize={12} stroke="var(--muted-foreground)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                            />
                            <Bar dataKey="완독" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {challenges.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    챌린지 완료 {doneChallenges}개 / 전체 {challenges.length}개
                </p>
            )}
        </div>
    );
}
