'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/Header';
import { BookOpen, PenLine, Trophy, BarChart3 } from 'lucide-react';
import ShelfTab from './ShelfTab';
import HighlightsTab from './HighlightsTab';
import ChallengesTab from './ChallengesTab';
import StatsTab from './StatsTab';

type MainTab = 'shelf' | 'highlights' | 'challenges' | 'stats';

const MAIN_TABS: { value: MainTab; label: string; icon: typeof BookOpen }[] = [
    { value: 'shelf', label: '서재', icon: BookOpen },
    { value: 'highlights', label: '하이라이트', icon: PenLine },
    { value: 'challenges', label: '챌린지', icon: Trophy },
    { value: 'stats', label: '통계', icon: BarChart3 },
];

export default function LibraryPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [mainTab, setMainTab] = useState<MainTab>('shelf');

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) {
                router.push('/login');
                return;
            }
            setUser(u);
            setAuthLoading(false);
        });
        return () => unsub();
    }, [router]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full mt-20">
                <div className="mb-8">
                    <Link href="/mypage" className="text-sm text-muted-foreground hover:underline">
                        ← 마이페이지
                    </Link>
                    <h1 className="text-3xl font-bold mt-1">내 독서기록장</h1>
                    <p className="text-muted-foreground mt-1">
                        책, 문장, 독서 습관을 한 곳에서 기록해요.
                    </p>
                </div>

                <div className="flex gap-2 border-b border-border mb-8 overflow-x-auto">
                    {MAIN_TABS.map((t) => {
                        const Icon = t.icon;
                        const active = mainTab === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => setMainTab(t.value)}
                                className={`px-4 py-3 text-sm font-medium inline-flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                                    active
                                        ? 'border-accent text-accent'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4" /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {mainTab === 'shelf' && <ShelfTab user={user} />}
                {mainTab === 'highlights' && <HighlightsTab user={user} />}
                {mainTab === 'challenges' && <ChallengesTab user={user} />}
                {mainTab === 'stats' && <StatsTab user={user} />}
            </main>
        </div>
    );
}
