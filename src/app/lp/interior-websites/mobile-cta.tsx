'use client';

import { useEffect, useState } from 'react';

export function MobileEnquiryCta() {
  const [pastSamples, setPastSamples] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const samples = document.getElementById('website-samples');
    const form = document.getElementById('website-enquiry');
    if (!samples || !form) return;
    const sampleObserver = new IntersectionObserver(([entry]) => {
      setPastSamples(entry.boundingClientRect.bottom <= 0);
    });
    const formObserver = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting));
    sampleObserver.observe(samples);
    formObserver.observe(form);
    const submitted = () => setDismissed(true);
    window.addEventListener('website-enquiry-saved', submitted);
    return () => {
      sampleObserver.disconnect();
      formObserver.disconnect();
      window.removeEventListener('website-enquiry-saved', submitted);
    };
  }, []);
  if (!pastSamples || formVisible || dismissed) return null;
  return <aside aria-label="Website consultation" className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-[#D8C8A7] bg-[#F8F6F0]/95 backdrop-blur-md shadow-[0_-8px_28px_rgba(18,44,87,0.12)] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
    <div className="flex items-center gap-3 max-w-lg mx-auto">
      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-[#122C57]">Like what you see?</p><p className="text-[11px] text-slate-600 mt-1">Let’s plan your website.</p></div>
      <a href="#website-enquiry" className="rounded-lg bg-[#122C57] text-white px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#946A26]">Book a call <span aria-hidden="true">↑</span></a>
      <button type="button" aria-label="Dismiss call reminder" onClick={() => setDismissed(true)} className="w-9 h-11 shrink-0 text-[#122C57] text-xl rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#946A26]">×</button>
    </div>
  </aside>;
}
