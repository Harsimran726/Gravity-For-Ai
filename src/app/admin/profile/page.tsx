import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {publicAuthorSelect,cleanPublicBio} from '@/lib/public-author';
import {ProfileForm} from './profile-form';
export const dynamic='force-dynamic';
export default async function ProfilePage(){
 const session=await getAdminSession();if(!session)redirect('/admin/login');
 const user=await prisma.user.findUnique({where:{id:session.id},select:publicAuthorSelect});
 if(!user)redirect('/admin/login');
 return <section className="max-w-2xl"><p className="text-xs uppercase tracking-widest text-[#946A26]">Your public byline</p><h1 className="font-serif text-3xl mt-3">My author profile</h1><p className="text-sm text-slate-600 mt-3 mb-8">Choose how you appear on your blog posts. Photo, bio and social links are optional and public. Keep passwords, tokens and private details out of these fields.</p><ProfileForm profile={{...user,bio:cleanPublicBio(user.bio)}}/></section>;
}
