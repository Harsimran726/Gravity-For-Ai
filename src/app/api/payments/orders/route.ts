import { z } from 'zod';
import { authenticate, body, createOrder, failure, plans, reply } from '@/lib/hisab/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try { await authenticate(request); return reply({plans: plans(), currency: 'INR'}); }
  catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const user = await authenticate(request);
    const input = z.object({planId: z.string().min(1).max(50)}).parse(await body(request));
    return reply(await createOrder(user, input.planId), 201);
  } catch (error) { return failure(error); }
}
