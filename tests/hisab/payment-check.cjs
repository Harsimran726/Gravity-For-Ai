// Uses an isolated local PostgreSQL cluster. Razorpay and Firebase are mocked;
// SQL, transactions, concurrent deliveries and endpoint validation are real.
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os');
const {execFileSync} = require('child_process');
const assert = require('node:assert/strict');
const {createHmac} = require('crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const bin = process.env.HISAB_TEST_PG_BIN || path.join(root, 'pg_local/pgsql/bin');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'hisab-test-'));
const port = 55439;
function command(name, args) { execFileSync(path.join(bin, name + (process.platform === 'win32' ? '.exe' : '')), args, {stdio:'ignore', windowsHide:true, timeout:60000}); }
function load(relative, imports = {}) {
  const module = {exports:{}};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code, {module,exports:module.exports,require:id => id in imports ? imports[id] : require(id),process,Buffer,Response,console,Date}, {filename:relative});
  return module.exports;
}
let server, started = false;
(async () => {
  command('initdb', ['-D',path.join(temp,'data'),'-U','hisab_test','-A','trust','--no-locale']);
  command('pg_ctl', ['-D',path.join(temp,'data'),'-l',path.join(temp,'postgres.log'),'-o',`-h 127.0.0.1 -p ${port}`,'-w','start']); started=true;
  process.env.DATABASE_URL=`postgresql://hisab_test@127.0.0.1:${port}/postgres`;
  process.env.RAZORPAY_KEY_ID='rzp_test_hisab'; process.env.RAZORPAY_KEY_SECRET='test-only-secret'; delete process.env.VERCEL_ENV;
  process.env.HISAB_CHECKOUT_ENABLED='true';
  process.env.HISAB_FIREBASE_DATABASE_ID='test-hisab-named-db';
  let mirrorFail=false, next=0, mirrored=new Map(); const payments=new Map();
  class Razorpay { constructor(){this.orders={create:async data=>({...data,id:`order_${++next}`})};this.payments={fetch:async id=>payments.get(id)};} }
  const plans=load('src/lib/hisab/plans.ts');
  const core=load('src/lib/hisab/core.ts', {'./plans':plans});
  assert.equal(new Date(core.addMonths(Date.parse('2027-01-31T10:00:00Z'),1)).toISOString(),'2027-02-28T10:00:00.000Z');
  assert.equal(plans.HISAB_PLANS.find(p=>p.id==='professional').amount,49900);
  assert.equal(plans.HISAB_PLANS.find(p=>p.id==='business').amount,99900);
  const queued=[{paid_at:'2027-01-01T00:00:00Z',duration_days:30,duration_months:1,plan_id:'starter',max_workers:10,max_clients:5},{paid_at:'2027-01-02T00:00:00Z',duration_days:30,duration_months:1,plan_id:'business',max_workers:50,max_clients:50}];
  assert.equal(core.entitlement(queued,Date.parse('2027-01-15T00:00:00Z')).planId,'starter');
  assert.equal(core.entitlement(queued,Date.parse('2027-02-15T00:00:00Z')).maxWorkers,50);
  assert.equal(core.entitlement(queued,Date.parse('2027-03-15T00:00:00Z')).maxWorkers,3);
  server=load('src/lib/hisab/server.ts', {
    './core':core, './plans':plans, razorpay:Razorpay,
    'firebase-admin/app':{getApps:()=>[{name:'hisab'}]},
    'firebase-admin/auth':{getAuth:()=>({verifyIdToken:async token=>{if(token!=='a'.repeat(30))throw Error('bad');return {uid:'alice',email:'alice@example.invalid'};}})},
    'firebase-admin/firestore':{getFirestore:(app,databaseId)=>{assert.equal(databaseId,'test-hisab-named-db');return {collection:name=>{assert.equal(name,'users');return {doc:uid=>({set:async data=>{if(mirrorFail)throw Error('offline');mirrored.set(uid,data);}})};}};}},
  });
  await server.db().query(fs.readFileSync(path.join(root,'db/hisab.sql'),'utf8'));
  await server.db().query(fs.readFileSync(path.join(root,'db/hisab.sql'),'utf8')); // Repeatable migration.
  await server.registerUser({uid:'alice',email:'alice@example.invalid'});
  await server.syncUser('alice');
  assert.equal(mirrored.get('alice').subscription.status,'free');
  assert.equal('workers' in mirrored.get('alice'),false); assert.equal('clients' in mirrored.get('alice'),false);
  assert.equal(mirrored.get('alice').maxWorkers,3); assert.equal(mirrored.get('alice').maxClients,2);
  await assert.rejects(()=>server.createOrder({uid:'alice'},'free'),e=>e.status===400);
  const order=await server.createOrder({uid:'alice'},'starter');
  let payment={id:'pay_one',order_id:order.orderId,amount:29900,currency:'INR',status:'captured',amount_refunded:0}; payments.set(payment.id,payment);
  const api=load('src/app/api/payments/verify/route.ts',{'@/lib/hisab/server':server,'@/lib/hisab/core':core});
  const signature=createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${order.orderId}|pay_one`).digest('hex');
  const payload={razorpay_order_id:order.orderId,razorpay_payment_id:'pay_one',razorpay_signature:signature};
  const request=(body=payload,authorized=true)=>new Request('http://localhost/api/payments/verify',{method:'POST',headers:{...(authorized?{authorization:`Bearer ${'a'.repeat(30)}`}:{})},body:JSON.stringify(body)});
  assert.equal((await api.POST(request(payload,false))).status,401);
  assert.equal((await api.POST(request({...payload,razorpay_signature:'0'.repeat(64)}))).status,400);
  await assert.rejects(()=>server.recordPayment(order.orderId,'pay_one','bob'),e=>e.status===404);
  for(const change of [{amount:1},{currency:'USD'},{order_id:'order_other'},{status:'authorized'}]){
    payments.set('pay_one',{...payment,...change});assert.notEqual((await api.POST(request())).status,200);
  }
  payments.set('pay_one',payment);
  mirrorFail=true; assert.equal((await api.POST(request())).status,503);
  const before=(await server.db().query('SELECT expires_at,firestore_synced_at FROM hisab_users')).rows[0];
  assert(before.expires_at); assert.equal(before.firestore_synced_at,null);
  mirrorFail=false;
  const responses=await Promise.all(Array.from({length:6},()=>api.POST(request())));
  assert(responses.every(r=>r.status===200));
  const after=(await server.db().query('SELECT expires_at FROM hisab_users')).rows[0];
  assert.equal(after.expires_at.toISOString(),before.expires_at.toISOString(),'retries must not extend access');
  assert.equal(mirrored.get('alice').subscription.expiresAt,after.expires_at.toISOString());
  const mobile={userId:'alice',planId:'starter',amount:299,currency:'INR',paymentMethod:'RAZORPAY',razorpayOrderId:order.orderId,razorpayPaymentId:'pay_one',razorpaySignature:signature};
  const response=await api.POST(request(mobile)); assert.equal(response.status,200);
  const result=await response.json();assert.equal(result.status,'success');assert.equal(result.data.subscriptionPlan,'starter');assert.equal(result.data.maxWorkers,10);assert.equal(result.data.maxClients,5);assert.equal(result.data.validUntil,after.expires_at.getTime());
  assert.equal((await api.POST(request({...mobile,planId:'starter_299'}))).status,200);
  assert.equal(mirrored.get('alice').subscriptionPlan,'starter_299');
  assert.equal(mirrored.get('alice').subscriptionExpiryEpoch,after.expires_at.getTime());
  assert(mirrored.get('alice').updatedAt instanceof Date);
  assert.equal((await api.POST(request({...mobile,userId:'bob'}))).status,403);
  assert.equal((await api.POST(request({...mobile,amount:1}))).status,400);
  assert.equal((await api.POST(request({...mobile,planId:'business'}))).status,400);
  const second=await server.createOrder({uid:'alice'},'starter');
  payments.set('pay_two',{...payment,id:'pay_two',order_id:second.orderId});
  await Promise.all([server.recordPayment(second.orderId,'pay_two','alice'),server.recordPayment(order.orderId,'pay_one','alice')]);
  const renewed=(await server.db().query('SELECT expires_at FROM hisab_users')).rows[0].expires_at;
  assert.equal(renewed.getTime(),core.addMonths(after.expires_at.getTime(),1));
  assert.equal(mirrored.get('alice').validUntil,renewed.getTime());
  payments.set('pay_one',{...payment,amount_refunded:29900,status:'refunded'});
  await server.recordPayment(order.orderId,'pay_one','alice');
  assert.equal((await server.db().query("SELECT count(*) FROM hisab_orders WHERE status='paid'")).rows[0].count,'1');
  // Stale capture after refund cannot reactivate the refunded purchase.
  payments.set('pay_one',payment);await server.recordPayment(order.orderId,'pay_one','alice');
  assert.equal((await server.db().query('SELECT status FROM hisab_orders WHERE order_id=$1',[order.orderId])).rows[0].status,'refunded');
  const expiryAfterRefund=mirrored.get('alice').subscription.expiresAt;
  await server.registerUser({uid:'alice'}); await server.syncUser('alice');
  assert.equal(mirrored.get('alice').subscription.expiresAt,expiryAfterRefund,'sign-in preserves entitlement');
  process.env.HISAB_RAZORPAY_WEBHOOK_SECRET='test-webhook';
  const webhook=load('src/app/api/payments/webhook/route.ts',{'@/lib/hisab/server':server,'@/lib/hisab/core':core});
  const raw=JSON.stringify({event:'payment.captured',payload:{payment:{entity:{id:'pay_two',order_id:second.orderId}}}});
  const hook=signature=>new Request('http://localhost/api/payments/webhook',{method:'POST',headers:{'x-razorpay-signature':signature},body:raw});
  assert.equal((await webhook.POST(hook('0'.repeat(64)))).status,400);
  assert.equal((await webhook.POST(hook(createHmac('sha256','test-webhook').update(raw).digest('hex')))).status,200);
  console.log('PASS: authentication, tampering, ownership, capture, clean sign-in, SQL migration, concurrent retries, renewal, refunds, mirror failure recovery, signed webhook.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(server)await server.db().end();
  if(started)command('pg_ctl',['-D',path.join(temp,'data'),'-m','fast','-w','stop']);
  // Keep the isolated cluster/logs for inspection; never touch a configured database.
});
