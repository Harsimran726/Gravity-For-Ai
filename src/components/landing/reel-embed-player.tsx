'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Volume2, VolumeX, Play, Pause, Mic, PhoneCall, Sparkles, Check } from 'lucide-react';

interface ReelEmbedPlayerProps {
  nicheTitle: string;
  reelEmbedUrl?: string;
  audioDemo: {
    callerType: string;
    scenario: string;
    duration: string;
    languages: string[];
    sampleTranscript: { speaker: string; text: string }[];
  };
}

export function ReelEmbedPlayer({
  nicheTitle,
  reelEmbedUrl,
  audioDemo,
}: ReelEmbedPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);

  // Simulated live conversational playback
  React.useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % audioDemo.sampleTranscript.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, audioDemo.sampleTranscript.length]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Interactive AI Call Demo Box */}
      <div className="lg:col-span-7 space-y-4">
        <div className="p-6 rounded-2xl bg-[#0A1B3D] text-[#F7F5F0] border border-[#233A6B] shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#C99A44]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Player Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#233A6B] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#122C57] border border-[#C99A44]/40 flex items-center justify-center text-[#C99A44]">
                <PhoneCall className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C99A44] font-semibold">
                  Live Voice Simulation
                </span>
                <p className="text-sm font-medium text-[#FFFFFF]">{audioDemo.callerType}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-md bg-[#C99A44] text-[#122C57] text-xs font-mono font-semibold hover:bg-[#C99A44]/90 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Call
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Play Call Demo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Waveform graphic */}
          <div className="py-2 flex items-center justify-between gap-1 h-12 px-2 bg-[#0F234D]/80 rounded-xl border border-[#233A6B]">
            {[18, 35, 60, 85, 45, 20, 70, 95, 55, 30, 80, 40, 25, 65, 90, 48, 22, 75, 50, 30, 85, 60, 20, 45].map(
              (h, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#C99A44] rounded-full transition-all duration-300"
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * ((i + activeStep) % 5 + 1)) / 4)}%` : '20%',
                    opacity: isPlaying ? 0.9 : 0.35,
                  }}
                />
              )
            )}
          </div>

          {/* Transcript Dialogue Stream */}
          <div className="space-y-3 min-h-[160px]">
            {audioDemo.sampleTranscript.map((line, idx) => {
              const isSpeakerCaller = line.speaker === 'Caller' || line.speaker === 'Patient' || line.speaker === 'Student';
              const isCurrent = idx === activeStep;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-start gap-3 ${
                    isCurrent
                      ? isSpeakerCaller
                        ? 'bg-[#122C57] border border-[#C99A44]/50 shadow-md'
                        : 'bg-[#C99A44]/15 border border-[#C99A44] shadow-md'
                      : 'opacity-50'
                  }`}
                >
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold shrink-0 ${
                      isSpeakerCaller
                        ? 'bg-white/10 text-white'
                        : 'bg-[#C99A44] text-[#122C57]'
                    }`}
                  >
                    {line.speaker}
                  </span>
                  <p className="leading-relaxed text-[#F7F5F0]">{line.text}</p>
                </div>
              );
            })}
          </div>

          {/* Player Footer */}
          <div className="pt-3 border-t border-[#233A6B] flex flex-wrap items-center justify-between text-xs font-mono text-[#E4E2DC]/70">
            <span>Duration: {audioDemo.duration}</span>
            <div className="flex items-center gap-1.5">
              <span>Languages:</span>
              {audioDemo.languages.map((lang) => (
                <span key={lang} className="px-1.5 py-0.5 rounded bg-white/10 text-[#C99A44] text-[10px]">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reel Embed or Video Explainer Box */}
      <div className="lg:col-span-5 space-y-4">
        {reelEmbedUrl ? (
          <div className="w-full aspect-[9/16] max-w-[320px] mx-auto rounded-2xl overflow-hidden border border-[#E4E2DC] shadow-lg bg-black">
            <iframe
              src={reelEmbedUrl}
              className="w-full h-full"
              allowFullScreen
              title={`${nicheTitle} AI Demo Reel`}
            />
          </div>
        ) : (
          <Card
            variant="outline"
            className="p-6 sm:p-8 space-y-5 bg-[#FFFFFF] border-2 border-[#E4E2DC] shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C99A44] uppercase font-semibold">
                <Sparkles className="w-4 h-4 text-[#C99A44]" />
                <span>Zero Latency Telephony</span>
              </div>
              <h3 className="font-serif text-2xl text-[#122C57]">
                Human-Grade Fluidity
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                Our AI voice agents do not sound like clumsy IVR trees ("Press 1 for Sales"). They hold realistic conversations, handle natural interruptions, and reply within 700ms.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#E4E2DC] text-xs text-[#122C57] font-sans">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Native Punjabi, Hindi &amp; English pronunciation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant caller qualification &amp; calendar booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automatic SMS &amp; WhatsApp document dispatch</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#E4E2DC] text-center">
              <span className="text-xs font-mono text-[#122C57] font-semibold">
                Running an Instagram Ad campaign? Message match is pre-configured.
              </span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
