import {createHash, timingSafeEqual} from 'crypto';
import {z} from 'zod';
import {parsePhoneNumberFromString} from 'libphonenumber-js/max';

export {CALLBACK_CONSENT} from './callback-consent-copy';
export function normalizeCallbackPhone(value:string|null|undefined):string|null {
  let phone=(value||'').trim().replace(/[\s().-]/g,'');
  if(/^91\d{10}$/.test(phone))phone='+'+phone;
  else if(phone.startsWith('00'))phone='+'+phone.slice(2);
  return /^\+[1-9]\d{7,14}$/.test(phone)?phone:null;
}
export function callbackRoute(phone:string|null){
  if(!phone)return null;
  const parsed=parsePhoneNumberFromString(phone);
  if(!parsed?.isValid())return null;
  if(parsed.country==='US')return {country:'US',version:11,connection:{connection_id:'Twilio-Hars-07e635a2-c64a',agent_phone_number:'+14436455768'}};
  if(parsed.country==='IN')return {country:'IN',version:9,connection:{connection_id:'7b4368e4-1e-0afed599-1daf',agent_phone_number:'+917971442620'}};
  return null;
}
export const hashCallbackToken=(token:string)=>createHash('sha256').update(token).digest('hex');
export function validCallbackToken(token:string,hash:string|null){
  if(!hash||!token||token.length>200)return false;
  const actual=hashCallbackToken(token);
  return actual.length===hash.length&&timingSafeEqual(Buffer.from(actual),Buffer.from(hash));
}
export const CallbackResult=z.object({
  attempt_id:z.string().min(1).max(200),
  status:z.enum(['connected','no_answer','busy','failed']),
  duration:z.number().min(0).max(86400).nullable().optional(),
  interaction_id:z.string().max(300).nullable().optional(),
  failure_reason:z.string().max(2000).nullable().optional(),
  final_agent_variables:z.record(z.unknown()).nullable().optional(),
  interaction_transcript:z.array(z.object({role:z.enum(['agent','user']),en_text:z.string().max(10000)})).max(500).nullable().optional(),
  webhook_config:z.object({metadata:z.object({lead_id:z.string(),callback_id:z.string()}).passthrough().nullable().optional()}).passthrough().nullable().optional(),
});
export function callbackPayload(call:{id:string;leadId:string;phone:string|null;source:string},lead:{name:string;businessName:string|null;serviceInterest:string|null;message:string|null},token:string){
  const route=callbackRoute(call.phone);
  if(!route)throw new Error('Unsupported callback country or invalid number');
  const origin=process.env.SARVAM_WEBHOOK_ORIGIN||'https://gravityforai.com';
  const state=process.env.SARVAM_INITIAL_STATE;
  return {
    app_config:{
      app_id:'Conversatio-23fc2384-01a1',app_version:route.version,app_type:'agent',
      connection_config:route.connection,
      agent_variables:{business_type:lead.businessName||lead.serviceInterest||'',call_disposition:'',call_summary:JSON.stringify({source:call.source,request:lead.serviceInterest,note:lead.message}).slice(0,4000),gender:'',prospect_name:lead.name,user_name:lead.name},
      app_overrides:{initial_bot_message:'Hello, may I speak with '+lead.name.slice(0,100)+'? I am the AI assistant from Gravity For AI, calling about your '+(call.source==='BOOKING'?'meeting booking':'website enquiry')+'. Is now a good time to talk?',...(state?{initial_state_name:state}:{})},
    },
    user_config:{user_phone_number:call.phone},
    webhook_config:{url:origin.replace(/\/$/,'')+'/api/callbacks/webhook?id='+encodeURIComponent(call.id)+'&token='+encodeURIComponent(token),metadata:{lead_id:call.leadId,callback_id:call.id}},
  };
}
