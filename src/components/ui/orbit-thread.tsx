'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion';

export function OrbitScrollThread() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const rotation = useTransform(smoothProgress, [0, 1], [0, 360]);

  // Hide on admin routes or when user prefers reduced motion
  if (pathname?.startsWith('/admin') || shouldReduceMotion) return null;

  return (
    <div
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none select-none hidden lg:block opacity-60 hover:opacity-100 transition-opacity"
      aria-hidden="true"
    >
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Background track */}
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <circle
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke="#122C57"
            strokeWidth="1"
            strokeOpacity="0.15"
          />
        </svg>

        {/* Rotating arc with gold dot */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ rotate: rotation }}
        >
          <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
            <circle
              cx="30"
              cy="6"
              r="3.5"
              fill="#C99A44"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
