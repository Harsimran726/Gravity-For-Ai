import {NextResponse} from 'next/server';
import {verifyUnsubscribe} from '@/lib/outreach-security';
import {prisma} from '@/lib/prisma';
import {stopAddress} from '@/lib/outreach-engine';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function tokenId(request:Request){try{return verifyUnsubscribe(new URL(request.url).searchParams.get('token')||'');}catch{return null;}}
export async function GET(request:Request){
 if(!tokenId(request))return new Response('Invalid link',{status:400});
 return new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Stop Gravity For AI emails</title><body><h1>Stop future emails</h1><p>Confirm below to stop automated outreach from Gravity For AI.</p><form method="post"><button type="submit">Unsubscribe</button></form></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
}
export async function POST(request:Request){
 const id=tokenId(request);if(!id)return NextResponse.json({error:'Invalid link'},{status:400});
 const p=await prisma.outreachProspect.findUnique({where:{id}});if(!p)return new Response('This link is no longer available.',{status:404});
 await stopAddress(p.email,'UNSUBSCRIBED');return new Response('You have been unsubscribed from Gravity For AI outreach.',{headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});
}
