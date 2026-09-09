'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ZeroGravity } from '@/components/ui/physics-effects';
import { motion, useReducedMotion } from 'framer-motion';

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[88vh] flex items-center bg-[#FFFFFF] overflow-hidden py-16 sm:py-24 lg:py-32">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Narrative Column */}
        <div className="lg:col-span-7 space-y-8 z-10">
          {/* Location Badge linking to Mansa Hub */}
          <Link
            href="/locations/mansa"
            className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono tracking-wider uppercase text-[#122C57] hover:border-[#C99A44] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
            <span>Mansa, Punjab &amp; Beyond (HQ) →</span>
          </Link>

          {/* Primary H1 */}
          <motion.h1
            className="font-serif text-4xl sm:text-6xl lg:text-[74px] leading-[1.05] text-[#122C57] font-normal tracking-tight"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Automate Your Local Business - Without Writing a Line of Code
          </motion.h1>

          {/* Subheadline: Who + How */}
          <motion.p
            className="font-sans text-base sm:text-lg lg:text-xl text-[#0A1B3D]/80 max-w-xl leading-relaxed"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            AI voice agents, agentic automation, and websites built and managed for you - for businesses across Punjab and beyond who don&apos;t have time to become AI experts themselves.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <Button href="/contact" size="lg" variant="primary">
              Book an AI Audit
            </Button>
            <Button href="/services" size="lg" variant="ghost">
              Explore Services &amp; AI Stack →
            </Button>
          </motion.div>
        </div>

        {/* Visual Motif: Animated Logo MP4 Video with Zero Gravity float */}
        <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
          <ZeroGravity className="relative w-full max-w-[460px] flex items-center justify-center">
            <video
              src="/logo-animation.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-auto max-w-[440px] aspect-square object-contain rounded-2xl drop-shadow-2xl"
              aria-label="Gravity For AI animated logo"
            />
          </ZeroGravity>
        </div>
      </div>
    </section>
  );
}
