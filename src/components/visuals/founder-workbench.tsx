'use client';

import * as React from 'react';
import { Terminal, ShieldCheck, MapPin, Award, GitBranch, Cpu } from 'lucide-react';

export function FounderWorkbench() {
  return (
    <div className="w-full max-w-[440px] rounded-2xl bg-[#0A1B3D] text-[#F7F5F0] border border-[#233A6B] shadow-2xl overflow-hidden font-sans">
      {/* Terminal Titlebar */}
      <div className="bg-[#0A1428] px-4 py-3 border-b border-[#233A6B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#C99A44]">
          <Terminal className="w-3.5 h-3.5" />
          <span>lead-engineer@gravityforai:~$</span>
        </div>
        <div className="w-4" />
      </div>

      {/* Profile Header */}
      <div className="p-6 border-b border-[#233A6B]/80 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#122C57] text-[#C99A44] border border-[#233A6B] text-[10px] font-mono uppercase font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified Engineering Lead</span>
            </div>
            <h3 className="font-serif text-2xl text-[#FFFFFF] font-normal pt-1">Harsimran Singh</h3>
            <p className="text-xs font-mono text-[#E4E2DC]/70">Founder &amp; AI Systems Architect</p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#122C57] border border-[#C99A44]/40 flex items-center justify-center text-[#C99A44] font-mono text-lg font-bold shadow-inner">
            HS
          </div>
        </div>

        {/* Location & Focus */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#0F234D]/60 border border-[#233A6B]/60 space-y-1">
            <span className="text-[10px] text-[#6B7280] uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C99A44]" /> HQ Location
            </span>
            <p className="text-xs text-[#F7F5F0] font-medium">Mansa, Punjab</p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0F234D]/60 border border-[#233A6B]/60 space-y-1">
            <span className="text-[10px] text-[#6B7280] uppercase flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#C99A44]" /> Core Focus
            </span>
            <p className="text-xs text-[#F7F5F0] font-medium">Agentic AI &amp; Math</p>
          </div>
        </div>
      </div>

      {/* Tech Stack Terminal Matrix */}
      <div className="p-6 bg-[#08152E]/90 space-y-3 font-mono text-xs">
        <p className="text-[11px] text-[#C99A44] uppercase tracking-wider font-semibold">
          Engineering Competencies:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            'Agentic AI Workflows',
            'LLM Foundations',
            'Python & Machine Learning',
            'Next.js 14 Web Architecture',
            'Telephony & Voice Pipelines',
            'LocalBusiness SEO & AEO',
          ].map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded bg-[#122C57] text-[#E4E2DC] text-[11px] border border-[#233A6B]"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="pt-3 border-t border-[#233A6B]/80 flex items-center justify-between text-[11px] text-[#E4E2DC]/60">
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-emerald-400" />
            <span>Architecture: Done-For-You</span>
          </span>
          <span className="text-[#C99A44]">Zero Tech Debt</span>
        </div>
      </div>
    </div>
  );
}
