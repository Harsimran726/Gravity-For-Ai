'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  variant?: 'white' | 'warm' | 'black';
  children: React.ReactNode;
  containerSize?: 'default' | 'narrow' | 'full';
  animate?: boolean;
  className?: string;
  id?: string;
}

export function SectionWrapper({
  variant = 'white',
  children,
  containerSize = 'default',
  animate = true,
  className,
  id,
}: SectionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    white: 'bg-[#FFFFFF] text-[#0A1B3D]',
    warm: 'bg-[#F7F5F0] text-[#0A1B3D]',
    black: 'bg-[#0A0A0D] text-[#FFFFFF]',
  };

  const containerWidths = {
    default: 'max-w-[1240px]',
    narrow: 'max-w-[840px]',
    full: 'w-full',
  };

  const content = (
    <div className={cn('mx-auto px-6 sm:px-8 lg:px-12 w-full', containerWidths[containerSize])}>
      {children}
    </div>
  );

  if (!animate || shouldReduceMotion) {
    return (
      <section
        id={id}
        className={cn(
          'py-20 sm:py-28 lg:py-36 relative overflow-hidden transition-colors',
          variantStyles[variant],
          className
        )}
      >
        {content}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      className={cn(
        'py-20 sm:py-28 lg:py-36 relative overflow-hidden transition-colors',
        variantStyles[variant],
        className
      )}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.section>
  );
}
