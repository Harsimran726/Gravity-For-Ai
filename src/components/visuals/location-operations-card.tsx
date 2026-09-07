'use client';

import * as React from 'react';
import { PhoneCall, Calendar, MapPin, Globe2, ShieldCheck, Clock } from 'lucide-react';

export function LocationOperationsCard({
  cityName = 'Mansa',
  region = 'Punjab',
}: {
  cityName?: string;
  region?: string;
}) {
  return (
    <div className="w-full max-w-[440px] rounded-2xl bg-[#0A1B3D] text-[#F7F5F0] p-6 shadow-2xl border border-[#233A6B] relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#C99A44]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#233A6B]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#122C57] border border-[#C99A44]/40 flex items-center justify-center text-[#C99A44]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#C99A44] font-semibold">
              Local Operation Center
            </p>
            <p className="text-sm font-medium text-[#FFFFFF]">{cityName}, {region}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-semibold border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active 24/7
        </span>
      </div>

      {/* Grid of Key Capabilities for this city */}
      <div className="grid grid-cols-2 gap-3 my-5">
        <div className="p-3 rounded-xl bg-[#0F234D]/70 border border-[#233A6B] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#E4E2DC]/80 font-mono">
            <PhoneCall className="w-3.5 h-3.5 text-[#C99A44]" />
            <span>AI Reception</span>
          </div>
          <p className="text-xs font-semibold text-[#FFFFFF]">0 Missed Inquiries</p>
          <p className="text-[10px] text-[#6B7280]">Instant 2s pickup</p>
        </div>

        <div className="p-3 rounded-xl bg-[#0F234D]/70 border border-[#233A6B] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#E4E2DC]/80 font-mono">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local SEO Speed</span>
          </div>
          <p className="text-xs font-semibold text-[#FFFFFF]">Sub-2s Web LCP</p>
          <p className="text-[10px] text-[#6B7280]">Google 3-Pack rank</p>
        </div>
      </div>

      {/* Live Availability Simulation */}
      <div className="p-3.5 rounded-xl bg-[#122C57]/80 border border-[#233A6B] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-[#E4E2DC]/80">Regional Intake Pipeline</span>
          <span className="font-mono text-[10px] text-emerald-400 font-semibold">Done-For-You</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#F7F5F0]">
          <Clock className="w-3.5 h-3.5 text-[#C99A44]" />
          <span>Local Discovery Audit Available This Week</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[#233A6B] flex items-center justify-between text-[11px] font-mono text-[#E4E2DC]/60">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>No Tech Department Needed</span>
        </span>
        <span className="text-[#C99A44]">Gravity For AI</span>
      </div>
    </div>
  );
}
