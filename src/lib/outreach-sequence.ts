export type SequenceStep = {day:number;subject:string;body:string};
export type SequenceConfig = {version:1;dayMode:'BUSINESS'|'CALENDAR';steps:SequenceStep[]};
export const MAX_STEPS=8;
export function readSequence(value:unknown):SequenceConfig|null {
 if(value===null||value===undefined)return null;
 const c=value as SequenceConfig;
 if(c.version!==1||!['BUSINESS','CALENDAR'].includes(c.dayMode)||!Array.isArray(c.steps)||!c.steps.length||c.steps.length>MAX_STEPS)throw Error('Invalid sequence configuration.');
 c.steps.forEach((s,i)=>{if(!Number.isInteger(s.day)||s.day<0||s.day>365||(i===0?s.day!==0:s.day<=c.steps[i-1].day)||typeof s.subject!=='string'||s.subject.length>200||typeof s.body!=='string'||s.body.length>10000)throw Error('Use day 0 first, then increasing days up to 365. Subjects: 200 characters; messages: 10,000.');});
 return c;
}
export function resolveSteps(c:{sequence?:unknown;subject?:string;body?:string;followup1Body?:string|null;followup2Body?:string|null;followup1Days?:number;followup2Days?:number},p:{sequenceMessages?:unknown;customSubject?:string|null;customBody?:string|null}={}) {
 const config=readSequence(c.sequence);
 if(!config)return [{day:0,subject:p.customSubject||c.subject||'',body:p.customBody||c.body||''},...(c.followup1Body?[{day:c.followup1Days||4,subject:p.customSubject||c.subject||'',body:c.followup1Body}]:[]),...(c.followup1Body&&c.followup2Body?[{day:(c.followup1Days||4)+(c.followup2Days||5),subject:p.customSubject||c.subject||'',body:c.followup2Body}]:[])];
 const overrides=Array.isArray(p.sequenceMessages)?p.sequenceMessages as {subject?:string;body?:string}[]:[];
 return config.steps.map((s,i)=>({...s,subject:overrides[i]?.subject||(i===0?p.customSubject:'')||s.subject,body:overrides[i]?.body||(i===0?p.customBody:'')||s.body}));
}
export function addSequenceDays(date:Date,days:number,mode:'BUSINESS'|'CALENDAR') {
 const d=new Date(date);for(let n=0;n<days;){d.setUTCDate(d.getUTCDate()+1);const weekday=new Date(d.getTime()+330*60000).getUTCDay();if(mode==='CALENDAR'||(weekday!==0&&weekday!==6))n++;}return d;
}
type Attempt={step:number;sentAt:Date|null;status:string};
export function nextSequenceStep(p:{status:string;permissionGranted:boolean;sentAt:Date|null;sequenceMessages?:unknown;customSubject?:string|null;customBody?:string|null},sent:Attempt[],c:{sequence?:unknown;subject?:string;body?:string}) {
 const config=readSequence(c.sequence);if(!config||!p.permissionGranted||!['SELECTED','SENT'].includes(p.status)||sent.some(m=>['UNKNOWN','CLAIMED'].includes(m.status)))return null;
 const steps=resolveSteps(c,p);
 if(p.status==='SELECTED'&&!p.sentAt&&!sent.length)return steps[0].subject.trim()&&steps[0].body.trim()?{step:0,dueAt:null}:null;
 const first=sent.find(m=>m.step===0&&m.status==='ACCEPTED');if(p.status!=='SENT'||!first?.sentAt)return null;
 for(let i=1;i<steps.length;i++){
  const attempt=sent.find(m=>m.step===i);if(attempt){if(attempt.status!=='ACCEPTED')return null;continue;}
  const previous=sent.find(m=>m.step===i-1);if(!previous?.sentAt||previous.status!=='ACCEPTED'||!steps[i].subject.trim()||!steps[i].body.trim())return null;
  const planned=addSequenceDays(first.sentAt,steps[i].day,config.dayMode);
  const spaced=addSequenceDays(previous.sentAt,steps[i].day-steps[i-1].day,config.dayMode);
  return {step:i,dueAt:new Date(Math.max(planned.getTime(),spaced.getTime()))};
 }return null;
}
