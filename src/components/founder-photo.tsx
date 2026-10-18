'use client';
import { useState } from 'react';
export function FounderPhoto({ url }: { url: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return url && failedUrl !== url ? <img src={url} alt="Harsimran Singh, founder of Gravity For AI" width={256} height={256} className="mx-auto my-8 aspect-square rounded-2xl object-cover" onError={() => setFailedUrl(url)} /> : <div role="img" aria-label="Harsimran Singh" className="mx-auto my-8 flex aspect-square w-full max-w-64 items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-serif text-7xl text-[#EAC580]">HS</div>;
}
