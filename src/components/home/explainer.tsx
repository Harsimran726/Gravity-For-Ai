import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Bot, GitFork, CheckCircle2 } from 'lucide-react';
import { ScrollReveal, ParallaxLayer, GravityPull } from '@/components/ui/physics-effects';
import { PipelineOrchestratorMockup } from '@/components/visuals/pipeline-orchestrator-mockup';

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

        {/* Conceptual Workflow Visualizer */}
        <ParallaxLayer speed={0.2} className="lg:col-span-6 flex justify-center lg:justify-end">
          <GravityPull>
            <PipelineOrchestratorMockup />
          </GravityPull>
        </ParallaxLayer>
      </div>
    </SectionWrapper>
  );
}
