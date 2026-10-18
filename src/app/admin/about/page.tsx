import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';
import { getFounderPhoto } from '@/lib/founder-photo';
import { FounderPhotoEditor } from './photo-editor';
export default async function AboutSettingsPage() {
 const session=await getAdminSession();
 if(!session) redirect('/admin/login');
 if(session.role!=='ADMIN') redirect('/admin');
 const photo=await getFounderPhoto();
 return <div className="max-w-3xl space-y-6"><Link href="/admin/settings" className="underline">← Settings</Link><h1 className="font-serif text-3xl text-[#122C57]">About-page photo</h1><p className="text-[#40516C]">Upload or replace the founder portrait displayed on the public About page.</p><FounderPhotoEditor initialUrl={photo} /></div>;
}
