import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { validateBlogMedia } from '@/lib/blog-media';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate token requests, not signed Blob completion callbacks.
        const session = await getAdminSession();
        if (!session || !['ADMIN', 'EDITOR'].includes(session.role)) throw new Error('Please sign in as an admin or editor to upload media.');
        if (request.headers.get('origin') !== new URL(request.url).origin) throw new Error('Upload must start from this website.');
        if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Media storage is not connected yet. Connect a public Vercel Blob store to this project and redeploy.');
        const payload = JSON.parse(clientPayload || '{}');
        const rule = validateBlogMedia(payload.type, payload.size);
        if (!new RegExp(`^blog-media/[a-f0-9-]{36}\\.${rule.extension}$`).test(pathname)) throw new Error('Invalid media upload path.');
        return {
          allowedContentTypes: [payload.type],
          maximumSizeInBytes: rule.maxBytes,
          validUntil: Date.now() + 15 * 60 * 1000,
          addRandomSuffix: true,
          allowOverwrite: false,
        };
      },
      onUploadCompleted: async () => { /* The editor stores the returned URL in article Markdown. */ },
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const safe = ['Please sign in', 'Upload must', 'Media storage is not connected', 'Choose a JPG', 'Video must', 'Image must', 'Invalid media upload path'].some(prefix => message.startsWith(prefix));
    return NextResponse.json({ error: safe ? message : 'Upload failed. Please try again or ask your administrator to check media storage.' }, { status: 400 });
  }
}
