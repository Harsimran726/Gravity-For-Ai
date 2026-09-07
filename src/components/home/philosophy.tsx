import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { OrbitAura } from '@/components/ui/orbit-aura';
import { ScrollReveal, ParallaxLayer } from '@/components/ui/physics-effects';

export function PhilosophySection() {
  return (
    <SectionWrapper variant="black" id="philosophy" className="py-28 sm:py-36 lg:py-44 text-center">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <ScrollReveal>
          <span className="font-mono text-xs tracking-widest uppercase text-[#C99A44]">
            The Presence
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#F7F5F0] font-normal leading-[1.15] tracking-tight">
            Intelligence, Applied. <br />
            <span className="text-[#F7F5F0]/80">Not sold to you - built around your business.</span>
          </h2>
        </ScrollReveal>

        <ParallaxLayer speed={0.25}>
          <p className="font-sans text-sm sm:text-base lg:text-lg text-[#F7F5F0]/70 max-w-2xl mx-auto leading-relaxed pt-2">
            Most AI tools feel like an extra burden - more dashboards to monitor, more configurations to break. Gravity pulls scattered effort into one quiet, reliable center that simply works.
          </p>
        </ParallaxLayer>

        {/* Orbit Aura Presence */}
        <div className="pt-8 flex justify-center">
          <OrbitAura size={300} variant="philosophy" isDark />
        </div>
      </div>
    </SectionWrapper>
  );
}
