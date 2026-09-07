'use client';

import * as React from 'react';
import { Cpu, ArrowRight, Database, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function PipelineOrchestratorMockup() {
  const steps = [
    {
      agent: '01. Inbound Triage',
      tool: 'WhatsApp & Phone Parse',
      status: 'Parsed in 180ms',
      icon: MessageSquare,
      active: true,
    },
    {
      agent: '02. Database Match',
      tool: 'PostgreSQL Inventory & Calendar',
      status: 'Verified & Available',
      icon: Database,
      active: true,
    },
    {
      agent: '03. Decision Loop',
      tool: 'LLM Reasoning & Validation Gate',
      status: 'Confidence 99.8%',
      icon: Cpu,
      active: true,
    },
  ];

  return (
    <div className="w-full max-w-[460px] rounded-2xl bg-[#0A1B3D] text-[#F7F5F0] p-6 shadow-2xl border border-[#233A6B] relative font-sans overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#C99A44]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#233A6B]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#122C57] border border-[#C99A44]/40 flex items-center justify-center text-[#C99A44]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#C99A44] font-semibold">
              Agentic Pipeline
            </p>
            <p className="text-sm font-medium text-[#FFFFFF]">Autonomous Multi-Step Flow</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-semibold border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Executing
        </span>
      </div>

      {/* Pipeline Steps Sequence */}
      <div className="space-y-3 my-5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.agent}
              className="p-3.5 rounded-xl bg-[#0F234D]/70 border border-[#233A6B] flex items-center justify-between gap-3 relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#122C57] border border-[#233A6B] flex items-center justify-center text-[#E4E2DC]">
                  <Icon className="w-4 h-4 text-[#C99A44]" />
                </div>
                <div>
                  <p className="text-xs font-mono font-medium text-[#F7F5F0]">{step.agent}</p>
                  <p className="text-[11px] text-[#E4E2DC]/60">{step.tool}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 justify-end">
                  <CheckCircle className="w-3 h-3" />
                  <span>{step.status}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Output Confirmation Footer */}
      <div className="pt-4 border-t border-[#233A6B] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[#E4E2DC]/70 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-[#C99A44]" />
          <span>Total Cycle: 1.4s</span>
        </div>
        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
          0 Human Intervention Required
        </span>
      </div>
    </div>
  );
}
