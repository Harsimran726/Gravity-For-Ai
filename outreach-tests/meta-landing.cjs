const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const root=require('path').resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript');
function load(file,mocks){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(root+'/'+file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports:m.exports,require:n=>n in mocks?mocks[n]:n==='crypto'?require(n):require(root+'/node_modules/'+n),process:{env:{}},console,AbortSignal,fetch:()=>{throw Error('Real network forbidden')}});return m.exports;}
const capi=load('src/lib/meta-conversions.ts',{});
const p=capi.buildMetaLeadEventPayload({email:' OWNER@Example.com ',phone:'+91 98765 43210',actionSource:'website',eventId:'lead-test',eventSourceUrl:'https://gravityforai.com/lp/interior-websites',clientUserAgent:'test-agent'});
assert.equal(p.test_event_code,undefined);assert.equal(p.data[0].event_id,'lead-test');assert.equal(p.data[0].user_data.em[0].length,64);assert.equal(p.data[0].user_data.client_user_agent,'test-agent');
let failSave=false,events=[],order=[];
const action=load('src/actions/lead-actions.ts',{
 'next/headers':{headers:()=>new Map([['user-agent','test-agent']]),cookies:()=>({get:()=>undefined})},
 '@/lib/ai-callbacks':{callbackRecord:()=>({}),safelyDispatchCallback:async()=>order.push('callback')},
 '@/lib/ai-callback-policy':{normalizeCallbackPhone:x=>x},
 '@/lib/prisma':{prisma:{lead:{create:async()=>{if(failSave)throw Error('mock save failure');order.push('saved');return {id:'saved123'}}}}},
 '@/lib/mail':{sendContactInquiryEmail:async()=>{}},'next/cache':{revalidatePath:()=>{}},
 '@/lib/meta-conversions':{...capi,sendMetaConversionsApiEvent:async p=>{order.push('meta');events.push(p);return {success:false,error:'mock unavailable'}}}
});
function form(){const f=new FormData();for(const[k,v]of Object.entries({name:'Test Owner',email:'test@example.com',phone:'+919876543210',message:'Test website enquiry',websiteCampaign:'interior-websites',callbackNotice:'automatic-v1'}))f.set(k,v);return f;}
(async()=>{const result=await action.submitLeadAction({},form());assert.equal(result.success,true);assert.equal(result.eventId,'lead-saved123');assert.deepEqual(order,['saved','meta','callback']);assert.equal(events.length,1);assert.equal(events[0].data[0].action_source,'website');assert.equal(events[0].data[0].user_data.lead_id,undefined);assert.equal(events[0].data[0].event_id,'lead-saved123');failSave=true;assert.equal((await action.submitLeadAction({},form())).success,false);assert.equal(events.length,1);console.log('PASS: website CAPI, hashed matching data, stable ID, no forced test code, save-first dispatch, failed save emits nothing, Meta failure preserves enquiry. All services mocked.');})();

