'use client';

import * as React from 'react';
import { XCircle, CheckCircle2, PhoneOff, PhoneCall, FileSpreadsheet, Zap, Clock } from 'lucide-react';

export function OperationalComparison() {
  return (
    <div className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E4E2DC] shadow-lg overflow-hidden font-sans my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E4E2DC]">
        {/* Left: The Manual Way */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5]/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-[10px] font-mono uppercase font-semibold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Manual Operational Friction</span>
            </span>
            <span className="text-xs font-mono text-[#6B7280]">Without Gravity</span>
          </div>

          <h4 className="font-serif text-xl text-[#122C57]">The Fragmented Way</h4>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Front-desk phones ring unanswered during lunch and after 7 PM. Staff manually copy numbers between WhatsApp and paper ledgers.
          </p>

          <div className="space-y-2.5 pt-2 text-xs text-[#0A1B3D]/80">
            <div className="flex items-center gap-2.5 p-2 rounded bg-[#FFFFFF] border border-[#E4E2DC]">
              <PhoneOff className="w-4 h-4 text-rose-500 shrink-0" />
              <span>30-40% of evening calls go completely unaddressed</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded bg-[#FFFFFF] border border-[#E4E2DC]">
              <FileSpreadsheet className="w-4 h-4 text-rose-500 shrink-0" />
              <span>15+ hours weekly wasted re-typing appointment data</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded bg-[#FFFFFF] border border-[#E4E2DC]">
              <Clock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Slow inquiry response drives callers to local competitors</span>
            </div>
          </div>
        </div>

        {/* Right: The Gravity Automated Flow */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gravity Automated System</span>
            </span>
            <span className="text-xs font-mono text-[#C99A44] font-medium">Done-For-You</span>
          </div>

          <h4 className="font-serif text-xl text-[#122C57]">The Coordinated Engine</h4>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Every telephone call is picked up within 2 seconds. The AI qualifies caller intent, answers in Punjabi, Hindi, or English, and reserves the calendar.
          </p>

          <div className="space-y-2.5 pt-2 text-xs text-[#0A1B3D]/90">
            <div className="flex items-center gap-2.5 p-2 rounded bg-[#F7F5F0] border border-[#E4E2DC]">
              <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium text-[#122C57]">Zero missed calls 24/7/365 with natural cadence</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded bg-[#F7F5F0] border border-[#E4E2DC]">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium text-[#122C57]">Instant calendar booking and SMS confirmation sent</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded bg-[#F7F5F0] border border-[#E4E2DC]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium text-[#122C57]">Multi-agent workflows synchronize CRM and records</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
