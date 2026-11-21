import { NextRequest, NextResponse } from 'next/server';
import { isIP } from 'node:net';
import { prisma } from '@/lib/prisma';
import { cleanAudience, deviceType, safePath, referrerHost } from '@/lib/audience';
import { z } from 'zod';
const eventSchema=z.object({id:z.string().uuid(),visitorId:z.string().uuid(),sessionId:z.string().uuid(),path:z.string().max(600),seconds:z.number().int().min(0).max(14400),referrer:z.string().max(2000).optional(),source:z.string().max(100).optional(),medium:z.string().max(100).optional(),campaign:z.string().max(150).optional(),term:z.string().max(150).optional()});
const buckets=new Map<string,{count:number;until:number}>();
function allow(key:string){const now=Date.now();if(buckets.size>5000)buckets.forEach((v,k)=>{if(v.until<now)buckets.delete(k);});const b=buckets.get(key);if(!b||b.until<now){if(buckets.size>=10000)return false;buckets.set(key,{count:1,until:now+60000});return true;}return ++b.count<=120;}
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==req.nextUrl.origin)return new NextResponse(null,{status:403});
 if(req.headers.get('dnt')==='1'||req.headers.get('sec-gpc')==='1')return new NextResponse(null,{status:204});
 if(Number(req.headers.get('content-length')||0)>4096)return new NextResponse(null,{status:413});
 try{
 const text=await req.text();if(text.length>4096)return new NextResponse(null,{status:413});
 let json:unknown;try{json=JSON.parse(text);}catch{return new NextResponse(null,{status:400});}
 const parsed=eventSchema.safeParse(json);if(!parsed.success)return new NextResponse(null,{status:400});
 const e=parsed.data;let path:string;try{path=safePath(e.path);}catch{return new NextResponse(null,{status:400});}const device=deviceType(req.headers.get('user-agent')||'');
 if(device==='bot')return new NextResponse(null,{status:204});
 const host=referrerHost(e.referrer||'');
 const source=e.source || (host ? /(^|\.)(google|bing|yahoo)\./i.test(host) ? host.split('.').find(p=>['google','bing','yahoo'].includes(p))! : host : 'direct');
 const medium=e.medium || (host ? /(^|\.)(google|bing|yahoo)\./i.test(host)?'organic':'referral':'none');
 // Only trust platform-supplied proxy metadata on Vercel, never client JSON or generic forwarded headers.
 const trusted=process.env.VERCEL==='1';
 const candidate=trusted?(req.headers.get('x-vercel-forwarded-for')||'').split(',')[0].trim():'';
 const ip=isIP(candidate)?candidate:null;
 if(!allow(ip||e.visitorId))return new NextResponse(null,{status:429});
 const geo=(key:string)=>{const v=trusted?req.headers.get('x-vercel-ip-'+key):null;try{return v?decodeURIComponent(v).slice(0,100):null;}catch{return null;}};
 await cleanAudience();
 await prisma.$executeRaw`INSERT INTO audience_page_views(id,visitor_id,session_id,path,referrer,source,medium,campaign,term,ip,device,country,region,city,active_seconds)
 VALUES (${e.id}::uuid,${e.visitorId}::uuid,${e.sessionId}::uuid,${path},${host},${source},${medium},${e.campaign||null},${e.term||null},${ip},${device},${geo('country')},${geo('country-region')},${geo('city')},${Math.min(e.seconds,30)})
 ON CONFLICT (id) DO UPDATE SET active_seconds=LEAST(14400, EXTRACT(EPOCH FROM now()-audience_page_views.created_at)::int+30, GREATEST(audience_page_views.active_seconds,${e.seconds})),updated_at=now()
 WHERE audience_page_views.visitor_id=EXCLUDED.visitor_id AND audience_page_views.session_id=EXCLUDED.session_id`;
 return new NextResponse(null,{status:204});
 }catch{return NextResponse.json({error:'Unable to record visit'},{status:503});}
}

