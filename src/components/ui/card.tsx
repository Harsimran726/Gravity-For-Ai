import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'outline' | 'warm' | 'dark';
}

export function Card({
  className,
  variant = 'outline',
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    // Hairline border, restrained surface
    outline: 'bg-[#FFFFFF] border border-[#E4E2DC] text-[#0A1B3D]',
    // Warm background for contrast
    warm: 'bg-[#F7F5F0] border border-[#E4E2DC]/80 text-[#0A1B3D]',
    // Dark surface for black rooms
    dark: 'bg-[#122C57]/20 border border-[#233A6B]/50 text-[#FFFFFF]',
  };

  return (
    <div
      className={cn(
        'p-6 sm:p-8 transition-all duration-300 relative',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
