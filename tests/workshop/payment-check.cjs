const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),deps=path.join(root,'node_modules'),ts=require(path.join(deps,'typescript'));
function load(relative,imports){const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(root,relative),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require:id=>id in imports?imports[id]:require(id),process,Buffer,AbortSignal,URL,console,setTimeout},{filename:relative});return module.exports;}
process.env.WORKSHOP_ACCESS_SECRET='test-access-secret-with-at-least-32-characters';
process.env.RAZORPAY_KEY_SECRET='test-provider-secret';process.env.RAZORPAY_WEBHOOK_SECRET='test-webhook-secret';
let emails=0,writes=0,sequence=0,providerFailure=null;
const rowsByOrder=new Map(),rowsById=new Map();
const initial={id:'r1',email:'test@example.invalid',order_id:'order_one',group_consent:true,amount:29900,currency:'INR',status:'pending',confirmation_sent_at:null};rowsByOrder.set('order_one',initial);rowsById.set('r1',initial);
let payment={id:'pay_one',order_id:'order_one',amount:29900,currency:'INR',status:'captured',amount_refunded:0};
const query=async(sql,args=[])=>{
 if(sql.startsWith('SELECT status FROM'))return {rows:[],rowCount:0};
 if(sql.startsWith('SELECT amount,currency')){const row=rowsByOrder.get(args[0]);return {rows:row?[row]:[],rowCount:row?1:0};}
 if(sql.startsWith('SELECT status,group_consent')||sql.startsWith('SELECT id FROM')){const row=rowsByOrder.get(args[0]);return {rows:row?[row]:[],rowCount:row?1:0};}
 if(sql.includes("SET status='paid'")){const row=rowsByOrder.get(args[1]);if(!row||row.status==='refunded')return {rows:[],rowCount:0};row.status='paid';row.payment_id=args[0];writes++;return {rows:[row],rowCount:1};}
 if(sql.includes('FOR UPDATE'))return {rows:[rowsByOrder.get(args[0])]};
 if(sql.includes('confirmation_sent_at=now()')){rowsById.get(args[0]).confirmation_sent_at=new Date();return {rows:[]};}
 if(sql.startsWith('INSERT INTO')){const row={id:args[0],cohort:args[1],name:args[2],email:args[3],phone:args[4],group_consent:args[5],source:args[6],amount:args[7],currency:args[8],status:'pending',confirmation_sent_at:null};rowsById.set(row.id,row);return {rows:[],rowCount:1};}
 if(sql.includes('SET order_id=')){const row=rowsById.get(args[1]);row.order_id=args[0];rowsByOrder.set(args[0],row);return {rows:[],rowCount:1};}
 return {rows:[],rowCount:0};
};
const pool={query,connect:async()=>({query,release(){}})};
const sdk={default:class{constructor(){this.orders={create:async data=>{if(providerFailure)throw providerFailure;return {...data,id:`order_generated${++sequence}`};}};this.payments={fetch:async()=>{if(providerFailure)throw providerFailure;return payment;}};}}};
const config=load('src/lib/workshop-config.ts',{});
const server=load('src/lib/workshop-server.ts',{'razorpay':sdk,'pg':{Pool:class{constructor(){return pool;}}},'@/lib/mail':{dispatchEmail:async()=>{emails++;return true;}},'./workshop-config':config});
const next={NextResponse:{json:(value,options)=>Response.json(value,options)}};
const api=load('src/app/api/workshop/route.ts',{'next/server':next,'zod':require(path.join(deps,'zod')),'@/lib/workshop-server':server,'@/lib/workshop-config':config});
const webhook=load('src/app/api/workshop/webhook/route.ts',{'next/server':next,'@/lib/workshop-server':server});
const req=(body,cookie)=>new Request('http://localhost/api/workshop',{method:'POST',headers:{origin:'http://localhost','content-type':'application/json',...(cookie?{cookie}:{})},body:JSON.stringify(body)});
const makeOffer=expiresAt=>{const visitorId='11111111-1111-4111-8111-111111111111';return {visitorId,expiresAt,signature:server.bookingSignature(expiresAt,visitorId)};};
const cookieFor=offer=>`${server.offerCookieName}=${server.serializeBookingOffer(offer)}`;
(async()=>{
 for(const change of [{amount:100},{currency:'USD'},{status:'authorized'},{amount_refunded:29900}]){payment={...payment,...change};assert.equal(await server.confirm('pay_one'),false);payment={id:'pay_one',order_id:'order_one',amount:29900,currency:'INR',status:'captured',amount_refunded:0};}
 assert.equal(writes,0);await assert.rejects(()=>server.confirm('pay_one','order_other'),/mismatch/);
 assert(await server.confirm('pay_one'));assert(await server.confirm('pay_one'));assert.equal(emails,1);
 let response=await api.POST(req({action:'verify'}));assert.equal(response.status,400);
 response=await api.POST(req({action:'verify',razorpay_order_id:'order_one',razorpay_payment_id:'pay_one',razorpay_signature:'0'.repeat(64)}));assert.equal(response.status,400);
 response=await api.POST(req({action:'status',order:'order_one',token:'0'.repeat(64)}));assert.equal(response.status,403);
 process.env.WORKSHOP_CHECKOUT_ENABLED='true';process.env.DATABASE_URL='test-only-database';process.env.RAZORPAY_KEY_ID='rzp_test_dummy';
 response=await api.POST(req({action:'reserve'}));assert.equal(response.status,200);const offer=await response.json();const cookie=response.headers.get('set-cookie').split(';')[0];
 assert(offer.expiresAt>Date.now());assert(offer.expiresAt<=Date.now()+1200000);assert(server.validBookingWindow(offer));assert.equal(offer.amount,29900);
 assert(response.headers.get('set-cookie').includes('HttpOnly'));assert(!server.validBookingWindow({...offer,signature:'0'.repeat(64)}));
 response=await api.POST(req({action:'reserve'},cookie));assert.equal((await response.json()).expiresAt,offer.expiresAt,'Refresh does not restart discount');
 const expired=makeOffer(Date.now()-1000),expiredCookie=cookieFor(expired);assert(server.validBookingWindow(expired));assert.equal(server.workshopAmount(expired),99900);
 assert.equal(server.workshopAmount(offer,offer.expiresAt-1),29900);assert.equal(server.workshopAmount(offer,offer.expiresAt),99900);
 assert(!server.validBookingWindow(makeOffer(Date.now()+1800000)));
 response=await api.POST(req({action:'reserve'},expiredCookie));const resumed=await response.json();assert.equal(resumed.expiresAt,expired.expiresAt);assert.equal(resumed.amount,99900,'Expired offer cannot be restarted');
 const orderBody={action:'order',expectedAmount:29900,name:'Test Learner',email:'test@example.invalid',phone:'+919876543210',terms:true,groupConsent:false};
 response=await api.POST(req(orderBody));assert.equal(response.status,400,'No unsigned price session');
 for(const amount of [0,99,100,299,99900,29900.5]){response=await api.POST(req({...orderBody,amount},cookie));assert.equal(response.status,400);}
 response=await api.POST(req({...orderBody,currency:'USD'},cookie));assert.equal(response.status,400);
 response=await api.POST(req(orderBody,cookie));assert.equal(response.status,200);const discounted=await response.json();assert.equal(discounted.amount,29900);assert.equal(rowsByOrder.get(discounted.order_id).amount,29900);
 response=await api.POST(req(orderBody,expiredCookie));assert.equal(response.status,409,'Price change needs explicit review');assert.equal((await response.json()).code,'PRICE_CHANGED');
 response=await api.POST(req({...orderBody,expectedAmount:99900},expiredCookie));assert.equal(response.status,200);const regular=await response.json();assert.equal(regular.amount,99900);assert.equal(rowsByOrder.get(regular.order_id).amount,99900);
 payment={id:'pay_regular',order_id:regular.order_id,amount:29900,currency:'INR',status:'captured',amount_refunded:0};assert.equal(await server.confirm('pay_regular'),false,'Cannot fulfil ₹999 order with ₹299');
 payment.amount=99900;assert(await server.confirm('pay_regular'));assert.equal(rowsByOrder.get(regular.order_id).status,'paid');
 payment={id:'pay_pending',order_id:discounted.order_id,amount:29900,currency:'INR',status:'authorized',amount_refunded:0};const sig=server.sign(`${payment.order_id}|${payment.id}`,process.env.RAZORPAY_KEY_SECRET);
 response=await api.POST(req({action:'verify',razorpay_order_id:payment.order_id,razorpay_payment_id:payment.id,razorpay_signature:sig}));assert.equal(response.status,202);assert.equal((await response.json()).success,false);
 payment.status='captured';response=await api.POST(req({action:'verify',razorpay_order_id:payment.order_id,razorpay_payment_id:payment.id,razorpay_signature:sig}));assert.equal(response.status,200);assert.equal((await response.json()).success,true);
 providerFailure={statusCode:401};response=await api.POST(req(orderBody,cookie));assert.equal(response.status,401);providerFailure={statusCode:500};response=await api.POST(req(orderBody,cookie));assert.equal(response.status,500);providerFailure=null;
 response=await webhook.POST(new Request('http://localhost/api/workshop/webhook',{method:'POST',body:'{}'}));assert.equal(response.status,400);
 console.log('PASS: first-visit cookie, persistent deadline, exact expiry boundary, ₹299 to ₹999 pricing, tampering and price-change acknowledgement.');
 console.log('PASS: order amount persistence, both price tiers, underpayment rejection, HMAC verification, capture/refund gates, deduplication and provider errors.');
})().catch(error=>{console.error(error);process.exitCode=1;});
