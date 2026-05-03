import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(req: NextRequest) {
    const url = req.nextUrl;

    // Protect /admin pages and admin-only API endpoints
    if (
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/api/admin')
    ) {
        const basicAuth = req.headers.get('authorization');

        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const [user, pwd] = atob(authValue).split(':');

            // Uses environment variables with a fallback
            const validUser = process.env.ADMIN_USER || 'admin';
            const validPwd = process.env.ADMIN_PASSWORD || 'bookfit123!';

            if (user === validUser && pwd === validPwd) {
                return NextResponse.next();
            }
        }

        // Require authentication
        return new NextResponse('Auth Required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
