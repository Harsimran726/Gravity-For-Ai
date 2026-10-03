import {NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/auth';
import {runOutreachTick} from '@/lib/outreach-engine';
export const runtime='nodejs';
export async function POST(request:Request){
 const s=await getAdminSession();if(!s||s.role!=='ADMIN')return NextResponse.json({error:'Unauthorized'},{status:401});
 try{const body=await request.json();if(typeof body.campaignId!=='string')return NextResponse.json({error:'campaignId required'},{status:400});return NextResponse.json(await runOutreachTick(body.campaignId));}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Worker failed'},{status:400});}
}
