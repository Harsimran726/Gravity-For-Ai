import {CALLBACK_CONSENT} from '@/lib/callback-consent-copy';
export function CallbackConsent(){return <div className="space-y-2 text-sm text-[#122C57]"><input type="hidden" name="callbackNotice" value="automatic-v1"/><p>{CALLBACK_CONSENT}</p><p className="text-xs text-[#6B7280]">Include your country code: +1 for the US or +91 for India. Other countries receive manual follow-up.</p></div>;}
