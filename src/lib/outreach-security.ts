import crypto from 'crypto';
export function secureEqual(a:string,b:string) { const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y); }
function secret(){const value=process.env.OUTREACH_UNSUBSCRIBE_SECRET;if(!value||value.length<32)throw new Error('Set OUTREACH_UNSUBSCRIBE_SECRET (32+ characters).');return value;}
export function unsubscribeToken(id:string){return `${id}.${crypto.createHmac('sha256',secret()).update(id).digest('hex')}`;}
export function verifyUnsubscribe(token:string){const parts=token.split('.');if(parts.length!==2)return null;return secureEqual(token,unsubscribeToken(parts[0]))?parts[0]:null;}
