import {NextResponse} from 'next/server';
import {secureEqual} from '@/lib/outreach-security';
import {runOutreachTick} from '@/lib/outreach-engine';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=120;
export async function POST(request:Request){
 const secret=process.env.OUTREACH_CRON_SECRET;
 if(!secret||secret.length<32||!secureEqual(request.headers.get('authorization')||'',`Bearer ${secret}`))return NextResponse.json({error:'Unauthorized'},{status:401});
 try{return NextResponse.json(await runOutreachTick());}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Worker failed'},{status:503});}
}
