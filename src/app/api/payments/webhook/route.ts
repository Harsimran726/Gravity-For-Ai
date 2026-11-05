import { db, failure, recordPayment, reply } from '@/lib/hisab/server';
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
    if (!['payment.captured', 'order.paid', 'refund.processed'].includes(event.event)) return reply({ignored: true});
    const paymentId = event.payload?.payment?.entity?.id ?? event.payload?.refund?.entity?.payment_id;
    if (typeof paymentId !== 'string' || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) throw new HisabError(400, 'Missing payment ID.');
    // Refund events may omit the payment entity. Fetch only if needed.
    let orderId = event.payload?.payment?.entity?.order_id;
    if (!orderId) {
      const {provider} = await import('@/lib/hisab/server');
      orderId = (await provider().payments.fetch(paymentId)).order_id;
    }
    const {rowCount} = await db().query('SELECT order_id FROM hisab_orders WHERE order_id=$1', [orderId]);
    if (!rowCount) return reply({ignored: true}); // Other products share the merchant account.
    await recordPayment(orderId, paymentId);
    return reply({received: true});
  } catch (error) { return failure(error); }
}
