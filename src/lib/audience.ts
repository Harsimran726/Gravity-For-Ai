import { prisma } from '@/lib/prisma';
export function deviceType(ua: string) { return /bot|crawler|spider|headless/i.test(ua) ? 'bot' : /ipad|tablet/i.test(ua) ? 'tablet' : /mobile|iphone|android/i.test(ua) ? 'mobile' : 'desktop'; }
export function safePath(value: string) { const u = new URL(value, 'https://gravityforai.com'); if(u.origin !== 'https://gravityforai.com' || !u.pathname.startsWith('/') || /^\/(admin|api)(\/|$)/.test(u.pathname) || u.pathname === '/workshop/confirmed') throw new Error('Excluded path'); return u.pathname.slice(0,500); }
export function referrerHost(value: string) { try { return new URL(value).hostname.slice(0,255); } catch { return ''; } }
let lastCleanup=0;
export async function cleanAudience() { if(Date.now()-lastCleanup<3600000)return; await prisma.$executeRaw`DELETE FROM audience_page_views WHERE created_at < now() - interval '30 days'`; lastCleanup=Date.now(); }
