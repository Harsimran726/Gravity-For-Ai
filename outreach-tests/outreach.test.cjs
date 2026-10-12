// Run: node --test outreach-tests/outreach.test.cjs. Never connects to a mailbox or database.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
function loader(mocks={},globals={}) {
  const cache=new Map();
  return function load(file){
    file=path.resolve(__dirname,'..',file);
    if(cache.has(file))return cache.get(file).exports;
    const module={exports:{}};cache.set(file,module);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
    const req=id=>id in mocks?mocks[id]:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id);
    vm.runInNewContext(code,{module,exports:module.exports,require:req,process,Buffer,Date,URL,AbortSignal,fetch,...globals},{filename:file});
    return module.exports;
  };
}
const load=loader(),policy=load('src/lib/outreach-policy.ts'),parser=load('src/lib/csv-parser.ts');
const date=s=>new Date(s),start=date('2026-10-02T05:00:00Z');
const campaign={followup1Body:'First',followup2Body:'Second',followup1Days:4,followup2Days:5};
const prospect={status:'SENT',permissionGranted:true,sentAt:start};
const initial={step:0,status:'ACCEPTED',sentAt:start};
test('IST midnight differs from UTC midnight',()=>assert.equal(policy.istDayStart(date('2026-10-02T19:00:00Z')).toISOString(),'2026-10-02T18:30:00.000Z'));
test('follow-up skips weekends in IST',()=>assert.equal(policy.addBusinessDays(start,4).toISOString(),'2026-10-08T05:00:00.000Z'));
test('first message requires approval and selection',()=>{
 assert.equal(policy.dueStep({...prospect,status:'SELECTED',sentAt:null},[],campaign,start),0);
 assert.equal(policy.dueStep({...prospect,status:'SELECTED',sentAt:null,permissionGranted:false},[],campaign,start),null);
});
test('first follow-up due only at boundary',()=>{
 assert.equal(policy.dueStep(prospect,[initial],campaign,date('2026-10-08T04:59:59Z')),null);
 assert.equal(policy.dueStep(prospect,[initial],campaign,date('2026-10-08T05:00:00Z')),1);
});
test('second follows actual first acceptance, not campaign creation',()=>{
 const first={step:1,status:'ACCEPTED',sentAt:date('2026-10-08T05:00:00Z')};
 assert.equal(policy.dueStep(prospect,[initial,first],campaign,date('2026-10-14T05:00:00Z')),null);
 assert.equal(policy.dueStep(prospect,[initial,first],campaign,date('2026-10-15T05:00:00Z')),2);
});
test('reply, opt-out, bounce and skip all stop follow-ups',()=>{
 for(const status of policy.STOP)assert.equal(policy.dueStep({...prospect,status},[initial],campaign,date('2026-11-01')),null);
});
test('uncertain and reserved attempts never auto retry',()=>{
 for(const status of ['CLAIMED','UNKNOWN'])assert.equal(policy.dueStep(prospect,[initial,{step:1,status,sentAt:null}],campaign,date('2026-11-01')),null);
});
test('legacy send without event history does not get guessed follow-ups',()=>assert.equal(policy.dueStep(prospect,[],campaign,date('2026-11-01')),null));
test('missing follow-up template disables that step',()=>assert.equal(policy.dueStep(prospect,[initial],{...campaign,followup1Body:null},date('2026-11-01')),null));
test('mailbox ramp and configured lower ceiling',()=>{
 assert.equal(policy.dailyRampLimit(null,start,20),5);
 assert.equal(policy.dailyRampLimit(start,date('2026-10-05T05:00Z'),20),10);
 assert.equal(policy.dailyRampLimit(start,date('2026-10-09T05:00Z'),100),20);
 assert.equal(policy.dailyRampLimit(start,date('2026-10-09T05:00Z'),3),3);
});
test('email-only file does not invent recipient names',()=>{
 const r=parser.parseCSVText('First@example.com\nsecond@example.com');assert.equal(r.prospects.length,2);assert.equal(r.prospects[0].name,'there');
});
test('CSV preserves multiline message, commas and escaped quotes',()=>{
 const r=parser.parseCSVText('email,body\na@example.com,"Hello, there\nSay ""yes"""');assert.equal(r.prospects[0].customBody,'Hello, there\nSay "yes"');
});
test('TSV, BOM, duplicates and invalid rows',()=>{
 const r=parser.parseCSVText('\uFEFFemail\tname\nA@example.com\tAnne\na@example.com\tDuplicate\nbad\tBad');assert.equal(r.prospects.length,1);assert.equal(r.errors.length,2);
});
test('malformed quotes fail instead of partially importing',()=>assert.equal(parser.parseCSVText('email,body\na@example.com,"Oops').prospects.length,0));
test('unsubscribe token detects tampering',()=>{
 const security=loader({}, {process:{env:{OUTREACH_UNSUBSCRIBE_SECRET:'s'.repeat(32)}}})('src/lib/outreach-security.ts');
 const token=security.unsubscribeToken('recipient');assert.equal(security.verifyUnsubscribe(token),'recipient');assert.equal(security.verifyUnsubscribe(token+'x'),null);
});
function harness({smtpFail=false,inboxFail=false,reply=false,cap=0}={}){
 const env={SMTP_HOST:'smtp.hostinger.com',SMTP_USER:'contact@example.com',SMTP_PASS:'test',HOSTINGER_MAIL_API_TOKEN:'test',HOSTINGER_MAILBOX_ID:'test',OUTREACH_POSTAL_ADDRESS:'Test business address',OUTREACH_PUBLIC_URL:'https://example.com',OUTREACH_UNSUBSCRIBE_SECRET:'s'.repeat(32),OUTREACH_CRON_SECRET:'c'.repeat(32),OUTREACH_SENDING_ENABLED:'true'};
 const p={id:'p',email:'recipient@example.com',name:'Recipient',company:null,status:'SELECTED',permissionGranted:true,sentAt:null,messages:[]};
 const c={...campaign,id:'c',name:'Test',subject:'Hello',body:'Test message',status:'ACTIVE',automationEnabled:true,dailyLimit:20,prospects:[p]};
 const mailbox={id:'primary',lockUntil:null,rampStartedAt:null,nextSendAt:null};let calls=0,syncs=0;const events=[];let suppressed=false;
 const db={
  outreachMailbox:{upsert:async({update})=>Object.assign(mailbox,update),findUniqueOrThrow:async()=>mailbox,update:async({data})=>Object.assign(mailbox,data),updateMany:async({where,data})=>{
   if(where.OR&&mailbox.lockUntil&&mailbox.lockUntil>new Date())return {count:0};
   if(where.lockToken&&mailbox.lockToken!==where.lockToken)return {count:0};Object.assign(mailbox,data);return {count:1};
  }},
  outreachMessage:{findFirst:async()=>null,findUnique:async()=>null,count:async()=>cap+events.length,create:async({data})=>{
   if(events.some(e=>e.prospectId===data.prospectId&&e.step===data.step))throw Error('Unique step');const e={id:'e',...data};events.push(e);p.messages=events;return e;
  },update:async({data})=>Object.assign(events[0],data)},
  outreachProspect:{findFirst:async()=>reply?p:null,findUnique:async()=>p,findUniqueOrThrow:async()=>p,updateMany:async({data})=>{Object.assign(p,data);return {count:1};}},
  outreachCampaign:{findMany:async()=>[c],findUnique:async()=>c,findUniqueOrThrow:async()=>c,update:async()=>c},
  outreachSuppression:{findUnique:async()=>suppressed?{email:p.email}:null,upsert:async()=>{suppressed=true;}},
 };
 db.$transaction=async fn=>fn(db);
 const engine=loader({'./prisma':{prisma:db},'./hostinger-inbox':{readHostingerInbox:async()=>{syncs++;if(inboxFail)throw Error('Inbox offline');return reply?[{from:{address:p.email},date:new Date().toISOString(),subject:'No thanks'}]:[];}},nodemailer:{createTransport:()=>({sendMail:async mail=>{calls++;assert.ok(mail.text.includes('Stop future emails: https://'));if(smtpFail)throw Error('Timeout');return {accepted:[p.email]};},close(){}})}},{process:{env}})('src/lib/outreach-engine.ts');
 return {engine,events,p,mailbox,env,calls:()=>calls,syncs:()=>syncs};
}
test('concurrent workers send a recipient step only once',async()=>{
 const h=harness();await Promise.all([h.engine.runOutreachTick(),h.engine.runOutreachTick()]);assert.equal(h.calls(),1);assert.equal(h.events[0].status,'ACCEPTED');
});
test('SMTP uncertainty is retained and not retried',async()=>{
 const h=harness({smtpFail:true});await h.engine.runOutreachTick();h.mailbox.nextSendAt=null;await h.engine.runOutreachTick();assert.equal(h.calls(),1);assert.equal(h.events[0].status,'UNKNOWN');
});
test('inbox failure prevents any SMTP call and releases lease',async()=>{
 const h=harness({inboxFail:true});await assert.rejects(h.engine.runOutreachTick());assert.equal(h.calls(),0);assert.equal(h.mailbox.lockToken,null);
});
test('a reply suppresses sending during the same tick',async()=>{
 const h=harness({reply:true});await h.engine.runOutreachTick();assert.equal(h.calls(),0);assert.equal(h.p.status,'REPLIED');
});
test('mailbox cap applies across campaigns',async()=>{
 const h=harness({cap:5});await h.engine.runOutreachTick();assert.equal(h.calls(),0);
});
test('disabled sending fails before inbox or SMTP access',async()=>{
 const h=harness();h.env.OUTREACH_SENDING_ENABLED='false';await assert.rejects(h.engine.runOutreachTick());assert.equal(h.calls(),0);assert.equal(h.syncs(),0);
});

test('manual mapping supports arbitrary and duplicate header names by position',()=>{
 const table=parser.readCSVTable('Contact,Contact,Pitch,Copy\nAnne,a@example.com,Hello,"Line one\nLine two"');
 const r=parser.mapProspectTable(table,{email:1,name:0,company:-1,subject:2,body:3});
 assert.equal(r.prospects[0].name,'Anne');assert.equal(r.prospects[0].email,'a@example.com');
 assert.equal(r.prospects[0].customSubject,'Hello');assert.equal(r.prospects[0].customBody,'Line one\nLine two');
});
test('remapping recalculates recipients instead of retaining old parsed rows',()=>{
 const table=parser.readCSVTable('Primary,Secondary\na@example.com,b@example.com');
 const mapping={email:0,name:-1,company:-1,subject:-1,body:-1};
 assert.equal(parser.mapProspectTable(table,mapping).prospects[0].email,'a@example.com');
 assert.equal(parser.mapProspectTable(table,{...mapping,email:1}).prospects[0].email,'b@example.com');
});
test('mapping requires email and rejects reused or out of bounds columns',()=>{
 const table=parser.readCSVTable('Who,Address\nAnne,a@example.com'),mapping={email:1,name:0,company:-1,subject:-1,body:-1};
 for(const change of [{email:-1},{email:9},{subject:1}])assert.equal(parser.mapProspectTable(table,{...mapping,...change}).prospects.length,0);
});
test('empty custom values fall back and ignored columns are not imported',()=>{
 const table=parser.readCSVTable('email,subject,message\na@example.com,,\nb@example.com,Custom,Personalized');
 const mapping=parser.suggestColumnMapping(table.headers),r=parser.mapProspectTable(table,mapping);
 assert.equal(r.prospects[0].customSubject,undefined);assert.equal(r.prospects[0].customBody,undefined);
 assert.equal(r.prospects[1].customBody,'Personalized');
 assert.equal(parser.mapProspectTable(table,{...mapping,body:-1}).prospects[1].customBody,undefined);
});
test('Excel supports manual mapping and keeps personalized messages',async()=>{
 const XLSX=require('xlsx'),book=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['Person','Destination','Pitch','Copy'],['Anne','a@example.com','Hello','Personalized message']]),'Prospects');
 const bytes=XLSX.write(book,{type:'buffer',bookType:'xlsx'});
 const table=await parser.readExcelTable(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
 const r=parser.mapProspectTable(table,{name:0,email:1,subject:2,body:3,company:-1});
 assert.equal(r.prospects[0].customBody,'Personalized message');
});

function actionHarness({enabled=true,count=1,role='ADMIN',status='ACTIVE'}={}) {
 const updates=[];let ticks=0;
 const actions=loader({
  '@/lib/prisma':{prisma:{outreachProspect:{count:async()=>count},outreachCampaign:{update:async q=>updates.push(q),findUnique:async()=>({status,automationEnabled:status==='ACTIVE'})}}},
  '@/lib/auth':{getAdminSession:async()=>role?{id:'admin',role}:null},
  'next/cache':{revalidatePath:()=>{}},
  '@/lib/outreach-policy':policy,
  '@/lib/outreach-engine':{outreachConfiguration:()=>({enabled,missing:[]}),runOutreachTick:async()=>{ticks++;return {sent:true,message:'Accepted'};}}
 })('src/actions/outreach-actions.ts');
 return {actions,updates,ticks:()=>ticks};
}
test('activation blocked when global sending is off without changing status',async()=>{
 const h=actionHarness({enabled:false});const result=await h.actions.updateCampaignStatusAction('c','ACTIVE');assert.equal(result.success,false);assert.match(result.message,/OUTREACH_SENDING_ENABLED/);assert.equal(h.updates.length,0);
});
test('pause remains available when global sending is off',async()=>{
 const h=actionHarness({enabled:false});assert.equal((await h.actions.updateCampaignStatusAction('c','PAUSED')).success,true);assert.equal(h.updates[0].data.automationEnabled,false);
});
test('activation requires approved recipients and does not send immediately',async()=>{
 const blocked=actionHarness({count:0});assert.equal((await blocked.actions.updateCampaignStatusAction('c','ACTIVE')).success,false);
 const h=actionHarness();assert.equal((await h.actions.updateCampaignStatusAction('c','ACTIVE')).success,true);assert.equal(h.updates[0].data.automationEnabled,true);assert.equal(h.ticks(),0);
});
test('manual processing refuses paused campaign and requires admin',async()=>{
 const h=actionHarness({status:'PAUSED'});assert.equal((await h.actions.processCampaignNextAction('c')).success,false);assert.equal(h.ticks(),0);
 const denied=actionHarness({role:'EDITOR'});await assert.rejects(()=>denied.actions.processCampaignNextAction('c'),/Unauthorized/);
});
test('manual processing reports acceptance without claiming delivery',async()=>{
 const h=actionHarness();const result=await h.actions.processCampaignNextAction('c');assert.equal(h.ticks(),1);assert.match(result.message,/not confirmation of inbox delivery/);
});

test('sending flag accepts true with mixed case and whitespace',()=>{
 for(const value of ['true','True','TRUE','  true  ','\tTrUe\n']) {
  const h=harness();h.env.OUTREACH_SENDING_ENABLED=value;
  assert.equal(h.engine.outreachConfiguration().enabled,true);
 }
});
test('sending flag remains off for missing, false and unrecognized values',()=>{
 for(const value of [undefined,'','false','False',' FALSE ','1','yes','tru']) {
  const h=harness();if(value===undefined)delete h.env.OUTREACH_SENDING_ENABLED;else h.env.OUTREACH_SENDING_ENABLED=value;
  assert.equal(h.engine.outreachConfiguration().enabled,false);
 }
});

test('scheduler heartbeat is distinct from manual processing',async()=>{
 const h=harness();await h.engine.runOutreachTick('c','scheduler');assert.ok(h.mailbox.lastScheduledAt instanceof Date);assert.match(h.mailbox.lastWorkerResult,/accepted/);
 const manual=actionHarness();assert.equal(manual.ticks(),0);
 const m=harness();await m.engine.runOutreachTick('c');assert.equal(m.mailbox.lastScheduledAt,undefined);assert.ok(m.mailbox.lastWorkerAt instanceof Date);
});
test('daily cap avoids unnecessary inbox requests and records why',async()=>{
 const h=harness({cap:5});await h.engine.runOutreachTick(undefined,'scheduler');assert.equal(h.syncs(),0);assert.equal(h.calls(),0);assert.match(h.mailbox.lastWorkerResult,/daily cap/);
});
test('worker records failure without claiming success or exposing provider details',async()=>{
 const h=harness({inboxFail:true});await assert.rejects(h.engine.runOutreachTick(undefined,'scheduler'));assert.ok(h.mailbox.lastScheduledAt);assert.match(h.mailbox.lastWorkerResult,/could not complete/);assert.equal(h.calls(),0);
});
