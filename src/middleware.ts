import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Protect all /admin routes
    if (url.pathname.startsWith('/admin')) {
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
    matcher: ['/admin/:path*'],
};
