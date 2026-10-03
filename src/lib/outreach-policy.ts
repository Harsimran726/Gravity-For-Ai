export const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export const STOP = ['REPLIED', 'UNSUBSCRIBED', 'BOUNCED', 'SKIPPED'];
export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function istDayStart(now = new Date()) {
  const offset = 330 * 60_000;
  const shifted = new Date(now.getTime() + offset);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - offset);
}
export function addBusinessDays(date: Date, days: number) {
  const result = new Date(date);
  for (let left = days; left > 0;) {
    result.setUTCDate(result.getUTCDate() + 1);
    const localDay = new Date(result.getTime() + 330 * 60_000).getUTCDay();
    if (localDay !== 0 && localDay !== 6) left--;
  }
  return result;
}
export function dailyRampLimit(start: Date | null, now: Date, ceiling: number) {
  const age = start ? Math.floor((istDayStart(now).getTime() - istDayStart(start).getTime()) / 86400000) : 0;
  return Math.min(ceiling, age < 3 ? 5 : age < 7 ? 10 : 20);
}
export function personalize(template: string, p: {name: string; company: string | null; email: string}) {
  const values: Record<string,string> = {name:p.name || 'there', firstname:p.name?.split(' ')[0] || 'there', company:p.company || 'your business', email:p.email};
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key.toLowerCase()] ?? '');
}
export function dueStep(p: {status:string; permissionGranted:boolean; sentAt:Date|null}, sent: {step:number; sentAt:Date|null; status:string}[], c:{followup1Body:string|null;followup2Body:string|null;followup1Days:number;followup2Days:number}, now:Date) {
  if (!p.permissionGranted || STOP.includes(p.status)) return null;
  // Never automatically retry an uncertain attempt, or any reserved step.
  if (sent.some(m=>m.status==='CLAIMED'||m.status==='UNKNOWN')) return null;
  if (p.status==='SELECTED' && !p.sentAt && !sent.length) return 0;
  if (p.status!=='SENT') return null;
  const initial=sent.find(m=>m.step===0 && m.status==='ACCEPTED');
  if (!initial?.sentAt) return null; // Legacy sends need review, not guessed follow-ups.
  const first=sent.find(m=>m.step===1);
  if (!first && c.followup1Body && addBusinessDays(initial.sentAt,c.followup1Days)<=now) return 1;
  if (first?.status==='ACCEPTED' && first.sentAt && c.followup2Body && !sent.some(m=>m.step===2) && addBusinessDays(first.sentAt,c.followup2Days)<=now) return 2;
  return null;
}
