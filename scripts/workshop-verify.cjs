const assert=require('node:assert/strict');
const path=require('path');
require('@next/env').loadEnvConfig(path.resolve(__dirname,'..'),true);
const origin=process.env.WORKSHOP_TEST_ORIGIN||'http://localhost:3100';
const post=body=>fetch(`${origin}/api/workshop`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
(async()=>{
 const page=await fetch(`${origin}/workshop`);assert.equal(page.status,200);
 const html=await page.text();
 assert(html.includes('Razorpay test mode'));
 const secret=process.env.RAZORPAY_KEY_SECRET;
 if(secret)assert(!html.includes(secret),'Secret leaked into HTML');
 const scripts=Array.from(html.matchAll(/<script[^>]+src="([^"]+)"/g),m=>m[1]).filter(src=>src.startsWith('/_next/'));
 for(const src of scripts){const js=await (await fetch(origin+src)).text();if(secret)assert(!js.includes(secret),'Secret leaked into a client chunk');}
 assert.equal((await post({action:'order',amount:99})).status,400);
 assert.equal((await post({action:'order',amount:100})).status,400); // fixed ₹299 workshop fee
 assert.equal((await post({action:'order',currency:'USD'})).status,400);
 assert.equal((await post({action:'verify'})).status,400);
 assert.equal((await post({action:'verify',razorpay_order_id:'order_test',razorpay_payment_id:'pay_test',razorpay_signature:'0'.repeat(64)})).status,400);
 assert.equal((await fetch(`${origin}/api/workshop`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{'})).status,400);
 assert.equal((await fetch(`${origin}/api/workshop/webhook`,{method:'POST',body:'{}'})).status,400);
 console.log(`PASS: test-mode page, ${scripts.length} client chunks checked for secret leakage, amount/currency validation, missing/invalid signature, malformed JSON and unsigned webhook.`);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
