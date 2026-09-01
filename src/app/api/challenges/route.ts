import { NextResponse } from 'next/server';
import {
    listChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    type ChallengeType,
    type ChallengeStatus,
} from '@/lib/firestore-models';
import { requireAuthUser } from '@/lib/auth';

const ALLOWED_TYPE = new Set<ChallengeType>(['days', 'bookCount']);
const ALLOWED_STATUS = new Set<ChallengeStatus>(['active', 'done', 'expired']);

export async function GET(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    const challenges = await listChallenges(user.uid);
    return NextResponse.json({ challenges });
}

export async function POST(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    let body: {
        title?: string;
        type?: string;
        targetCount?: number;
        deadline?: string | null;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    if (!body.title?.trim() || !body.type || !ALLOWED_TYPE.has(body.type as ChallengeType)) {
        return NextResponse.json(
            { error: 'title 과 유효한 type(days|bookCount)이 필요합니다.' },
            { status: 400 },
        );
    }

    const targetCount = Number(body.targetCount);
    if (!Number.isFinite(targetCount) || targetCount <= 0) {
        return NextResponse.json({ error: '유효한 targetCount가 필요합니다.' }, { status: 400 });
    }

    const created = await createChallenge(user.uid, {
        title: body.title.trim(),
        type: body.type as ChallengeType,
        targetCount,
        deadline: body.deadline ? new Date(body.deadline) : null,
    });

    return NextResponse.json({ challenge: created });
}

export async function PATCH(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    let body: { id?: string; progress?: number; status?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    if (!body.id) {
        return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
    }

    const status =
        body.status && ALLOWED_STATUS.has(body.status as ChallengeStatus)
            ? (body.status as ChallengeStatus)
            : undefined;

    const updated = await updateChallenge(user.uid, body.id, {
        ...(body.progress !== undefined ? { progress: Number(body.progress) } : {}),
        ...(status ? { status } : {}),
    });

    return NextResponse.json({ challenge: updated });
}

export async function DELETE(request: Request) {
    const auth = await requireAuthUser(request);
    if ('response' in auth) return auth.response;
    const { user } = auth;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'id query is required' }, { status: 400 });
    }

    try {
        await deleteChallenge(user.uid, id);
    } catch (error) {
        console.error('challenge delete failed', error);
        return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
