'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'dark-cta' | 'link';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  isExternal?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, isExternal, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 relative group outline-none focus-visible:ring-2 focus-visible:ring-[#C99A44] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    const sizeStyles = {
      sm: 'text-xs px-4 py-2 tracking-wide',
      md: 'text-sm px-6 py-3 tracking-wide',
      lg: 'text-base px-8 py-4 tracking-wide',
    };

    const variantStyles = {
      // Solid navy fill, white text, gold hover underline (no gold fill)
      primary:
        'bg-[#122C57] text-[#FFFFFF] hover:bg-[#0A1B3D] shadow-sm active:scale-[0.99] after:content-[""] after:absolute after:bottom-1.5 after:left-6 after:right-6 after:h-[2px] after:bg-[#C99A44] after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left',
      // Hairline border, quiet presence
      ghost:
        'bg-transparent text-[#122C57] border border-[#E4E2DC] hover:border-[#122C57] hover:bg-[#F7F5F0]/60 active:scale-[0.99]',
      // Dark room closing CTA: gold-bordered outline on black, white text
      'dark-cta':
        'bg-transparent text-[#FFFFFF] border border-[#C99A44] hover:bg-[#C99A44]/10 active:scale-[0.99] tracking-wider',
      // Inline link style
      link:
        'bg-transparent text-[#122C57] p-0 underline-offset-4 hover:underline after:hidden',
    };

    const combinedClassName = cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className
    );

    if (href) {
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={combinedClassName}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={combinedClassName}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
