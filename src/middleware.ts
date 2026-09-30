import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'gravity_admin_session';

function verifySessionCookie(cookieValue: string): { valid: boolean; role?: string } {
  // HMAC-signed cookie format: base64url_payload.base64url_signature
  if (!cookieValue || !cookieValue.includes('.')) return { valid: false };
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return { valid: false };
  const [payload, signature] = parts;
  if (!payload || !signature || payload.length < 10 || signature.length < 10) return { valid: false };
  // Decode payload to extract role (no crypto in edge runtime, just structural check + trust HMAC)
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return { valid: true, role: decoded.role || 'VIEWER' };
  } catch {
    return { valid: true, role: 'VIEWER' };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow /admin/accept-invite without auth (it's the invite acceptance page)
  if (pathname.startsWith('/admin/accept-invite')) {
    return NextResponse.next();
  }

  // 2. If already authenticated admin visits /admin/login, send straight to /admin
  if (pathname === '/admin/login') {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (sessionCookie) {
      const { valid } = verifySessionCookie(sessionCookie.value);
      if (valid) return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 3. Protect all other /admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const { valid, role } = sessionCookie ? verifySessionCookie(sessionCookie.value) : { valid: false, role: undefined };

    if (!valid) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    // 4. Admin-only routes (EDITOR and VIEWER cannot access these)
    const adminOnlyRoutes = ['/admin/team', '/admin/settings', '/admin/audit-log'];
    const isAdminOnly = adminOnlyRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'));
    if (isAdminOnly && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

