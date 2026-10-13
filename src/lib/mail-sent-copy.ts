import crypto from 'crypto';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { ImapFlow } from 'imapflow';
import { prisma } from './prisma';

function encryptionKey() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || process.env.OUTREACH_CRON_SECRET;
  if (!secret || secret.length < 32) throw new Error('Mail archive encryption is not configured.');
  return crypto.createHash('sha256').update(secret).digest();
}
export function encryptMime(raw: Buffer) {
  const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(raw), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map(b => b.toString('base64')).join('.');
}
function decryptMime(value: string) {
  const [iv, tag, body] = value.split('.').map(v => Buffer.from(v, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}
export function senderAddress() { return process.env.SMTP_FROM || process.env.SMTP_USER || 'contact@gravityforai.com'; }
export function mailConfigurationReady() { return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS); }

/** Copies only; NEVER transmits a message to a recipient. Search first makes crash recovery idempotent. */
export async function saveSentCopy(id: string): Promise<boolean> {
  const now = new Date();
  const claimed = await prisma.mailSentCopy.updateMany({ where: { id, OR: [
    { status: 'PENDING', retryAt: { lte: now } }, { status: 'SAVING', lockUntil: { lt: now } }
  ] }, data: { status: 'SAVING', lockUntil: new Date(Date.now()+90000), attempts: { increment: 1 } } });
  if (!claimed.count) return false;
  let client: ImapFlow | undefined;
  try {
    const record = await prisma.mailSentCopy.findUniqueOrThrow({ where: { id } });
    if (!record.encryptedMime) throw new Error('No archived content');
    const raw = decryptMime(record.encryptedMime);
    client = new ImapFlow({ host: process.env.IMAP_HOST || 'imap.hostinger.com', port: 993, secure: true,
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! }, logger: false,
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      tls: { rejectUnauthorized: true } });
    await client.connect();
    const folders = await client.list();
    const folder = process.env.IMAP_SENT_FOLDER || folders.find(f => f.specialUse === '\\Sent')?.path || 'INBOX.Sent';
    const lock = await client.getMailboxLock(folder);
    try {
      const existing = await client.search({ header: { 'Message-ID': record.messageId } }, { uid: true });
      if (!existing || !existing.length) {
        const appended = await client.append(folder, raw, ['\\Seen'], record.createdAt);
        if (!appended) throw new Error('Sent copy was not acknowledged');
      }
      await prisma.mailSentCopy.update({ where: { id }, data: { status:'SAVED', savedAt:new Date(),
        encryptedMime:null, lockUntil:null, error:null } });
    } finally { lock.release(); }
    return true;
  } catch {
    await prisma.mailSentCopy.update({ where:{id}, data:{status:'PENDING', lockUntil:null,
      retryAt:new Date(Date.now()+600000), error:'Sent copy pending. Check Hostinger IMAP access; copying will retry without resending.'} });
    return false;
  } finally { client?.close(); }
}
export async function retrySentCopies() {
  const now=new Date();
  const rows=await prisma.mailSentCopy.findMany({where:{OR:[{status:'PENDING',retryAt:{lte:now}},{status:'SAVING',lockUntil:{lt:now}}]},orderBy:{createdAt:'asc'},take:1,select:{id:true}});
  for(const row of rows) await saveSentCopy(row.id);
}
/** Durable reservation precedes SMTP. An archive failure must never cause a second recipient send. */
export async function sendTrackedMail(options: Mail.Options) {
  if (!mailConfigurationReady()) throw new Error('Hostinger SMTP is not configured.');
  const messageId = options.messageId || `<${crypto.randomUUID()}@${senderAddress().split('@')[1]}>`;
  const composer = nodemailer.createTransport({streamTransport:true,buffer:true,newline:'windows'});
  const compiled = await composer.sendMail({...options,from:options.from || {name:'Gravity For AI',address:senderAddress()},messageId});
  if (!Buffer.isBuffer(compiled.message)) throw new Error('Mail composition did not produce a buffer.');
  const raw = compiled.message;
  const record = await prisma.mailSentCopy.create({data:{messageId,encryptedMime:encryptMime(raw)}});
  const port=Number(process.env.SMTP_PORT)||465;
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port,secure:port===465,requireTLS:true,
    auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},tls:{rejectUnauthorized:true},
    connectionTimeout:15000,greetingTimeout:15000,socketTimeout:20000});
  let result;
  try {
    result=await transport.sendMail({envelope:compiled.envelope,raw});
    if (!result.accepted?.length) throw new Error('Mail server did not accept the recipient.');
  } catch {
    await prisma.mailSentCopy.update({where:{id:record.id},data:{status:'UNKNOWN',error:'Sending outcome uncertain. Review provider logs before retrying.'}});
    throw new Error('Sending outcome uncertain. Do not retry automatically.');
  } finally { transport.close(); }
  // If this database write fails, the PREPARED reservation is retained for manual review.
  await prisma.mailSentCopy.update({where:{id:record.id},data:{status:'PENDING'}});
  // SMTP succeeded: even a database/IMAP outage here must not be reported as a failed send.
  try { await saveSentCopy(record.id); } catch { console.error('[MAIL] Sent copy needs review.'); }
  return {...result,messageId};
}
