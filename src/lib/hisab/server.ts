import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import Razorpay from 'razorpay';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import { checkPayment, HisabError, entitlement, subscriptionExpiry } from './core';
import { HISAB_PLANS, normalizePlanId, androidPlanId } from './plans';

const globalPool = globalThis as unknown as {hisabPool?: Pool};
export function db() {
  if (!process.env.DATABASE_URL) throw new HisabError(503, 'Hisab storage is not configured.');
  return globalPool.hisabPool ??= new Pool({connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 10000});
}

function firebase() {
  const existing = getApps().find(app => app.name === 'hisab');
  if (existing) return existing;
  const raw = process.env.HISAB_FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.HISAB_FIREBASE_PROJECT_ID;
  if (!raw || !projectId) throw new HisabError(503, 'Hisab Firebase is not configured.');
  const account = JSON.parse(raw);
  if (account.project_id !== projectId) throw new HisabError(503, 'Hisab Firebase project mismatch.');
  return initializeApp({credential: cert(account), projectId}, 'hisab');
}

export async function authenticate(request: Request) {
  const token = /^Bearer ([^\s]{20,8192})$/.exec(request.headers.get('authorization') ?? '')?.[1];
  if (!token) throw new HisabError(401, 'Firebase sign-in required.');
  const auth = getAuth(firebase());
  try { return await auth.verifyIdToken(token, true); }
  catch { throw new HisabError(401, 'Session expired or invalid. Sign in again.'); }
}

export function provider() {
  const key = process.env.RAZORPAY_KEY_ID;
  if (!key || !process.env.RAZORPAY_KEY_SECRET || (process.env.VERCEL_ENV === 'production' && !key.startsWith('rzp_live_'))) {
    throw new HisabError(503, 'Payments are not configured.');
  }
  return new Razorpay({key_id: key, key_secret: process.env.RAZORPAY_KEY_SECRET});
}

export function plans() {
  return HISAB_PLANS;
}

export async function registerUser(user: DecodedIdToken) {
  const result = await db().query(`INSERT INTO hisab_users(uid,email,name) VALUES($1,$2,$3)
    ON CONFLICT(uid) DO UPDATE SET email=EXCLUDED.email,name=EXCLUDED.name,last_seen_at=now()
    RETURNING *`, [user.uid, user.email ?? null, user.name ?? null]);
  return result.rows[0];
}

// Serialize all mirror writes for a user. A failed mirror stays visibly pending;
// repeating verify, account refresh or a webhook repairs it without extending access.
export async function syncUser(uid: string) {
  const client = await db().connect();
  try {
    await client.query('BEGIN');
    const {rows: [user]} = await client.query('SELECT * FROM hisab_users WHERE uid=$1 FOR UPDATE', [uid]);
    if (!user) throw new HisabError(404, 'User not found.');
    const {rows: paid} = await client.query("SELECT * FROM hisab_orders WHERE uid=$1 AND status='paid' ORDER BY paid_at,order_id", [uid]);
    const state = entitlement(paid);
    const databaseId = process.env.HISAB_FIREBASE_DATABASE_ID;
    if (!databaseId) throw new HisabError(503, 'Hisab Firestore database is not configured.');
    await getFirestore(firebase(), databaseId).collection('users').doc(uid).set({
      uid, userId: uid, email: user.email ?? '', name: user.name ?? '', createdAt: new Date(user.created_at),
      trialStartEpoch: 0, trialEndEpoch: 0,
      subscription: state, subscriptionStatus: state.status, subscriptionPlan: androidPlanId(state.planId),
      validUntil: state.expiresAt ? Date.parse(state.expiresAt) : null,
      subscriptionExpiryEpoch: state.expiresAt ? Date.parse(state.expiresAt) : 0,
      maxWorkers: state.maxWorkers, maxClients: state.maxClients, updatedAt: new Date(),
    }, {merge: true});
    await client.query('UPDATE hisab_users SET firestore_synced_at=now() WHERE uid=$1', [uid]);
    await client.query('COMMIT');
    return state;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

export async function createOrder(user: DecodedIdToken, planId: string) {
  if (process.env.HISAB_CHECKOUT_ENABLED !== 'true') throw new HisabError(503, 'Hisab checkout is not enabled.');
  const plan = plans().find(p => p.id === normalizePlanId(planId));
  if (!plan || plan.id === 'free') throw new HisabError(400, 'Choose a paid subscription plan.');
  await registerUser(user);
  const order = await provider().orders.create({amount: plan.amount, currency: 'INR', receipt: randomUUID(), notes: {product: 'hisab', uid: user.uid, planId: plan.id}});
  await db().query(`INSERT INTO hisab_orders(order_id,uid,plan_id,amount,currency,duration_days,duration_months,max_workers,max_clients) VALUES($1,$2,$3,$4,'INR',30,$5,$6,$7)`, [order.id, user.uid, plan.id, plan.amount, plan.durationMonths, plan.maxWorkers, plan.maxClients]);
  return {orderId: order.id, amount: plan.amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, planId: plan.id};
}

export async function recordPayment(orderId: string, paymentId: string, uid?: string, claimed?: {planId: string; amount: number; currency: string}) {
  const {rows: [order]} = await db().query('SELECT * FROM hisab_orders WHERE order_id=$1', [orderId]);
  if (!order || (uid && order.uid !== uid)) throw new HisabError(404, 'Order not found.');
  if (claimed && (normalizePlanId(claimed.planId) !== order.plan_id || Math.round(claimed.amount * 100) !== order.amount || claimed.currency !== order.currency)) throw new HisabError(400, 'Submitted plan or price does not match the server order.');
  const payment = await provider().payments.fetch(paymentId);
  checkPayment(payment, order, paymentId);
  const refunded = Number(payment.amount_refunded ?? 0);
  const client = await db().connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT uid FROM hisab_users WHERE uid=$1 FOR UPDATE', [order.uid]);
    const {rows: [saved]} = await client.query('SELECT * FROM hisab_orders WHERE order_id=$1 FOR UPDATE', [orderId]);
    if (saved.payment_id && saved.payment_id !== paymentId) throw new HisabError(409, 'Order already has a different payment.');
    // Refunds are monotonic even if an older captured event races a refund.
    await client.query(`UPDATE hisab_orders SET payment_id=$2,
      status=CASE WHEN status='refunded' OR $3>0 OR $4='refunded' THEN 'refunded' ELSE 'paid' END,
      refunded_amount=GREATEST(refunded_amount,$3),paid_at=COALESCE(paid_at,now()) WHERE order_id=$1`, [orderId, paymentId, refunded, payment.status]);
    const {rows: paid} = await client.query("SELECT * FROM hisab_orders WHERE uid=$1 AND status='paid' ORDER BY paid_at,order_id", [order.uid]);
    await client.query('UPDATE hisab_users SET expires_at=$2,firestore_synced_at=NULL WHERE uid=$1', [order.uid, subscriptionExpiry(paid)]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
  const state = await syncUser(order.uid);
  const {rows: [saved]} = await db().query('SELECT status FROM hisab_orders WHERE order_id=$1', [orderId]);
  return {verified: saved.status === 'paid', paymentStatus: saved.status, orderId, paymentId, subscription: state, synced: true};
}

export async function body(request: Request) {
  const raw = await request.text();
  if (raw.length > 16384) throw new HisabError(413, 'Request too large.');
  try { return JSON.parse(raw); } catch { throw new HisabError(400, 'Invalid JSON.'); }
}

export function reply(data: unknown, status = 200) {
  return Response.json(data, {status, headers: {'Cache-Control': 'no-store'}});
}
export function failure(error: unknown) {
  if (error instanceof HisabError) return reply({error: error.message}, error.status);
  if (error instanceof z.ZodError) return reply({error: 'Invalid request fields.'}, 400);
  console.error('Hisab operation failed; sensitive details omitted.');
  return reply({error: 'Service temporarily unavailable. Retry the same request; do not pay again.'}, 503);
}
