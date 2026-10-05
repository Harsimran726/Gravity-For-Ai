import {getApps, initializeApp, cert} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {getMessaging} from 'firebase-admin/messaging';
import {createDispatcher} from '@/lib/wholesale/dispatcher.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(request: Request) {
  if (!/^Bearer [^\s]{20,8192}$/.test(request.headers.get('authorization') ?? '')) {
    return Response.json({error:'Sign in required.'},{status:401,headers:{'Cache-Control':'no-store'}});
  }
  try {
    const raw = process.env.WHOLESALE_FIREBASE_SERVICE_ACCOUNT;
    if (!raw) return Response.json({error:'Notification service is not configured.'},{status:503});
    const account = JSON.parse(raw);
    if (account.project_id !== 'vickyops-gravity-for-ai') throw new Error('Project mismatch');
    const app = getApps().find(a=>a.name==='wholesale-push') ?? initializeApp({credential:cert(account),projectId:account.project_id},'wholesale-push');
    return await createDispatcher({db:getFirestore(app),auth:getAuth(app),messaging:getMessaging(app)})(request);
  } catch {
    console.error('Wholesale notification request failed. Credentials and recipient details omitted.');
    return Response.json({error:'Notification delivery temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
