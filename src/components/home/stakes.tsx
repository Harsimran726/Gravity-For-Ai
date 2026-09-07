import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { PhoneMissed, Clock, LayoutGrid, AlertCircle } from 'lucide-react';
import { ScrollReveal, StaggerReveal, GravityPull } from '@/components/ui/physics-effects';

const STAKES_ITEMS = [
  {
    icon: PhoneMissed,
    tag: '01 / MISSED CALLS',
    title: 'Missed Calls = Missed Revenue',
    description:
      'Every unanswered call after hours is a customer calling your competitor next. One missed call can mean a lost patient, client, or deal.',
  },
  {
    icon: Clock,
    tag: '02 / MANUAL OVERHEAD',
    title: 'Hours Lost to Manual Work',
    description:
      'Data entry, appointment scheduling, and repetitive follow-ups eat the hours you should be spending closing sales or running operations.',
  },
  {
    icon: LayoutGrid,
    tag: '03 / VENDOR CHAOS',
    title: 'Five Vendors, Zero Coordination',
    description:
      'A web developer, a freelancer, and an AI tool subscription that nobody knows how to integrate - none of them talk to each other.',
  },
  {
    icon: AlertCircle,
    tag: '04 / GENERIC TOOLS',
    title: "Generic Tools That Don't Fit",
    description:
      'Off-the-shelf chatbots and DIY platforms that frustrate your customers instead of actually finishing tasks end-to-end.',
  },
];

export function StakesSection() {
  return (
    <SectionWrapper variant="warm" id="stakes">
      <ScrollReveal className="max-w-[640px] space-y-4">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
          The Friction
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
          You&apos;re Still Doing This the Hard Way
        </h2>
        <p className="text-sm sm:text-base text-[#0A1B3D]/80 leading-relaxed pt-1">
          Growing a business in Punjab without a 10-person tech department shouldn&apos;t mean losing your evenings to manual back-office tasks and missed inquiries.
        </p>
      </ScrollReveal>

      <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12">
        {STAKES_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <GravityPull key={item.tag}>
              <Card variant="outline" className="space-y-4 hover:border-[#122C57]/40 transition-colors h-full">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#C99A44] tracking-wider">{item.tag}</span>
                  <Icon className="w-5 h-5 text-[#122C57]/60" />
                </div>
                <h3 className="font-sans font-medium text-lg text-[#122C57]">{item.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{item.description}</p>
              </Card>
            </GravityPull>
          );
        })}
      </StaggerReveal>
    </SectionWrapper>
  );
}

