'use client';

import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FAQ_ITEMS } from '@/data/faq-data';
import { ScrollReveal, StaggerReveal, GravityPull } from '@/components/ui/physics-effects';

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <SectionWrapper variant="warm" id="faq">
      <ScrollReveal>
        <div className="max-w-3xl space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            Questions & Answers
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#0A1B3D]/80">
            Everything you need to know about working with Gravity For AI.
          </p>
        </div>
      </ScrollReveal>

      <StaggerReveal className="max-w-3xl mt-12 space-y-4">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <GravityPull key={item.question}>
              <div
                className="border border-[#E4E2DC] bg-[#FFFFFF] transition-colors"
              >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A44]"
                aria-expanded={isOpen}
              >
                <span className="font-sans font-medium text-base sm:text-lg text-[#122C57] pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-[#122C57] shrink-0 transition-transform duration-200',
                    isOpen ? 'rotate-180 text-[#C99A44]' : ''
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-[#6B7280] leading-relaxed border-t border-[#E4E2DC]/50">
                  {item.answer}
                </div>
              )}
            </div>
            </GravityPull>
          );
        })}
      </StaggerReveal>
    </SectionWrapper>
  );
}
