import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Bot, GitFork, CheckCircle2 } from 'lucide-react';
import { ScrollReveal, ParallaxLayer, GravityPull } from '@/components/ui/physics-effects';

export function ExplainerSection() {
  return (
    <SectionWrapper variant="warm" id="explainer">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 space-y-6">
          <ScrollReveal>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Behind the Scenes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              How the Automation Actually Works
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-base sm:text-lg text-[#0A1B3D]/90 leading-relaxed">
              Behind the scenes, our systems use AI agents that can read an inquiry, check your calendar or records, take an action, and follow up - automatically.
            </p>
            <p className="text-sm text-[#6B7280] leading-relaxed mt-4">
              Think of it less like a chatbot that answers one question at a time, and more like a quiet employee that handles a whole task from start to finish. You don&apos;t need to understand the technology - you just need to see the hours it gives back.
            </p>
          </ScrollReveal>
        </div>

        {/* Conceptual Workflow Card */}
        <ParallaxLayer speed={0.2} className="lg:col-span-6">
          <GravityPull>
            <Card variant="outline" className="space-y-6 bg-[#FFFFFF]">
              <p className="font-mono text-xs uppercase tracking-wider text-[#122C57] font-semibold border-b border-[#E4E2DC] pb-3">
                Example Agentic Pipeline
              </p>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#122C57]/10 flex items-center justify-center text-[#122C57] mt-0.5 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#122C57]">1. Inbound Signal Received</p>
                    <p className="text-[#6B7280]">Customer calls after-hours or submits an inquiry via website form.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#122C57]/10 flex items-center justify-center text-[#122C57] mt-0.5 shrink-0">
                    <GitFork className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#122C57]">2. Intelligent Intent Verification</p>
                    <p className="text-[#6B7280]">Agent checks availability, answers pricing or FAQs, and qualifies the lead.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#122C57]/10 flex items-center justify-center text-[#122C57] mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#122C57]">3. Task Completion &amp; Sync</p>
                    <p className="text-[#6B7280]">Calendar slot booked, CRM updated, and instant SMS confirmation sent.</p>
                  </div>
                </div>
              </div>
            </Card>
          </GravityPull>
        </ParallaxLayer>
      </div>
    </SectionWrapper>
  );
}
