// Explicit production setup, run once after configuring Vercel's sensitive variables.
// The regular site build never runs this script or changes merchant configuration.
const { randomUUID } = require('node:crypto');
const { cert, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const Razorpay = require('razorpay');

async function main() {
  const env = process.env;
  if (env.VERCEL_ENV !== 'production') throw new Error('production-required');
  const account = JSON.parse(env.HISAB_FIREBASE_SERVICE_ACCOUNT);
  if (account.project_id !== env.HISAB_FIREBASE_PROJECT_ID || !env.HISAB_FIREBASE_DATABASE_ID) throw new Error('firebase-config');
  const app = initializeApp({projectId: account.project_id, credential: cert(account)}, 'hisab-setup');
  const probe = randomUUID();
  try { await getAuth(app).getUser(probe); }
  catch (e) { if (e.code !== 'auth/user-not-found') throw e; }
  console.log('Hisab Firebase Auth read verified.');
  const ref = getFirestore(app, env.HISAB_FIREBASE_DATABASE_ID).collection('_hisabIntegrationChecks').doc(probe);
  await ref.create({probe});
  try { if ((await ref.get()).get('probe') !== probe) throw new Error('firestore-readback'); }
  finally { await ref.delete(); }
  console.log('Hisab named Firestore database write, read and cleanup verified.');

  if (!env.RAZORPAY_KEY_ID?.startsWith('rzp_live_')) throw new Error('live-razorpay-keys-required');
  if (!env.HISAB_RAZORPAY_WEBHOOK_SECRET) throw new Error('webhook-secret-required');
  const provider = new Razorpay({key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET});
  await provider.orders.all({count: 1});
  console.log('Hisab production Razorpay authentication verified.');
  const url = 'https://gravityforai.com/api/payments/webhook';
  const events = ['payment.captured','order.paid','refund.processed'];
  const payload = {url, events, secret: env.HISAB_RAZORPAY_WEBHOOK_SECRET, active: true};
  let match;
  for (let skip = 0; ; skip += 100) {
    const page = await provider.webhooks.all({count: 100,skip});
    match = page.items.find(item => item.url === url);
    if (match || page.items.length < 100) break;
  }
  const saved = match ? await provider.webhooks.edit(payload, match.id) : await provider.webhooks.create(payload);
  if (!saved?.id || saved.url !== url || !saved.active || !events.every(event => saved.events?.includes(event))) throw new Error('webhook-readback');
  console.log('Hisab production webhook configured and verified.');
}

main().catch(e => {
  // SDK exceptions can contain request headers, secrets or personal data.
  const code = String(e.code || e.statusCode || (/^[a-z-]+$/.test(e.message) ? e.message : 'setup-error'));
  console.error('Hisab activation failed:', code);
  process.exitCode = 1;
});
