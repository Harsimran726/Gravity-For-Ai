import {NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/auth';
import {db} from '@/lib/workshop-server';
export const dynamic='force-dynamic';
export async function GET(){
 const session=await getAdminSession();
 if(session?.role!=='ADMIN')return NextResponse.json({error:'Unauthorised'},{status:403});
 const {rows}=await db().query(`SELECT amount,currency,name,email,phone,group_consent,source,order_id,payment_id,paid_at,confirmation_sent_at FROM workshop_enrolments WHERE status='paid' ORDER BY paid_at DESC`);
 return NextResponse.json({enrolments:rows},{headers:{'Cache-Control':'no-store'}});
}
