import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {cleanAudience} from '@/lib/audience';
export const dynamic='force-dynamic';
type Visit={id:string;visitor_id:string;session_id:string;path:string;source:string;medium:string;campaign:string|null;term:string|null;ip:string|null;device:string;country:string|null;region:string|null;city:string|null;created_at:Date;active_seconds:number};
export default async function AudiencePage({searchParams}:{searchParams:{days?:string;page?:string}}){
 const auth=await getAdminSession();if(!auth)redirect('/admin/login');if(auth.role!=='ADMIN')redirect('/admin');
 const days=[1,7,30].includes(Number(searchParams.days))?Number(searchParams.days):7;
 const page=Math.max(1,Math.min(10000,Math.floor(Number(searchParams.page)||1)));const since=new Date(Date.now()-days*86400000);
 let rows:Visit[]=[], summary={visitors:0,sessions:0,views:0,seconds:0},sources:{source:string;views:number}[]=[],devices:{device:string;views:number}[]=[],error=false;
 try{
 await cleanAudience();
 const [totals,visits,src,dev]=await Promise.all([
 prisma.$queryRaw<typeof summary[]>`SELECT count(DISTINCT visitor_id)::int visitors,count(DISTINCT session_id)::int sessions,count(*)::int views,coalesce(sum(active_seconds),0)::int seconds FROM audience_page_views WHERE created_at>=${since}`,
 prisma.$queryRaw<Visit[]>`SELECT * FROM audience_page_views WHERE created_at>=${since} ORDER BY created_at DESC LIMIT 50 OFFSET ${(page-1)*50}`,
 prisma.$queryRaw<typeof sources>`SELECT source,count(*)::int views FROM audience_page_views WHERE created_at>=${since} GROUP BY source ORDER BY views DESC LIMIT 10`,
 prisma.$queryRaw<typeof devices>`SELECT device,count(*)::int views FROM audience_page_views WHERE created_at>=${since} GROUP BY device ORDER BY views DESC`]);
 summary=totals[0];rows=visits;sources=src;devices=dev;
 }catch{error=true;}
 const seconds=(n:number)=>`${Math.floor(n/60)}m ${n%60}s`;
 return <div className="space-y-6"><div className="flex flex-wrap justify-between gap-4"><div><h1 className="font-serif text-3xl">Audience analytics</h1><p className="mt-2 text-sm">Consenting browser visitors · Last {days} days · Times in IST</p></div><div className="flex gap-3">{[1,7,30].map(d=><Link className="underline" key={d} href={`/admin/audience?days=${d}`}>{d} day{d>1?'s':''}</Link>)}</div></div>
 {error?<p role="alert" className="border border-red-300 bg-red-50 p-4">Audience data is unavailable. Check database connectivity and apply db/audience.sql. This is not a zero-traffic report.</p>:<>
 <div className="grid sm:grid-cols-4 gap-4">{[['Visitors',summary.visitors],['Sessions',summary.sessions],['Page views',summary.views],['Avg active time / session',seconds(Math.round(summary.seconds/Math.max(1,summary.sessions)))]].map(([label,value])=><div className="border bg-white p-5 rounded-lg" key={label}><p className="text-sm">{label}</p><p className="text-2xl mt-2">{value}</p></div>)}</div>
 <div className="grid sm:grid-cols-2 gap-4"><section className="bg-white border rounded-lg p-5"><h2 className="text-xl mb-3">Top sources · Page views</h2>{sources.map(s=><p key={s.source}>{s.source}: {s.views}</p>)}</section><section className="bg-white border rounded-lg p-5"><h2 className="text-xl mb-3">Devices · Page views</h2>{devices.map(d=><p key={d.device}>{d.device}: {d.views}</p>)}</section></div>
 <p className="text-sm">Visitors are browser identifiers, not verified people. IPs may be shared or changed by VPNs. Locations are approximate. Active time counts visible page time. Blocked or declined visits are absent. Records expire after 30 days; cleanup runs on subsequent collection or dashboard access.</p>
 <section className="bg-white border rounded-lg p-5 overflow-x-auto"><h2 className="text-xl mb-4">Recent page views</h2><table className="w-full text-sm text-left"><thead><tr>{['Time (IST)','Visitor / session','Page','IP','Device','Location','Source / medium','Campaign / term','Active time'].map(t=><th className="p-3 whitespace-nowrap" key={t}>{t}</th>)}</tr></thead><tbody>{rows.map(v=><tr className="border-t" key={v.id}><td className="p-3 whitespace-nowrap">{new Date(v.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</td><td className="p-3 font-mono" title={`${v.visitor_id} / ${v.session_id}`}>{v.visitor_id.slice(0,8)} / {v.session_id.slice(0,8)}</td><td className="p-3">{v.path}</td><td className="p-3 font-mono">{v.ip||'Unavailable'}</td><td className="p-3">{v.device}</td><td className="p-3">{[v.city,v.region,v.country].filter(Boolean).join(', ')||'Unavailable'}</td><td className="p-3">{v.source} / {v.medium}</td><td className="p-3">{v.campaign||'—'} / {v.term||'—'}</td><td className="p-3 whitespace-nowrap">{seconds(v.active_seconds)}</td></tr>)}</tbody></table>{!rows.length&&<p className="py-5">No recorded visits in this period yet.</p>}<div className="flex gap-4 mt-4">{page>1&&<Link className="underline" href={`?days=${days}&page=${page-1}`}>Previous</Link>}{summary.views>page*50&&<Link className="underline" href={`?days=${days}&page=${page+1}`}>Next</Link>}</div></section>
 </>}
 <section className="bg-white border p-5 rounded-lg space-y-3"><h2 className="text-xl">What did visitors search?</h2><p>Google organic search terms are not provided for individual visitors. Campaign terms appear only when a link supplies utm_term; these are not verified search queries. Review aggregate queries, impressions and clicks in Search Console.</p><a className="underline" target="_blank" rel="noopener noreferrer" href="https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Agravityforai.com">Open Google Search Console queries</a></section>
 </div>;
}
