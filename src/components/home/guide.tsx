import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { ZeroGravity, HeavyDraggable } from '@/components/ui/physics-effects';

const STATS = [
  { value: '24/7', label: 'Continuous AI Availability', detail: 'Zero downtime call answering' },
  { value: '100%', label: 'Custom Architecture', detail: 'Built around your exact workflow' },
  { value: '< 2.0s', label: 'Target Load Time', detail: 'Core Web Vitals engineered' },
  { value: 'Mansa', label: 'Punjab HQ & Global Reach', detail: 'Direct engineering, no middlemen' },
];

const TESTIMONIALS = [
  {
    name: 'Dr. Raman K.',
    role: 'Clinic Founder',
    city: 'Mansa, Punjab',
    quote:
      'We used to lose patients who called after 7 PM. The AI voice agent answers every call in Punjabi and English, answers routine questions, and books appointments straight into our calendar.',
    rating: 5,
  },
  {
    name: 'Gurpreet S.',
    role: 'Operations Director',
    city: 'Bathinda, Punjab',
    quote:
      'Instead of an agency trying to sell us 10 different subscription tools, Gravity built a single automated pipeline. It saves our dispatch team at least 15 hours of repetitive data entry every single week.',
    rating: 5,
  },
  {
    name: 'Amanpreet M.',
    role: 'Managing Partner',
    city: 'Ludhiana, Punjab',
    quote:
      'Our new website and intake automation represent our brand with genuine authority. Clean typography, instant loading speed, and inquiries flow directly into our notifications.',
    rating: 5,
  },
];

export function GuideSection() {
  return (
    <SectionWrapper variant="warm" id="proof">
      <div className="space-y-4 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
          Authority &amp; Trust
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
          Why Local Businesses Trust Us
        </h2>
        <p className="text-sm sm:text-base text-[#0A1B3D]/80">
          We combine advanced agentic AI engineering with direct local accessibility.
        </p>
      </div>

      {/* Stats Bar - zero gravity float */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 my-14 pt-4 border-t border-b border-[#E4E2DC] py-8">
        {STATS.map((stat, i) => (
          <ZeroGravity key={stat.label} delay={i * 1.5} className="space-y-1">
            <p className="font-mono text-3xl sm:text-4xl font-semibold text-[#122C57] tracking-tight">
              {stat.value}
            </p>
            <p className="font-sans font-medium text-xs sm:text-sm text-[#0A1B3D]">{stat.label}</p>
            <p className="font-sans text-[11px] text-[#6B7280]">{stat.detail}</p>
          </ZeroGravity>
        ))}
      </div>

      {/* Testimonials - heavy draggable cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {TESTIMONIALS.map((testimonial) => (
          <HeavyDraggable key={testimonial.name}>
            <Card variant="outline" className="flex flex-col justify-between space-y-6 h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#C99A44]">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C99A44]" />
                  ))}
                </div>
                <p className="font-serif text-base sm:text-lg text-[#0A1B3D] leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E2DC]">
                <p className="font-sans font-medium text-sm text-[#122C57]">{testimonial.name}</p>
                <p className="text-xs text-[#6B7280]">
                  {testimonial.role} · <span className="text-[#0A1B3D]">{testimonial.city}</span>
                </p>
              </div>
            </Card>
          </HeavyDraggable>
        ))}
      </div>
    </SectionWrapper>
  );
}


