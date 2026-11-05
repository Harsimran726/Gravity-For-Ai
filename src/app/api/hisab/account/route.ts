import { authenticate, failure, registerUser, reply, syncUser } from '@/lib/hisab/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Call after Firebase sign-in and when resuming the app. No sample business data
// is created, and existing workers/clients are never overwritten.
export async function POST(request: Request) {
  try {
    const user = await authenticate(request);
    await registerUser(user);
    return reply({uid: user.uid, subscription: await syncUser(user.uid), synced: true});
  } catch (error) { return failure(error); }
}
