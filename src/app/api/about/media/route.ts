import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({ request, body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await getAdminSession();
        if (!session || session.role !== 'ADMIN') throw new Error('Admin access required');
        if (request.headers.get('origin') !== new URL(request.url).origin) throw new Error('Invalid origin');
        const payload = JSON.parse(clientPayload || '{}');
        const extensions: Record<string,string> = { 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp' };
        const extension = extensions[payload.type];
        if (!extension || !Number.isFinite(payload.size) || payload.size <= 0 || payload.size > 10 * 1024 * 1024 || !pathname.startsWith('founder-media/') || pathname.split('/').length !== 2 || !pathname.endsWith('.'+extension) || !/^[a-f0-9-]+[.](jpg|png|webp)$/.test(pathname.slice(14))) throw new Error('Invalid image');
        return { allowedContentTypes: [payload.type], maximumSizeInBytes: 10 * 1024 * 1024, validUntil: Date.now()+15*60*1000, addRandomSuffix:true, allowOverwrite:false };
      }, onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch { return NextResponse.json({error:'Unable to upload. Check that you are signed in as an administrator and image storage is connected.'},{status:400}); }
}
