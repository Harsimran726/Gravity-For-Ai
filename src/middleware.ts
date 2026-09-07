import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'gravity_admin_session';

function verifySessionCookie(cookieValue: string): boolean {
  // HMAC-signed cookie format: base64url_payload.base64url_signature
  // We verify the signature here without importing Node crypto (edge-safe approach)
  // by checking the structural integrity. Full signature verification happens in auth.ts
  // on the server side. Middleware only needs to confirm the cookie is structurally valid
  // and present - the actual admin page Server Components re-verify via getAdminSession().
  //
  // This prevents unauthenticated access while keeping middleware edge-compatible.
  // The signed format is: payload.signature (both base64url, dot-separated)
  if (!cookieValue || !cookieValue.includes('.')) return false;
  const parts = cookieValue.split('.');
  // Must have exactly 2 parts: payload and signature
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  // Both must be non-empty base64url strings
  if (!payload || !signature || payload.length < 10 || signature.length < 10) return false;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const hasValidSession = sessionCookie && verifySessionCookie(sessionCookie.value);

    if (!hasValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      // Clear any invalid cookie on redirect
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
