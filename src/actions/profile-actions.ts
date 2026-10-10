'use server';
import {z} from 'zod';
import {getAdminSession} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import {cleanPublicBio,socialUrl,avatarUrl} from '@/lib/public-author';
export type ProfileState={success?:boolean;message?:string};
const schema=z.object({name:z.string().trim().min(1).max(100),title:z.string().trim().max(120),bio:z.string().trim().max(600),linkedinUrl:z.string().trim().max(250),githubUrl:z.string().trim().max(250),avatarUrl:z.string().max(280000)});
export async function saveProfile(_:ProfileState,data:FormData):Promise<ProfileState>{
 const session=await getAdminSession();
 if(!session)return {success:false,message:'Please sign in again.'};
 const result=schema.safeParse(Object.fromEntries(['name','title','bio','linkedinUrl','githubUrl','avatarUrl'].map(k=>[k,String(data.get(k)||'')])));
 if(!result.success)return {success:false,message:'Check the field lengths and enter your name.'};
 const p=result.data;
 if(cleanPublicBio(p.bio)!==p.bio)return {success:false,message:'Do not put invitation metadata or credentials in your public bio.'};
 if((p.linkedinUrl&&!socialUrl(p.linkedinUrl,'linkedin.com'))||(p.githubUrl&&!socialUrl(p.githubUrl,'github.com')))return {success:false,message:'Use an https://linkedin.com/ or https://github.com/ profile link without query parameters.'};
 if(p.avatarUrl && avatarUrl(p.avatarUrl)==='/apple-touch-icon.png')return {success:false,message:'Choose a JPG, PNG or WebP photo using the upload field.'};
 if(p.avatarUrl.startsWith('data:')){
  const bytes=Buffer.from(p.avatarUrl.split(',')[1]||'','base64');
  // The browser converts uploads into a small JPEG; reject other uploaded bytes.
  if(!p.avatarUrl.startsWith('data:image/jpeg;base64,')||bytes.length>200000||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)return {success:false,message:'Invalid profile photo. Please choose another image.'};
 }
 try{
  // Only the signed-in member's row is writable; no role, password or target ID is accepted.
  await prisma.user.update({where:{id:session.id},data:{name:p.name,title:p.title||null,bio:p.bio||null,linkedinUrl:p.linkedinUrl||null,githubUrl:p.githubUrl||null,avatarUrl:p.avatarUrl||null}});
  revalidatePath('/blog','layout'); revalidatePath('/admin/profile');
  return {success:true,message:'Public author profile saved.'};
 }catch{return {success:false,message:'Could not save your profile. Please try again.'};}
}

