'use server';
import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { submitLeadAction, type FormState } from '@/actions/lead-actions';

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  businessName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30),
  city: z.enum(['Chandigarh', 'Mohali', 'Other']),
  budget: z.enum(['20000-35000','35000-50000','50000-75000','75000-100000']),
  website: z.string().trim().max(250),
});
export async function submitWebsiteEnquiry(_: FormState, data: FormData): Promise<FormState> {
  if (String(data.get('website_hp') || '')) return { success: true };
  const parsed = schema.safeParse(Object.fromEntries(['name','businessName','email','phone','city','website','budget'].map(k => [k,String(data.get(k)||'')])));
  if (!parsed.success) return { success:false, message:'Please check your details.', errors:parsed.error.flatten().fieldErrors };
  const phone = parsePhoneNumberFromString(parsed.data.phone, 'IN');
  if (!phone?.isValid() || phone.country !== 'IN') return { success:false, message:'Enter a valid Indian mobile number.', errors:{phone:['Enter a valid Indian number.']} };
  const clean = new FormData();
  for (const [k,v] of Object.entries(parsed.data)) clean.set(k,v);
  clean.set('phone',phone.number);
  clean.set('websiteCampaign','interior-websites');
  clean.set('serviceInterest','Website Development - Interior & Renovation');
  const attribution = ['utm_source','utm_medium','utm_campaign','utm_content'].map(k => `${k}: ${String(data.get(k)||'direct').slice(0,150)}`).join('\n');
  clean.set('message',`Landing page: /lp/interior-websites\nRequest: Website consultation for an interior or renovation business.\nCity: ${parsed.data.city}\nWebsite budget (INR): ${parsed.data.budget}\nCurrent website or Instagram: ${parsed.data.website || 'Not provided'}\n${attribution}`);
  clean.set('callbackNotice',String(data.get('callbackNotice')||''));
  const result = await submitLeadAction({},clean);
  return result.success ? {success:true,message:'Your website enquiry has been received. We will contact you to understand your project and discuss a suitable scope.'} : result;
}

