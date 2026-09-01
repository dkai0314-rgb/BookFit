'use client';

import { useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { Trophy, Plus, Trash2, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

type ChallengeType = 'days' | 'bookCount';
type ChallengeStatus = 'active' | 'done' | 'expired';

type Challenge = {
    id: string;
    title: string;
    type: ChallengeType;
    targetCount: number;
    progress: number;
    deadline: string | null;
    status: ChallengeStatus;
};

const TYPE_LABEL: Record<ChallengeType, string> = {
    days: '일',
    bookCount: '권',
};

const STATUS_LABEL: Record<ChallengeStatus, string> = {
    active: '진행중',
    done: '완료',
    expired: '만료',
};

export default function ChallengesTab({ user }: { user: User }) {
    const [challenges, setChallenges] = useState<Challenge[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ChallengeType>('bookCount');
    const [targetCount, setTargetCount] = useState(3);
    const [deadline, setDeadline] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const token = await user.getIdToken();
            const res = await fetch('/api/challenges', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!cancelled) setChallenges(json.challenges || []);
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const createChallenge = async () => {
        if (!title.trim() || targetCount <= 0) return;
        setBusy(true);
        setError(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title: title.trim(),
                    type,
                    targetCount,
                    deadline: deadline || null,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json?.error || '생성 실패');
                return;
            }
            trackEvent({ name: 'challenge_create', type });
            setChallenges((prev) => [json.challenge, ...(prev ?? [])]);
            setTitle('');
            setTargetCount(3);
            setDeadline('');
            setFormOpen(false);
        } catch (e) {
            console.error(e);
            setError('네트워크 오류');
        } finally {
            setBusy(false);
        }
    };

    const bumpProgress = async (c: Challenge) => {
        const nextProgress = Math.min(c.progress + 1, c.targetCount);
        setChallenges(
            (prev) =>
                prev?.map((x) =>
                    x.id === c.id
                        ? { ...x, progress: nextProgress, status: nextProgress >= c.targetCount ? 'done' : x.status }
                        : x,
                ) ?? [],
        );
        const token = await user.getIdToken();
        await fetch('/api/challenges', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id: c.id, progress: nextProgress }),
        });
    };

    const remove = async (id: string) => {
        if (!confirm('이 챌린지를 삭제할까요?')) return;
        const token = await user.getIdToken();
        const res = await fetch(`/api/challenges?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setChallenges((prev) => prev?.filter((x) => x.id !== id) ?? []);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    전체 {challenges?.length ?? '...'}개 — 나만의 독서 목표를 만들어보세요.
                </p>
                <button
                    onClick={() => setFormOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-primary-foreground hover:bg-accent/90"
                >
                    <Plus className="w-3.5 h-3.5" /> 새 챌린지
                </button>
            </div>

            {formOpen && (
                <div className="mb-6 border border-border rounded-xl p-5 bg-secondary/30 space-y-3">
                    <input
                        type="text"
                        placeholder="챌린지 제목 (예: 10일 내에 완독하기)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-border rounded p-2 text-sm bg-background"
                    />
                    <div className="flex gap-3 flex-wrap items-center">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as ChallengeType)}
                            className="border border-border rounded p-2 text-sm bg-background"
                        >
                            <option value="bookCount">권 수 목표</option>
                            <option value="days">일수 목표</option>
                        </select>
                        <input
                            type="number"
                            min={1}
                            value={targetCount}
                            onChange={(e) => setTargetCount(Number(e.target.value))}
                            className="w-24 border border-border rounded p-2 text-sm bg-background"
                        />
                        <span className="text-sm text-muted-foreground">{TYPE_LABEL[type]}</span>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="border border-border rounded p-2 text-sm bg-background"
                        />
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <div className="flex gap-2">
                        <button
                            disabled={busy}
                            onClick={createChallenge}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded bg-accent text-primary-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-60"
                        >
                            {busy && <Loader2 className="w-3 h-3 animate-spin" />} 만들기
                        </button>
                        <button
                            onClick={() => setFormOpen(false)}
                            className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}

            {challenges === null ? (
                <div className="text-muted-foreground text-center py-12">불러오는 중...</div>
            ) : challenges.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-secondary/30 border border-border rounded-xl">
                    <Trophy className="w-8 h-8 mx-auto text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground">
                        아직 챌린지가 없어요. 작은 목표부터 시작해보세요.
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {challenges.map((c) => {
                        const pct = Math.min(100, Math.round((c.progress / c.targetCount) * 100));
                        return (
                            <li
                                key={c.id}
                                className="bg-background border border-border rounded-xl p-5 space-y-3 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-foreground">{c.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {c.progress}/{c.targetCount}
                                            {TYPE_LABEL[c.type]}
                                            {c.deadline
                                                ? ` · ~${new Date(c.deadline).toLocaleDateString('ko-KR')}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                                                c.status === 'done'
                                                    ? 'bg-accent/20 text-accent'
                                                    : 'bg-secondary text-muted-foreground'
                                            }`}
                                        >
                                            {STATUS_LABEL[c.status]}
                                        </span>
                                        <button
                                            onClick={() => remove(c.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                            aria-label="삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                {c.status === 'active' && (
                                    <button
                                        onClick={() => bumpProgress(c)}
                                        className="text-xs font-medium text-accent hover:underline"
                                    >
                                        +1 진행 기록하기
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
