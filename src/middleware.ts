import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'gravity_admin_session';

async function verifySessionCookie(cookieValue:string):Promise<{valid:boolean;role?:string}> {
  try {
    const parts=cookieValue.split('.');
    if(parts.length!==2||!process.env.NEXTAUTH_SECRET)return {valid:false};
    const [payload,signature]=parts;
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(process.env.NEXTAUTH_SECRET),{name:'HMAC',hash:'SHA-256'},false,['verify']);
    const sig=Uint8Array.from(atob(signature.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
    if(!await crypto.subtle.verify('HMAC',key,sig,new TextEncoder().encode(payload)))return {valid:false};
    const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));
    const age=Date.now()-Date.parse(data.loginTime);
    return {valid:Number.isFinite(age)&&age>=0&&age<7*24*60*60*1000&&!!data.id&&['ADMIN','EDITOR','VIEWER'].includes(data.role),role:data.role};
  }catch{return {valid:false};}
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow /admin/accept-invite without auth (it's the invite acceptance page)
  if (pathname.startsWith('/admin/accept-invite')) {
    return NextResponse.next();
  }

  // 2. If already authenticated admin visits /admin/login, send straight to /admin
  if (pathname === '/admin/login') {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (sessionCookie) {
      const { valid } = await verifySessionCookie(sessionCookie.value);
      if (valid) return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 3. Protect all other /admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const { valid, role } = sessionCookie ? await verifySessionCookie(sessionCookie.value) : { valid: false, role: undefined };

    if (!valid) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    // 4. Admin-only routes (EDITOR and VIEWER cannot access these)
    const adminOnlyRoutes = ['/admin/callbacks', '/admin/team', '/admin/settings', '/admin/audit-log', '/admin/outreach'];
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

