import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {CallbackResult,validCallbackToken} from '@/lib/ai-callback-policy';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){
  const url=new URL(request.url),id=url.searchParams.get('id')||'',token=url.searchParams.get('token')||'';
  if(!id||id.length>100||!token)return NextResponse.json({error:'Unauthorized'},{status:401});
  const call=await prisma.aiCallback.findUnique({where:{id}});
  if(!call||!validCallbackToken(token,call.tokenHash))return NextResponse.json({error:'Unauthorized'},{status:401});
  // Bound payload before parsing, including requests without Content-Length.
  const reader=request.body?.getReader();if(!reader)return NextResponse.json({error:'Missing body'},{status:400});
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>131072){await reader.cancel();return NextResponse.json({error:'Payload too large'},{status:413});}chunks.push(chunk.value);}
  let data;try{data=CallbackResult.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{return NextResponse.json({error:'Invalid callback payload'},{status:400});}
  const metadata=data.webhook_config?.metadata;
  if((call.attemptId&&call.attemptId!==data.attempt_id)||(metadata&&(metadata.lead_id!==call.leadId||metadata.callback_id!==call.id)))return NextResponse.json({error:'Call correlation mismatch'},{status:409});
  const variables=data.final_agent_variables||{};
  const text=(value:unknown)=>typeof value==='string'?value.slice(0,10000):null;
  // Repeated deliveries cannot regress a terminal result, including a webhook arriving before the API response.
  await prisma.aiCallback.updateMany({where:{id,completedAt:null,status:{in:['DISPATCHING','ACCEPTED','UNKNOWN']}},data:{
    status:data.status.toUpperCase(),attemptId:data.attempt_id,interactionId:data.interaction_id||null,duration:data.duration??null,
    disposition:text(variables.call_disposition),summary:text(variables.call_summary),
    transcript:data.interaction_transcript?.map(turn=>turn.role+': '+turn.en_text).join('\n').slice(0,60000)||null,
    error:data.failure_reason||null,completedAt:new Date(),
  }});
  return NextResponse.json({received:true});
}
