'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PhoneCall, Globe, Cpu, Database, Sparkles, Activity, ShieldCheck } from 'lucide-react';

export function GravitationalLoopVisual() {
  const shouldReduceMotion = useReducedMotion();

  // 4 Scattered input systems positioned around the perimeter
  const satelliteNodes = [
    {
      id: 'voice',
      label: '24/7 Voice AI',
      sublabel: 'Trilingual Telephony',
      icon: PhoneCall,
      x: 150,
      y: 110,
      accent: '#C99A44',
      bgGlow: 'rgba(201, 154, 68, 0.25)',
      status: 'Live 0.4s pickup',
      pathD: 'M 150 110 Q 260 170 400 250',
    },
    {
      id: 'web',
      label: 'Next.js 14 Web',
      sublabel: 'Sub-2s LCP Edge',
      icon: Globe,
      x: 650,
      y: 110,
      accent: '#34D399',
      bgGlow: 'rgba(52, 211, 153, 0.25)',
      status: '100 Core Vitals',
      pathD: 'M 650 110 Q 540 170 400 250',
    },
    {
      id: 'agentic',
      label: 'Agentic Pipeline',
      sublabel: 'Autonomous Dispatch',
      icon: Cpu,
      x: 150,
      y: 390,
      accent: '#38BDF8',
      bgGlow: 'rgba(56, 189, 248, 0.25)',
      status: 'Multi-agent active',
      pathD: 'M 150 390 Q 260 330 400 250',
    },
    {
      id: 'database',
      label: 'Unified Data Sync',
      sublabel: 'PostgreSQL + CRM',
      icon: Database,
      x: 650,
      y: 390,
      accent: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.25)',
      status: '0 manual data entry',
      pathD: 'M 650 390 Q 540 330 400 250',
    },
  ];

  return (
    <div className="w-full max-w-[860px] mx-auto relative select-none">
      {/* Outer ambient glow backlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#C99A44]/15 via-[#122C57]/30 to-transparent rounded-3xl blur-3xl pointer-events-none -z-10" />

      {/* Main visual canvas container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[420px] sm:min-h-[480px] rounded-3xl border border-[#233A6B]/60 bg-gradient-to-b from-[#0A1832] via-[#071224] to-[#040812] overflow-hidden shadow-[0_0_60px_rgba(10,27,61,0.8)] flex items-center justify-center p-4">
        {/* Subtle coordinate grid lines in background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#C99A44 1px, transparent 1px), radial-gradient(#233A6B 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />

        {/* Center radial illumination spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-r from-[#C99A44]/15 via-[#1E3A6D]/20 to-transparent blur-3xl pointer-events-none" />

        {/* SVG Drawing Layer: Gravitational Waves, Orbits, Connecting Beams & Inbound Particles */}
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            {/* Gradients for connecting beams */}
            <linearGradient id="beamVoice" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C99A44" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#C99A44" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="beamWeb" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="beamAgentic" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="beamDB" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
            </linearGradient>

            {/* Core Golden Singularity Glow */}
            <radialGradient id="coreSingularity" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE4A0" />
              <stop offset="40%" stopColor="#C99A44" />
              <stop offset="85%" stopColor="#8A641A" />
              <stop offset="100%" stopColor="#122C57" />
            </radialGradient>

            {/* Filter for particle glow */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Concentric Background Cosmic Radar Rings */}
          <circle cx="400" cy="250" r="280" fill="none" stroke="#233A6B" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="6 8" />
          <circle cx="400" cy="250" r="210" fill="none" stroke="#233A6B" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 6" />
          <circle cx="400" cy="250" r="140" fill="none" stroke="#3B5998" strokeWidth="1.2" strokeOpacity="0.4" />
          <circle cx="400" cy="250" r="75" fill="none" stroke="#C99A44" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 4" />

          {/* Crosshair coordinate axes through center */}
          <line x1="400" y1="30" x2="400" y2="470" stroke="#1E3A6D" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 8" />
          <line x1="60" y1="250" x2="740" y2="250" stroke="#1E3A6D" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 8" />

          {/* 2. Gravitational Beams: Curved Flux Lines pulling scattered inputs to center */}
          {satelliteNodes.map((node) => (
            <g key={`beam-${node.id}`}>
              {/* Static faint guide path */}
              <path
                d={node.pathD}
                fill="none"
                stroke={node.accent}
                strokeWidth="1.5"
                strokeOpacity="0.35"
                strokeDasharray="4 4"
              />
              
              {/* High-speed animated light pulse stream traveling inward towards (400, 250) */}
              {!shouldReduceMotion && (
                <path
                  d={node.pathD}
                  fill="none"
                  stroke={node.accent}
                  strokeWidth="2.5"
                  strokeOpacity="0.9"
                  strokeDasharray="16 120"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="200"
                    to="0"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </path>
              )}
            </g>
          ))}

          {/* 3. Concentric Expanding Gravitational Pulse Waves (Ripples) from Center */}
          {!shouldReduceMotion && (
            <>
              <circle cx="400" cy="250" r="30" fill="none" stroke="#C99A44" strokeWidth="1.5" opacity="0">
                <animate attributeName="r" from="30" to="180" dur="3.6s" repeatCount="indefinite" begin="0s" />
                <animate attributeName="opacity" from="0.7" to="0" dur="3.6s" repeatCount="indefinite" begin="0s" />
              </circle>
              <circle cx="400" cy="250" r="30" fill="none" stroke="#C99A44" strokeWidth="1.5" opacity="0">
                <animate attributeName="r" from="30" to="180" dur="3.6s" repeatCount="indefinite" begin="1.2s" />
                <animate attributeName="opacity" from="0.7" to="0" dur="3.6s" repeatCount="indefinite" begin="1.2s" />
              </circle>
              <circle cx="400" cy="250" r="30" fill="none" stroke="#C99A44" strokeWidth="1.5" opacity="0">
                <animate attributeName="r" from="30" to="180" dur="3.6s" repeatCount="indefinite" begin="2.4s" />
                <animate attributeName="opacity" from="0.7" to="0" dur="3.6s" repeatCount="indefinite" begin="2.4s" />
              </circle>
            </>
          )}

          {/* 4. Orbiting Satellite Spheres revolving in mid orbit */}
          {!shouldReduceMotion && (
            <g>
              {/* Satellite 1 revolving at r=140 */}
              <circle r="5" fill="#C99A44" filter="url(#glow)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 400 250"
                  to="360 400 250"
                  dur="14s"
                  repeatCount="indefinite"
                />
                <animate attributeName="cx" values="540" dur="14s" repeatCount="indefinite" />
                <animate attributeName="cy" values="250" dur="14s" repeatCount="indefinite" />
              </circle>

              {/* Satellite 2 revolving at r=210 counter-clockwise */}
              <circle r="4" fill="#38BDF8" filter="url(#glow)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="360 400 250"
                  to="0 400 250"
                  dur="22s"
                  repeatCount="indefinite"
                />
                <animate attributeName="cx" values="400" dur="22s" repeatCount="indefinite" />
                <animate attributeName="cy" values="40" dur="22s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </svg>

        {/* 5. Center Gyroscope & Gravity Core Mechanism (DOM Layer) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
          {/* Gyroscope Outer Ring 1: Clockwise */}
          <motion.div
            className="absolute w-44 h-44 rounded-full border border-[#C99A44]/30 border-dashed pointer-events-none"
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
          />

          {/* Gyroscope Middle Ring 2: Counter-Clockwise with tick accents */}
          <motion.div
            className="absolute w-36 h-36 rounded-full border-2 border-t-[#C99A44]/70 border-r-transparent border-b-[#38BDF8]/60 border-l-transparent pointer-events-none"
            animate={shouldReduceMotion ? {} : { rotate: -360 }}
            transition={{ duration: 16, ease: 'linear', repeat: Infinity }}
          />

          {/* Gyroscope Inner Ring 3: Fast spin */}
          <motion.div
            className="absolute w-28 h-28 rounded-full border border-[#FFE4A0]/40 border-dotted pointer-events-none"
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 9, ease: 'linear', repeat: Infinity }}
          />

          {/* Central Gravity Singularity Node */}
          <motion.div
            className="relative z-20 w-20 h-20 rounded-full bg-gradient-to-tr from-[#946F22] via-[#C99A44] to-[#FCE6A4] p-0.5 shadow-[0_0_45px_rgba(201,154,68,0.8)] cursor-pointer group flex items-center justify-center"
            animate={shouldReduceMotion ? {} : { scale: [1, 1.06, 1] }}
            transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
            whileHover={{ scale: 1.15 }}
          >
            <div className="w-full h-full rounded-full bg-[#0A1832] flex flex-col items-center justify-center relative overflow-hidden border border-[#FFE4A0]/50">
              {/* Inner ambient pulse */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(201,154,68,0.4)_0%,_transparent_70%)] animate-pulse" />

              {/* Gravitational Singularity Icon */}
              <Sparkles className="w-6 h-6 text-[#FFE4A0] relative z-10 transition-transform duration-300 group-hover:rotate-180" />
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#E4E2DC] font-bold mt-0.5 relative z-10">
                GRAVITY
              </span>
            </div>

            {/* Orbiting halo particle on core surface */}
            <motion.div
              className="absolute w-2.5 h-2.5 rounded-full bg-[#FFE4A0] shadow-[0_0_10px_#FFE4A0]"
              style={{ top: -3, left: '50%' }}
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* 6. The 4 Floating System Satellite Cards (Scattered Effort Pulled In) */}
        {/* Top-Left: Voice AI */}
        <div className="absolute top-3 sm:top-6 left-3 sm:left-6 max-w-[155px] sm:max-w-[195px] z-20">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0A1832]/85 backdrop-blur-md border border-[#C99A44]/40 shadow-lg hover:border-[#C99A44] transition-all group">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#C99A44]/20 border border-[#C99A44]/40 flex items-center justify-center text-[#C99A44] shrink-0">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase font-semibold text-[#F7F5F0] truncate">
                  24/7 Voice AI
                </p>
                <p className="text-[9px] text-[#C99A44] font-mono">0 Missed Calls</p>
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-[#A0AEC0]">
              <span>Punjabi · Hindi · Eng</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
        </div>

        {/* Top-Right: Next.js Web */}
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6 max-w-[155px] sm:max-w-[195px] z-20">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0A1832]/85 backdrop-blur-md border border-emerald-500/40 shadow-lg hover:border-emerald-400 transition-all group">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase font-semibold text-[#F7F5F0] truncate">
                  Next.js 14 Web
                </p>
                <p className="text-[9px] text-emerald-400 font-mono">Sub-2s LCP Edge</p>
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-[#A0AEC0]">
              <span>Lighthouse 100/100</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom-Left: Agentic AI */}
        <div className="absolute bottom-11 sm:bottom-13 left-3 sm:left-6 max-w-[155px] sm:max-w-[195px] z-20">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0A1832]/85 backdrop-blur-md border border-sky-500/40 shadow-lg hover:border-sky-400 transition-all group">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase font-semibold text-[#F7F5F0] truncate">
                  Agentic Flows
                </p>
                <p className="text-[9px] text-sky-400 font-mono">15+ Hrs Reclaimed</p>
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-[#A0AEC0]">
              <span>WhatsApp · Invoicing</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom-Right: Unified DB */}
        <div className="absolute bottom-11 sm:bottom-13 right-3 sm:right-6 max-w-[155px] sm:max-w-[195px] z-20">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0A1832]/85 backdrop-blur-md border border-amber-500/40 shadow-lg hover:border-amber-400 transition-all group">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase font-semibold text-[#F7F5F0] truncate">
                  Central Database
                </p>
                <p className="text-[9px] text-amber-400 font-mono">0 Manual Data Entry</p>
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-[#A0AEC0]">
              <span>Single Source Truth</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 7. Bottom Telemetry Status Strip */}
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-20 flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-[#050C1A]/90 backdrop-blur-md border border-[#233A6B] text-[10px] font-mono text-[#E4E2DC] flex items-center gap-2 sm:gap-5 shadow-xl">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C99A44] animate-ping" />
              <span className="text-[#C99A44] font-semibold">GRAVITATIONAL EQUILIBRIUM</span>
            </div>
            <span className="hidden sm:inline text-white/30">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-[#34D399]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>0 OPERATIONAL FRICTION</span>
            </div>
            <span className="hidden sm:inline text-white/30">|</span>
            <div className="flex items-center gap-1.5 text-sky-400">
              <Activity className="w-3.5 h-3.5" />
              <span>100% SYNCHRONIZED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
