'use client';

import * as React from 'react';
import { PhoneCall, Calendar, ShieldCheck, Volume2, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export function VoiceAgentMockup({
  callerName = 'Prospective Patient / Client',
  city = 'Punjab',
}: {
  callerName?: string;
  city?: string;
}) {
  return (
    <div className="w-full max-w-[440px] rounded-2xl bg-[#0A1B3D] text-[#F7F5F0] p-6 shadow-2xl border border-[#233A6B] relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#C99A44]/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#122C57]/40 blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#233A6B] relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <PhoneCall className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              Live Inbound Call · 00:42
            </p>
            <p className="text-sm font-medium text-[#F7F5F0]">{callerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#122C57] text-[10px] font-mono uppercase text-[#C99A44] border border-[#233A6B]">
          <Mic className="w-3 h-3" />
          <span>Trilingual AI</span>
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div className="my-5 p-3 rounded-lg bg-[#0F234D]/60 border border-[#233A6B]/70 flex items-center justify-between gap-1.5 relative z-10">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-[#C99A44]" />
          <span className="text-[11px] font-mono text-[#E4E2DC]/80">Audio Waveform (Natural Cadence)</span>
        </div>
        <div className="flex items-end gap-1 h-5">
          {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 30].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 bg-[#C99A44] rounded-full"
              animate={{
                height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.08,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* Dialogue Stream */}
      <div className="space-y-3 text-xs relative z-10">
        {/* Caller Bubble */}
        <div className="flex flex-col items-start space-y-1">
          <span className="text-[10px] font-mono text-[#6B7280] uppercase">Caller ({city})</span>
          <div className="p-3 rounded-2xl rounded-tl-sm bg-[#122C57] text-[#E4E2DC] border border-[#233A6B] max-w-[90%] leading-relaxed">
            &ldquo;Sat Sri Akal, can I get an appointment with your specialist this Wednesday at 11:00 AM?&rdquo;
          </div>
        </div>

        {/* AI Voice Bubble */}
        <div className="flex flex-col items-end space-y-1">
          <span className="text-[10px] font-mono text-[#C99A44] uppercase">Gravity Voice Agent</span>
          <div className="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#1E3A6D] to-[#122C57] text-[#FFFFFF] border border-[#C99A44]/40 max-w-[92%] leading-relaxed shadow-sm">
            &ldquo;Sat Sri Akal ji! Wednesday at 11:00 AM is available. I have reserved the slot and sent an SMS confirmation to this number.&rdquo;
          </div>
        </div>
      </div>

      {/* Bottom Action / Sync Status */}
      <div className="mt-5 pt-4 border-t border-[#233A6B] flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Google Calendar Synced</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#E4E2DC]/70">
          <Calendar className="w-3.5 h-3.5 text-[#C99A44]" />
          <span>Wed, 11:00 AM IST</span>
        </div>
      </div>
    </div>
  );
}
