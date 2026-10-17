'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { BLOG_MEDIA_TYPES, insertMediaAtCursor, mediaMarkdown, validateBlogMedia } from '@/lib/blog-media';

const ArticlePreview = dynamic(() => import('./blog-content-preview'), { loading: () => <p>Loading preview…</p> });

export function BlogContentEditor({ initialContent = '' }: { initialContent?: string }) {
  const [content, setContent] = useState(initialContent);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [placement, setPlacement] = useState('cursor');
  const [uploaded, setUploaded] = useState<{ url: string; video: boolean } | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const cursor = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const activeUpload = useRef<AbortController | null>(null);
  useEffect(() => () => activeUpload.current?.abort(), []);

  async function uploadFile(file: File) {
    const controller = new AbortController();
    activeUpload.current = controller;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let stalled = false;
    const resetTimeout = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => { stalled = true; controller.abort(); }, 90_000);
    };
    const cancelled = new Promise<never>((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error('Upload cancelled')), { once: true }));
    // Attach a rejection handler before loading the SDK to avoid unhandled cancellation.
    void cancelled.catch(() => {});
    setMessage('');
    setUploaded(null);
    try {
      const rule = validateBlogMedia(file.type, file.size);
      setBusy(true);
      setProgress(0);
      resetTimeout();
      const { upload } = await import('@vercel/blob/client');
      if (controller.signal.aborted) throw new Error('Upload cancelled');
      const blob = await Promise.race([upload(`blog-media/${crypto.randomUUID()}.${rule.extension}`, file, {
        access: 'public',
        abortSignal: controller.signal,
        handleUploadUrl: '/api/blog/media',
        contentType: file.type,
        clientPayload: JSON.stringify({ type: file.type, size: file.size }),
        multipart: file.size > 4 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => { if (!controller.signal.aborted) { resetTimeout(); setProgress(Math.round(percentage)); } },
      }), cancelled]);
      setUploaded({ url: blob.url, video: file.type.startsWith('video/') });
      setMessage('Uploaded. Add a description and choose Insert into article.');
    } catch (error) {
      // The token endpoint returns actionable errors without credentials.
      setMessage(stalled ? 'Upload stalled for 90 seconds. Check your connection and retry. Your article text is unchanged.' : controller.signal.aborted ? 'Upload cancelled. You can choose the file again.' : error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      if (timeout) clearTimeout(timeout);
      activeUpload.current = null;
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function insert() {
    if (!uploaded) return;
    try {
      const position = placement === 'start' ? 0 : placement === 'end' ? content.length : cursor.current;
      const next = insertMediaAtCursor(content, position, mediaMarkdown(uploaded.url, description, uploaded.video));
      setContent(next.content);
      cursor.current = next.cursor;
      setUploaded(null);
      setDescription('');
      setPreview(false);
      setMessage('Media inserted. Save your draft or publish to keep this change.');
      requestAnimationFrame(() => { textarea.current?.focus(); textarea.current?.setSelectionRange(next.cursor, next.cursor); });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to insert media.'); }
  }

  return <section className="space-y-4" aria-label="Article editor">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label htmlFor="blog-body" className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">Article content</label>
      <button type="button" aria-pressed={preview} onClick={() => setPreview(!preview)} className="rounded-lg border border-[#122C57] px-3 py-2 text-sm">{preview ? 'Back to writing' : 'Preview article'}</button>
    </div>
    <div className="rounded-xl border border-[#E4E2DC] bg-[#F7F5F0] p-4 space-y-3">
      <p className="font-medium text-[#122C57]">Insert an image or video</p>
      <p className="text-xs text-[#6B7280]">Click between paragraphs in your article to choose a position. Upload a file, describe it, then insert. Move media later by cutting and pasting its Markdown line.</p>
      <label className="block text-sm">Image description / video title
        <input value={description} maxLength={300} onChange={e => setDescription(e.target.value)} placeholder="Describe what readers will see" className="mt-1 w-full rounded-lg border border-[#E4E2DC] bg-white px-3 py-2" />
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">Insert position
          <select value={placement} onChange={e => setPlacement(e.target.value)} className="ml-2 rounded-lg border bg-white px-3 py-2">
            <option value="cursor">Last cursor position</option><option value="start">Start of article</option><option value="end">End of article</option>
          </select>
        </label>
        <input ref={fileInput} type="file" aria-label="Upload blog image or video" accept={Object.keys(BLOG_MEDIA_TYPES).join(',')} disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (file) void uploadFile(file); }} className="block max-w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#122C57] file:px-4 file:py-2 file:text-white" />
      </div>
      <p className="text-xs text-[#6B7280]">Images: JPG, PNG, WebP or GIF, up to 10 MB. Videos: MP4 or WebM, up to 100 MB. Uploaded files are publicly accessible; use only media intended for your website.</p>
      {busy && <div><progress className="w-full" value={progress} max={100} aria-label="Upload progress" /><p className="text-sm">{progress === 0 ? "Connecting to secure storage…" : progress === 100 ? "Finalising upload…" : `Uploading… ${progress}%`}</p><button type="button" onClick={() => activeUpload.current?.abort()} className="mt-2 rounded border px-3 py-2 text-sm">Cancel upload</button></div>}
      {uploaded && <div className="space-y-3">
        {uploaded.video ? <video src={uploaded.url} controls preload="metadata" className="max-h-48 rounded-lg" /> : <img src={uploaded.url} alt={description || 'Uploaded image preview'} className="max-h-48 rounded-lg" />}
        <button type="button" disabled={!description.trim()} onClick={insert} className="rounded-lg bg-[#122C57] px-4 py-2 text-sm text-white disabled:opacity-50">Insert into article</button>
      </div>}
      <p role="status" aria-live="polite" className="text-sm text-[#122C57] break-words">{message}</p>
    </div>
    <textarea id="blog-body" ref={textarea} name="bodyContent" required rows={18} value={content} onChange={e => setContent(e.target.value)} onSelect={e => { cursor.current = e.currentTarget.selectionStart; }} placeholder="Write or paste your article Markdown here…" className={`w-full rounded-xl px-4 py-3 bg-white border border-[#E4E2DC] text-sm font-mono text-[#0A1B3D] focus:outline-none focus:border-[#122C57] ${preview ? 'sr-only' : ''}`} />
    {preview && <div className="rounded-xl border border-[#E4E2DC] p-5"><ArticlePreview content={content} /></div>}
  </section>;
}
