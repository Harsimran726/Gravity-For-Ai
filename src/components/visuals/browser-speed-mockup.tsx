'use client';

import * as React from 'react';
import { Gauge, Zap, Globe, CheckCircle2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function BrowserSpeedMockup() {
  return (
    <div className="w-full max-w-[460px] rounded-2xl bg-[#FFFFFF] border border-[#E4E2DC] shadow-2xl overflow-hidden font-sans">
      {/* Browser Chrome Header */}
      <div className="bg-[#F7F5F0] border-b border-[#E4E2DC] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E4E2DC] block" />
          <span className="w-3 h-3 rounded-full bg-[#E4E2DC] block" />
          <span className="w-3 h-3 rounded-full bg-[#E4E2DC] block" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFFFFF] border border-[#E4E2DC] text-[11px] font-mono text-[#6B7280] w-64 max-w-[200px] truncate">
          <Globe className="w-3 h-3 text-[#122C57]" />
          <span>https://yourbusiness.com</span>
        </div>
        <div className="w-4" />
      </div>

      {/* Website Hero Preview Frame */}
      <div className="p-6 bg-gradient-to-b from-[#FDFCFB] to-[#FFFFFF] border-b border-[#E4E2DC] space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded bg-[#122C57]/10 text-[#122C57] text-[10px] font-mono uppercase font-semibold">
            Next.js 14 · Sub-2s LCP
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-medium">
            <Zap className="w-3 h-3 fill-emerald-500" />
            <span>1.1s Load Time</span>
          </span>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-[#122C57]/15 rounded" />
          <div className="h-3 w-5/6 bg-[#0A1B3D]/10 rounded" />
          <div className="h-3 w-2/3 bg-[#0A1B3D]/10 rounded" />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="h-7 px-4 bg-[#122C57] rounded-sm flex items-center justify-center text-[10px] font-mono uppercase text-[#FFFFFF] font-semibold">
            Book an Audit
          </div>
          <div className="h-7 px-3 border border-[#E4E2DC] rounded-sm flex items-center justify-center text-[10px] font-mono uppercase text-[#122C57]">
            Explore Services
          </div>
        </div>
      </div>

      {/* Lighthouse 100/100 Benchmark Dashboard */}
      <div className="p-5 bg-[#FAFAF8] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#C99A44]" />
            <span>Google Lighthouse Audit</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase font-semibold">
            Grade A+
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Performance', score: '100' },
            { label: 'Accessibility', score: '100' },
            { label: 'Best Practices', score: '100' },
            { label: 'SEO & AEO', score: '100' },
          ].map((item) => (
            <div key={item.label} className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E4E2DC] shadow-sm">
              <div className="w-9 h-9 mx-auto rounded-full border-2 border-emerald-500 flex items-center justify-center font-mono text-xs font-bold text-emerald-600">
                {item.score}
              </div>
              <p className="text-[10px] font-sans font-medium text-[#0A1B3D] mt-1.5 truncate">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Verification Checkpoint */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#6B7280] font-mono border-t border-[#E4E2DC]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>JSON-LD Schema Verified</span>
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#122C57]" />
            <span>100% Zero Lock-In</span>
          </span>
        </div>
      </div>
    </div>
  );
}
