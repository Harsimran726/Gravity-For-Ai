import { z } from 'zod';
import { authenticate, body, failure, recordPayment, reply } from '@/lib/hisab/server';
import { HisabError, validSignature } from '@/lib/hisab/core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const schema = z.object({
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]+$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});
const mobileSchema = z.object({
  userId: z.string().min(1).max(128), planId: z.enum(['starter', 'professional', 'business', 'starter_299', 'pro_499', 'pro', 'business_999']),
  amount: z.number().positive(), currency: z.literal('INR'), paymentMethod: z.literal('RAZORPAY'),
  razorpayOrderId: z.string().regex(/^order_[A-Za-z0-9]+$/),
  razorpayPaymentId: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  razorpaySignature: z.string().regex(/^[a-f0-9]{64}$/),
});

export async function POST(request: Request) {
  try {
    const user = await authenticate(request);
    const raw = await body(request);
    const mobile = raw && 'razorpayPaymentId' in Object(raw) ? mobileSchema.parse(raw) : null;
    if (mobile && mobile.userId !== user.uid) throw new HisabError(403, 'User does not match the signed-in account.');
    const input = mobile ? {razorpay_order_id: mobile.razorpayOrderId, razorpay_payment_id: mobile.razorpayPaymentId, razorpay_signature: mobile.razorpaySignature} : schema.parse(raw);
    if (!validSignature(`${input.razorpay_order_id}|${input.razorpay_payment_id}`, input.razorpay_signature, process.env.RAZORPAY_KEY_SECRET || '')) throw new HisabError(400, 'Invalid payment signature.');
    const result = await recordPayment(input.razorpay_order_id, input.razorpay_payment_id, user.uid, mobile ?? undefined);
    if (!result.verified) throw new HisabError(409, 'This purchase was refunded. Refresh your account subscription.');
    return reply({...result, status: 'success', message: 'Payment verified and subscription synchronized', data: {
      subscriptionStatus: result.subscription.status, subscriptionPlan: result.subscription.planId,
      validUntil: result.subscription.expiresAt ? Date.parse(result.subscription.expiresAt) : null,
      maxWorkers: result.subscription.maxWorkers, maxClients: result.subscription.maxClients,
      transactionId: `txn_gfa_${result.paymentId}`,
    }});
  } catch (error) { return failure(error); }
}
