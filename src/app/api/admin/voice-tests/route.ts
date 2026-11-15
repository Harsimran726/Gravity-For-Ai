import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { readCallPage, readEvidence, readUsage, VoiceTestError } from '@/lib/voice-test-providers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 40;
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', Vary: 'Cookie' };

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Sign in to use voice testing.' }, { status: 401, headers });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access required.' }, { status: 403, headers });
  try {
    const p = request.nextUrl.searchParams;
    const provider = p.get('provider');
    if (provider !== 'rasen' && provider !== 'sarvam') throw new VoiceTestError('Choose Rasen or Sarvam.', 400);
    const resource = p.get('resource') || 'calls';
    const cursor = p.get('cursor') || undefined;
    if (resource === 'transcript' || resource === 'summary') {
      return NextResponse.json(await readEvidence(provider, p.get('id') || '', resource, cursor), { headers });
    }
    const range = { start: p.get('start') || '', end: p.get('end') || '', cursor };
    if (resource === 'usage' && provider === 'rasen') return NextResponse.json(await readUsage(range), { headers });
    if (resource !== 'calls') throw new VoiceTestError('Unknown analytics resource.', 400);
    const offset = p.has('offset') ? Number(p.get('offset')) : undefined;
    return NextResponse.json(await readCallPage(provider, { ...range, offset }), { headers });
  } catch (error) {
    const known = error instanceof VoiceTestError;
    const retry = known ? error.retryAfter : null;
    return NextResponse.json({ error: known ? error.message : 'Unable to load analytics.', retryAfter: retry }, {
      status: known ? error.status : 500,
      headers: { ...headers, ...(retry ? { 'Retry-After': String(retry) } : {}) },
    });
  }
}
