import * as React from 'react';
import type { Metadata } from 'next';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ContactBookingTabs } from '@/components/contact/contact-booking-tabs';
import { Card } from '@/components/ui/card';
import { Mail, MapPin, Phone, ShieldCheck, Clock, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book an AI Audit & Contact | Gravity For AI - Mansa, Punjab',
  description:
    'Schedule a live 20-minute AI audit call on our interactive calendar or send a message to Gravity For AI in Mansa, Punjab.',
  alternates: {
    canonical: 'https://gravity4ai.com/contact',
  },
};

export const dynamic = 'force-dynamic';

import { getBookingSettingsAction } from '@/actions/settings-actions';

export default async function ContactPage() {
  const settings = await getBookingSettingsAction();

  return (
    <div className="w-full flex flex-col">
      <SectionWrapper variant="white" className="pt-12 sm:pt-16 pb-20">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Direct Engineering Access
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#122C57] font-normal leading-[1.08]">
              Schedule Your AI Audit Call or Send an Inquiry
            </h1>
            <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 leading-relaxed pt-2">
              Book a live 20-minute discovery call directly on our calendar, or send an inquiry to our engineering team in Mansa, Punjab.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: What to expect & NAP */}
            <div className="lg:col-span-4 space-y-6">
              <Card variant="warm" className="space-y-4 p-6">
                <p className="font-mono text-xs uppercase tracking-wider text-[#122C57] font-semibold">
                  What Happens on the Discovery Call
                </p>
                <div className="space-y-3 text-xs sm:text-sm text-[#0A1B3D]/90">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#C99A44] shrink-0 mt-0.5" />
                    <span>20 focused minutes mapping where you lose hours</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-[#C99A44] shrink-0 mt-0.5" />
                    <span>Honest assessment of whether AI makes financial sense</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#C99A44] shrink-0 mt-0.5" />
                    <span>Exact architecture diagram and scoped quote delivered</span>
                  </div>
                </div>
              </Card>

              <div className="p-6 bg-[#FFFFFF] border border-[#E4E2DC] space-y-3 text-xs sm:text-sm text-[#6B7280]">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#122C57]" />
                  <span className="text-[#122C57] font-medium">contact@gravity4ai.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#122C57]" />
                  <span>Headquarters: Mansa, Punjab 151505, India</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#122C57]" />
                  <span>Serving Mansa, Bathinda, Ludhiana, Chandigarh & Global Clients</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Dual Tabs */}
            <div className="lg:col-span-8">
              <ContactBookingTabs 
                availableTimeSlots={settings.bookingTimeSlots} 
                customDateSlots={settings.customDateSlots} 
              />
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
