import { failure, reconcileHisabEvent, reply } from '@/lib/hisab/server';
import { HisabError, validSignature } from '@/lib/hisab/core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const secret = process.env.HISAB_RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new HisabError(503, 'Webhook is not configured.');
    const raw = await request.text();
    if (raw.length > 262144) throw new HisabError(413, 'Request too large.');
    if (!validSignature(raw, request.headers.get('x-razorpay-signature') || '', secret)) throw new HisabError(400, 'Invalid webhook signature.');
    let event;
    try { event = JSON.parse(raw); } catch { throw new HisabError(400, 'Invalid JSON.'); }
    return reply(await reconcileHisabEvent(event) ? {received: true} : {ignored: true});
  } catch (error) { return failure(error); }
}
