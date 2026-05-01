import { adminAuth } from './firebase-admin';

export type AuthUser = {
    uid: string;
    email: string | null;
    name: string | null;
};

/**
 * Verify Firebase ID token from `Authorization: Bearer <token>` header.
 * Returns the decoded user, or null if missing/invalid.
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
    if (!adminAuth) return null;

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const idToken = authHeader.slice(7).trim();
    if (!idToken) return null;

    try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        return {
            uid: decoded.uid,
            email: decoded.email ?? null,
            name: decoded.name ?? null,
        };
    } catch (error) {
        console.error('verifyIdToken failed', error);
        return null;
    }
}

export async function requireAuthUser(
    request: Request,
): Promise<{ user: AuthUser } | { response: Response }> {
    const user = await getAuthUser(request);
    if (!user) {
        return {
            response: new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            }),
        };
    }
    return { user };
}
