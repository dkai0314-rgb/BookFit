import Link from 'next/link';
import {
    listLetters,
    type Letter,
    type LetterKind,
} from '@/lib/firestore-models';
import AdminLettersClient from './AdminLettersClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminLettersPage() {
    let list: Letter[] = [];
    let dbError: string | null = null;

    try {
        list = await listLetters({
            orderBy: [{ field: 'createdAt', dir: 'desc' }],
        });
        // isFeatured 우선 정렬은 in-memory로 — Firestore composite index 의존 제거
        list.sort((a, b) => {
            if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    } catch (error) {
        const err = error as Error;
        console.error('admin/letters list query failed', err);
        dbError = err.message || 'Firestore 쿼리 실패';
    }

    if (dbError) {
        return <FirestoreErrorScreen message={dbError} />;
    }

    return (
        <AdminLettersClient
            initial={list.map((l) => ({
                id: l.id,
                slug: l.slug,
                title: l.title,
                headlineTitle: l.headlineTitle,
                kind: l.kind as LetterKind,
                category: l.category,
                status: l.status,
                isFeatured: l.isFeatured,
                bookCount: l.bookIds.length,
                publishedAt: l.publishedAt ? l.publishedAt.toISOString() : null,
                createdAt: l.createdAt.toISOString(),
            }))}
        />
    );
}

function FirestoreErrorScreen({ message }: { message: string }) {
    const isUnauthenticated = /UNAUTHENTICATED|16 |permission/i.test(message);
    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6 font-sans text-gray-900">
            <Link href="/admin" className="text-sm text-gray-500 hover:underline">
                ← Admin 대시보드
            </Link>
            <h1 className="text-3xl font-bold text-red-600">Firestore 연결 실패</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm font-mono text-red-900 break-all">
                {message}
            </div>
            {isUnauthenticated ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 space-y-3 text-sm">
                    <h2 className="font-bold text-yellow-900">UNAUTHENTICATED — 점검 단계</h2>
                    <ol className="space-y-2 list-decimal pl-5 text-yellow-900">
                        <li>
                            <strong>Firestore Database 활성화 확인</strong>
                            <br />
                            Firebase Console → Build → Firestore Database. <em>Create database</em>{' '}
                            버튼이 보이면 아직 생성 전. <strong>Native mode</strong>로 생성.
                        </li>
                        <li>
                            <strong>Service Account 권한 확인</strong>
                            <br />
                            Google Cloud Console → IAM. <code>FIREBASE_CLIENT_EMAIL</code> 의 서비스 계정에{' '}
                            <em>Cloud Datastore User</em> 또는{' '}
                            <em>Firebase Admin SDK Administrator Service Agent</em> 역할이 부여되어 있는지.
                        </li>
                        <li>
                            <strong>Project ID 일치</strong>
                            <br />
                            <code>FIREBASE_PROJECT_ID</code> ↔ <code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code> ↔
                            서비스 계정 JSON의 <code>project_id</code> 모두 같은 값인지.
                        </li>
                        <li>
                            <strong>Private Key 포맷</strong>
                            <br />
                            Vercel ENV에 <code>FIREBASE_PRIVATE_KEY</code> 저장 시 줄바꿈이{' '}
                            <code>\n</code> 으로 escape되어 들어갔는지 (코드에서{' '}
                            <code>replace(/\\n/g, &apos;\n&apos;)</code> 처리 중).
                        </li>
                    </ol>
                </div>
            ) : (
                <div className="text-sm text-gray-600">
                    환경변수 또는 Firebase Admin 초기화를 점검해주세요.
                </div>
            )}
        </div>
    );
}

export type SerializedLetterRow = {
    id: string;
    slug: string;
    title: string;
    headlineTitle: string | null;
    kind: LetterKind;
    category: string | null;
    status: string;
    isFeatured: boolean;
    bookCount: number;
    publishedAt: string | null;
    createdAt: string;
};
