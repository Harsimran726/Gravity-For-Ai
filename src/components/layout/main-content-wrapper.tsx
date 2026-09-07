'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        'flex-grow focus:outline-none',
        isAdmin ? 'pt-0' : 'pt-20'
      )}
    >
      {children}
    </main>
  );
}
