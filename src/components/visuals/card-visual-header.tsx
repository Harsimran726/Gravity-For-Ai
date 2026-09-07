'use client';

import * as React from 'react';
import { PhoneCall, Globe, Cpu, BarChart3, Database, Layers } from 'lucide-react';

export function CardVisualHeader({
  type = 'voice',
  title = '',
  metric = '',
}: {
  type?: 'voice' | 'web' | 'agentic' | 'clinic' | 'logistics' | 'export';
  title?: string;
  metric?: string;
}) {
  const configs = {
    voice: {
      gradient: 'from-[#0A1B3D] to-[#122C57]',
      icon: PhoneCall,
      tag: '24/7 Voice AI',
      badge: 'Trilingual Telephony',
      accent: 'text-[#C99A44]',
      bgAccent: 'bg-[#C99A44]/15',
    },
    web: {
      gradient: 'from-[#0F234D] to-[#1E3A6D]',
      icon: Globe,
      tag: 'Next.js 14',
      badge: 'Sub-2s LCP Verified',
      accent: 'text-emerald-400',
      bgAccent: 'bg-emerald-500/15',
    },
    agentic: {
      gradient: 'from-[#122C57] to-[#0A1428]',
      icon: Cpu,
      tag: 'Multi-Agent Flow',
      badge: 'Autonomous Pipeline',
      accent: 'text-sky-400',
      bgAccent: 'bg-sky-500/15',
    },
    clinic: {
      gradient: 'from-[#0A1B3D] to-[#1A3365]',
      icon: PhoneCall,
      tag: 'Healthcare Clinic',
      badge: '+42 Bookings / Mo',
      accent: 'text-[#C99A44]',
      bgAccent: 'bg-[#C99A44]/15',
    },
    logistics: {
      gradient: 'from-[#122C57] to-[#0D1F42]',
      icon: Database,
      tag: 'Dispatch Automation',
      badge: '18 Hrs / Wk Saved',
      accent: 'text-emerald-400',
      bgAccent: 'bg-emerald-500/15',
    },
    export: {
      gradient: 'from-[#0F2854] to-[#08152E]',
      icon: Layers,
      tag: 'Industrial Portal',
      badge: '3.8x Qualified RFQs',
      accent: 'text-amber-400',
      bgAccent: 'bg-amber-500/15',
    },
  };

  const current = configs[type] || configs.voice;
  const Icon = current.icon;

  return (
    <div
      className={`w-full h-36 rounded-xl bg-gradient-to-br ${current.gradient} p-4 text-[#F7F5F0] relative overflow-hidden flex flex-col justify-between border border-[#233A6B] shadow-inner`}
    >
      {/* Background Graphic Lines */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-24 h-24 border border-white/10 rounded-full pointer-events-none" />

      {/* Top Tag & Metric Badge */}
      <div className="flex items-center justify-between relative z-10">
        <span className="px-2 py-0.5 rounded bg-black/30 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider text-[#E4E2DC]">
          {current.tag}
        </span>
        <span
          className={`px-2 py-0.5 rounded ${current.bgAccent} ${current.accent} text-[10px] font-mono uppercase font-semibold border border-white/10`}
        >
          {metric || current.badge}
        </span>
      </div>

      {/* Center Icon & Graphic */}
      <div className="flex items-center justify-between relative z-10">
        <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-[#FFFFFF]">
          <Icon className={`w-5 h-5 ${current.accent}`} />
        </div>
        {/* Subtle decorative visual waveform / metric chart bars */}
        <div className="flex items-end gap-1 h-5 opacity-70">
          <span className="w-1 h-2 bg-[#C99A44] rounded-full" />
          <span className="w-1 h-4 bg-[#C99A44] rounded-full" />
          <span className="w-1 h-3 bg-[#C99A44] rounded-full" />
          <span className="w-1 h-5 bg-[#C99A44] rounded-full" />
          <span className="w-1 h-2.5 bg-[#C99A44] rounded-full" />
        </div>
      </div>
    </div>
  );
}
