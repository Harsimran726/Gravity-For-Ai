import { createHmac, timingSafeEqual } from 'crypto';
import { HISAB_PLANS } from './plans';

export class HisabError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function validSignature(value: string, signature: string, secret: string) {
  if (!secret || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(value).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

export function checkPayment(payment: {id: string; order_id: string; amount: number | string; currency: string; status: string; amount_refunded?: number | string}, order: {order_id: string; amount: number; currency: string}, paymentId: string) {
  if (payment.id !== paymentId || payment.order_id !== order.order_id || Number(payment.amount) !== Number(order.amount) || payment.currency !== order.currency) {
    throw new HisabError(400, 'Payment does not match the server order.');
  }
  if (!['captured', 'refunded'].includes(payment.status)) throw new HisabError(409, 'Payment is not captured yet. Retry verification shortly.');
}

// Replay the paid ledger in a stable order. Refunded purchases grant no access.
type PaidOrder = {paid_at: Date | string; duration_days: number; duration_months?: number; plan_id?: string; max_workers?: number; max_clients?: number};
export function addMonths(value: number, months: number) {
  const date = new Date(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.getTime();
}
export function subscriptionExpiry(rows: PaidOrder[]) {
  let expiry = 0;
  for (const row of rows) {
    const start = Math.max(expiry, new Date(row.paid_at).getTime());
    expiry = row.duration_months ? addMonths(start, row.duration_months) : start + row.duration_days * 86400000;
  }
  return expiry ? new Date(expiry) : null;
}

// Purchases queue after existing paid time; a different tier never borrows the
// remaining days of a cheaper tier. Return the currently effective segment.
export function entitlement(rows: PaidOrder[], now = Date.now()) {
  let expiry = 0;
  let current: {status: string; planId: string | undefined; expiresAt: string; maxWorkers: number | undefined; maxClients: number | undefined} | null = null;
  for (const row of rows) {
    const start = Math.max(expiry, new Date(row.paid_at).getTime());
    expiry = row.duration_months ? addMonths(start, row.duration_months) : start + row.duration_days * 86400000;
    if (current) {
      if (row.plan_id !== current.planId || row.max_workers !== current.maxWorkers || row.max_clients !== current.maxClients) break;
      current.expiresAt = new Date(expiry).toISOString();
    } else if (now >= start && now < expiry) current = {status: 'active', planId: row.plan_id, expiresAt: new Date(expiry).toISOString(), maxWorkers: row.max_workers, maxClients: row.max_clients};
  }
  if (current) return current;
  const free = HISAB_PLANS[0];
  return {status: 'free', planId: free.id, expiresAt: null, maxWorkers: free.maxWorkers, maxClients: free.maxClients};
}

export function subscription(expiresAt: Date | string | null) {
  const expires = expiresAt ? new Date(expiresAt) : null;
  return {status: expires && expires.getTime() > Date.now() ? 'active' : expires ? 'expired' : 'free', expiresAt: expires?.toISOString() ?? null};
}
