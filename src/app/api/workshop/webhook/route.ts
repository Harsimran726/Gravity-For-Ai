import {NextResponse} from 'next/server';
import {sign,matches,confirm,db} from '@/lib/workshop-server';
export const runtime='nodejs';
export async function POST(req:Request){
 const raw=await req.text(),secret=process.env.RAZORPAY_WEBHOOK_SECRET;
 if(raw.length>100000||!secret||!matches(req.headers.get('x-razorpay-signature')||'',sign(raw,secret)))return NextResponse.json({error:'Invalid signature'},{status:400});
 try{const e=JSON.parse(raw);
 if(e.event==='payment.captured')await confirm(e.payload.payment.entity.id);
 if(e.event==='refund.processed')await db().query(`UPDATE workshop_enrolments SET status='refunded' WHERE payment_id=$1`,[e.payload.refund.entity.payment_id]);
 return NextResponse.json({received:true});
 }catch{return NextResponse.json({error:'Retry delivery'},{status:503});}
}
