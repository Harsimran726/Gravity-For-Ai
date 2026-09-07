'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OrbitAuraProps {
  size?: number;
  className?: string;
  variant?: 'hero' | 'philosophy' | 'compact' | 'satellite';
  isDark?: boolean;
}

export function OrbitAura({
  size = 500,
  className,
  variant = 'hero',
  isDark = false,
}: OrbitAuraProps) {
  const shouldReduceMotion = useReducedMotion();

  const ringStroke = isDark ? '#233A6B' : '#122C57';
  const ringOpacity = isDark ? 0.35 : 0.2;
  const sphereColor = '#C99A44';

  if (shouldReduceMotion) {
    return (
      <div
        className={cn('relative pointer-events-none select-none', className)}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <circle
            cx="250"
            cy="250"
            r="200"
            fill="none"
            stroke={ringStroke}
            strokeWidth="1.5"
            strokeOpacity={ringOpacity}
          />
          <circle cx="410" cy="130" r="10" fill={sphereColor} />
        </svg>
      </div>
    );
  }

  if (variant === 'philosophy') {
    // Large, slow, continuous rotation (1 rotation per 40s) for the dark room
    return (
      <div
        className={cn('relative pointer-events-none select-none flex items-center justify-center', className)}
        style={{ width: size, height: size }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        >
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            {/* Outer faint orbit */}
            <circle
              cx="250"
              cy="250"
              r="220"
              fill="none"
              stroke="#2A4374"
              strokeWidth="1"
              strokeOpacity="0.2"
              strokeDasharray="4 6"
            />
            {/* Main solid orbit ring */}
            <circle
              cx="250"
              cy="250"
              r="180"
              fill="none"
              stroke="#3B5998"
              strokeWidth="1.5"
              strokeOpacity="0.45"
            />
            {/* Orbiting gold sphere (resting at tangent) */}
            <circle cx="390" cy="140" r="9" fill={sphereColor} />
            <circle cx="390" cy="140" r="16" fill={sphereColor} fillOpacity="0.15" />
          </svg>
        </motion.div>
      </div>
    );
  }

  // Default 'hero' orchestration: Ring draws in, sphere travels and settles
  return (
    <div
      className={cn('relative pointer-events-none select-none', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {/* Subtle inner reference arc */}
        <motion.circle
          cx="250"
          cy="250"
          r="140"
          fill="none"
          stroke={ringStroke}
          strokeWidth="1"
          strokeDasharray="2 4"
          strokeOpacity={ringOpacity * 0.6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        {/* Main Navy Orbit Path */}
        <motion.circle
          cx="250"
          cy="250"
          r="200"
          fill="none"
          stroke={ringStroke}
          strokeWidth="1.5"
          strokeOpacity={ringOpacity}
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1, rotate: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: '250px', originY: '250px' }}
        />

        {/* Orbit Gold Sphere (Traveling along arc to anchor point) */}
        <motion.g
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: '250px', originY: '250px' }}
        >
          {/* Subtle glow aura */}
          <circle cx="410" cy="130" r="18" fill={sphereColor} fillOpacity="0.12" />
          {/* Gold Sphere (Focal Accent, 20px diameter) */}
          <circle cx="410" cy="130" r="10" fill={sphereColor} />
          {/* Highlight glint */}
          <circle cx="407" cy="127" r="3" fill="#E2B14E" />
        </motion.g>
      </svg>
    </div>
  );
}
