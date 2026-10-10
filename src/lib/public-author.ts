// Public profile allowlist. Never serialize a full User record to readers.
export const publicAuthorSelect = {name:true,title:true,bio:true,avatarUrl:true,linkedinUrl:true,githubUrl:true} as const;
export function cleanPublicBio(value:string|null|undefined):string {
  return value && !/(INVITED_BY:|TOKEN:|STATUS:(PENDING|ACTIVE))/i.test(value) ? value : '';
}
export function socialUrl(value:string|null|undefined,host:'linkedin.com'|'github.com'):string {
  if(!value)return '';
  try { const u=new URL(value); return u.protocol==='https:' && !u.username && !u.password && !u.search && !u.hash && (u.hostname===host || u.hostname==='www.'+host) && u.pathname.length>1 ? u.href : ''; } catch{return '';}
}
export function avatarUrl(value:string|null|undefined):string {
  if(!value)return '/apple-touch-icon.png';
  if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length<=280000)return value;
  try {const u=new URL(value); return u.protocol==='https:' && !u.username && !u.password && !u.search && !u.hash && ['gravityforai.com','www.gravityforai.com','avatars.githubusercontent.com'].includes(u.hostname) ? u.href : '/apple-touch-icon.png';}catch{return '/apple-touch-icon.png';}
}

