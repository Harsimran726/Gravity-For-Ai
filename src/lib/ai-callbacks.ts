import {randomBytes} from 'crypto';
import {prisma} from '@/lib/prisma';
import {callbackPayload,CALLBACK_CONSENT,hashCallbackToken,normalizeCallbackPhone} from '@/lib/ai-callback-policy';

export function callbackConfiguration(){
  const missing:string[]=[];
  if(!process.env.SARVAM_API_KEY)missing.push('SARVAM_API_KEY');
  try{if(new URL(process.env.SARVAM_WEBHOOK_ORIGIN||'https://gravityforai.com').protocol!=='https:')missing.push('HTTPS webhook origin');}catch{missing.push('Valid webhook origin');}
  return {enabled:process.env.SARVAM_CALLBACKS_ENABLED==='true',missing};
}
// Created atomically with the lead. Existing leads are never backfilled or dialled.
export function callbackRecord(source:'BOOKING'|'CONTACT',phone:string|undefined,consent:boolean){
  const normalized=normalizeCallbackPhone(phone),config=callbackConfiguration();
  const status=!consent||!normalized?'SKIPPED':!config.enabled||config.missing.length?'BLOCKED':'QUEUED';
  const reason=!consent?'AI callback not requested.':!normalized?'No valid phone number.':status==='BLOCKED'?'Callbacks disabled or configuration incomplete.':null;
  return {source,phone:normalized,status,consentAt:consent?new Date():null,consentText:consent?CALLBACK_CONSENT:null,error:reason};
}
export async function dispatchCallback(leadId:string){
  const config=callbackConfiguration();
  if(!config.enabled||config.missing.length)return;
  const token=randomBytes(32).toString('base64url');
  // Serializes reservations across all instances; the network call happens outside the transaction.
  const reserved=await prisma.$transaction(async tx=>{
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(74632109)`;
    const call=await tx.aiCallback.findUnique({where:{leadId},include:{lead:true}});
    if(!call||call.status!=='QUEUED'||!call.phone||!call.consentAt)return null;
    const now=new Date();
    if(now.getTime()-call.createdAt.getTime()>60*60*1000){await tx.aiCallback.update({where:{id:call.id},data:{status:'EXPIRED',error:'Callback request is over one hour old; contact manually.'}});return null;}
    const cutoff=new Date(now.getTime()-24*60*60*1000);
    const recent=await tx.aiCallback.count({where:{phone:call.phone,requestedAt:{gte:cutoff}}});
    if(recent){await tx.aiCallback.update({where:{id:call.id},data:{status:'SKIPPED',error:'A callback was already attempted for this number within 24 hours.'}});return null;}
    const count=await tx.aiCallback.count({where:{requestedAt:{gte:cutoff}}});
    const configured=Number(process.env.SARVAM_DAILY_CALL_LIMIT||20);
    const cap=Number.isInteger(configured)&&configured>0?Math.min(configured,100):20;
    if(count>=cap){await tx.aiCallback.update({where:{id:call.id},data:{status:'BLOCKED',error:'Rolling 24-hour call cap reached; follow up manually.'}});return null;}
    await tx.aiCallback.update({where:{id:call.id},data:{status:'DISPATCHING',requestedAt:now,tokenHash:hashCallbackToken(token),error:null}});
    return call;
  });
  if(!reserved)return;
  try{
    const response=await fetch('https://apps.sarvam.ai/api/outbounds/v1/orgs/019e90cf-9254-77f8-8fbc-9e3fd52617f4/workspaces/019e90cf-927b-7216-804c-4522643f6283/outbounds',{
      method:'POST',headers:{'Content-Type':'application/json','X-API-Key':process.env.SARVAM_API_KEY!},body:JSON.stringify(callbackPayload(reserved,reserved.lead,token)),signal:AbortSignal.timeout(8000),cache:'no-store',
    });
    if(!response.ok){
      const certain=[400,401,403,404,422,429].includes(response.status);
      await prisma.aiCallback.updateMany({where:{id:reserved.id,status:'DISPATCHING'},data:{status:certain?'REJECTED':'UNKNOWN',error:'Sarvam HTTP '+response.status+(certain?'; request rejected.':'; acceptance uncertain. Check Sarvam before any further call.')}});return;
    }
    const body=await response.json();
    if(typeof body?.attempt_id!=='string'||!body.attempt_id||body.attempt_id.length>200)throw new Error('Missing attempt ID');
    await prisma.aiCallback.updateMany({where:{id:reserved.id,status:'DISPATCHING'},data:{status:'ACCEPTED',attemptId:body.attempt_id,error:null}});
  }catch{
    await prisma.aiCallback.updateMany({where:{id:reserved.id,status:'DISPATCHING'},data:{status:'UNKNOWN',error:'Call acceptance uncertain after network/response failure. No automatic retry; check Sarvam.'}});
  }
}
export async function safelyDispatchCallback(leadId:string){
  try{await dispatchCallback(leadId);}catch{console.error('[AI CALLBACK] Dispatch could not finish; inspect callback dashboard.');}
}
