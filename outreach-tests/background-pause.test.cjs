const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,env,mocks={}) {
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,process:{env},Date,console,require:id=>{if(id in mocks)return mocks[id];if(id==='./background-schedule')return {BACKGROUND_INTERVAL_MINUTES:20};throw Error('Unexpected dependency: '+id);}});
 return module.exports;
}
test('pause ends at its configured UTC boundary and missing settings do not pause',()=>{
 const p=load('src/lib/background-pause.ts',{BACKGROUND_PAUSED_UNTIL:'2026-11-01T00:00:00Z'});
 assert.equal(p.backgroundPause(new Date('2026-10-31T23:59:59Z')).paused,true);
 assert.equal(p.backgroundPause(new Date('2026-11-01T00:00:00Z')),null);
 assert.equal(load('src/lib/background-pause.ts',{}).backgroundPause(),null);
 assert.equal(load('src/lib/background-pause.ts',{BACKGROUND_PAUSED_UNTIL:'invalid'}).backgroundPause(),null);
});
test('background processing accepts a two-minute arrival window every twenty minutes',()=>{
 const p=load('src/lib/background-pause.ts',{});
 for(const time of ['00:00:00','00:01:59','00:20:00','00:40:00'])assert.equal(p.backgroundSchedule(new Date('2026-11-01T'+time+'Z')),null);
 for(const time of ['00:02:00','00:19:59','00:22:00','00:59:59'])assert.equal(p.backgroundSchedule(new Date('2026-11-01T'+time+'Z')).deferred,true);
 assert.equal(p.backgroundSchedule(new Date('2026-11-01T00:59:59Z')).resumeAt,'2026-11-01T01:00:00.000Z');
});
for(const file of ['src/app/api/outreach/tick/route.ts','src/app/api/callbacks/tick/route.ts'])for(const mode of ['paused','deferred'])test(file+' authenticates and skips all work while '+mode,async()=>{
 let work=0,auth=0;
 const fail=()=>{work++;throw Error('No work expected during pause');};
 const route=load(file,{OUTREACH_CRON_SECRET:'s'.repeat(32)},{
  'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
  '@/lib/outreach-security':{secureEqual:(a,b)=>{auth++;return a===b;}},
  '@/lib/background-pause':{backgroundPause:()=>mode==='paused'?{paused:true,resumeAt:'2026-11-01T00:00:00.000Z'}:null,backgroundSchedule:()=>({deferred:true,resumeAt:'2026-11-01T00:20:00.000Z'})},
  '@/lib/mail-sent-copy':{retrySentCopies:fail},
  '@/lib/outreach-engine':{runOutreachTick:fail},
  '@/lib/callback-recap':{safelyProcessCallRecap:fail},
  '@/lib/ai-callbacks':{safelyDispatchCallback:fail,callbackConfiguration:fail},
  '@/lib/prisma':{prisma:new Proxy({},{get:fail})},
 });
 const req={headers:{get:()=> 'Bearer '+'s'.repeat(32)}};
 const result=await route.POST(req);
 assert.equal(result.status,200);assert.equal(result.body[mode],true);assert.equal(work,0);assert.equal(auth,1);
 const denied=await route.POST({headers:{get:()=>''}});
 assert.equal(denied.status,401);assert.equal(work,0);
});
