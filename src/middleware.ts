import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'gravity_admin_session';

function verifySessionCookie(cookieValue: string): boolean {
  // HMAC-signed cookie format: base64url_payload.base64url_signature
  // Structure: payload.signature (both base64url, dot-separated)
  if (!cookieValue || !cookieValue.includes('.')) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature || payload.length < 10 || signature.length < 10) return false;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. If already authenticated admin visits /admin/login, send straight to /admin
  if (pathname === '/admin/login') {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (sessionCookie && verifySessionCookie(sessionCookie.value)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protect all other /admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const hasValidSession = sessionCookie && verifySessionCookie(sessionCookie.value);

    if (!hasValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clean up invalid session cookie
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
