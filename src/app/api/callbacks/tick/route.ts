import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {secureEqual} from '@/lib/outreach-security';
import {safelyDispatchCallback,callbackConfiguration} from '@/lib/ai-callbacks';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function POST(request:Request){
  const secret=process.env.OUTREACH_CRON_SECRET;
  if(!secret||secret.length<32||!secureEqual(request.headers.get('authorization')||'','Bearer '+secret))return NextResponse.json({error:'Unauthorized'},{status:401});
  const config=callbackConfiguration();
  if(!config.enabled||config.missing.length)return NextResponse.json({processed:0,message:'Callbacks disabled or not configured.'});
  const pending=await prisma.aiCallback.findMany({where:{status:'QUEUED'},orderBy:{createdAt:'asc'},take:3,select:{leadId:true}});
  for(const call of pending)await safelyDispatchCallback(call.leadId);
  return NextResponse.json({processed:pending.length});
}
