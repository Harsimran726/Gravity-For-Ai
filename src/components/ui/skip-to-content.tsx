import * as React from 'react';

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#122C57] focus:text-[#FFFFFF] focus:border focus:border-[#C99A44] focus:text-xs focus:font-mono focus:outline-none focus:ring-2 focus:ring-[#C99A44]"
    >
      Skip to main content
    </a>
  );
}
