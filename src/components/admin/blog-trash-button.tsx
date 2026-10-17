'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trashBlogPostAction } from '@/actions/blog-actions';
export function BlogTrashButton({ id, title, restore = false }: { id: string; title: string; restore?: boolean }) {
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  return <span className="inline-flex flex-col items-start gap-2 text-xs">
    {!confirming ? <button type="button" disabled={pending} onClick={() => setConfirming(true)} className="rounded border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50">{restore ? 'Restore draft' : 'Delete'}</button> : <span className="block max-w-sm rounded-lg border border-amber-200 bg-amber-50 p-3 text-left">
      <span className="block mb-2">{restore ? 'Restore' : 'Move to Trash:'} “{title}”? {restore ? 'It will remain unpublished.' : 'It will be removed from the website. You can restore it later. Uploaded media is kept.'}</span>
      <button type="button" disabled={pending} onClick={async () => {
        setPending(true);
        try {
        const result = await trashBlogPostAction(id, restore);
        setMessage(result.message || '');
        if (result.success) { setConfirming(false); router.push('/admin/blog' + (restore ? '' : '?view=trash')); router.refresh(); }
        } catch { setMessage('Unable to update this post. Please try again.'); } finally { setPending(false); }
      }} className="rounded bg-[#122C57] px-3 py-2 text-white disabled:opacity-50">{pending ? 'Saving…' : restore ? 'Confirm restore' : 'Move to Trash'}</button>
      <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="ml-2 px-3 py-2">Cancel</button>
    </span>}
    {message && <span role="status">{message}</span>}
  </span>;
}
