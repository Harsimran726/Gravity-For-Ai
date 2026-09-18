'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  PhoneCall,
  Sparkles,
  Check,
  RotateCcw,
  Headphones,
} from 'lucide-react';

interface ReelEmbedPlayerProps {
  nicheTitle: string;
  reelEmbedUrl?: string;
  slug?: string;
  audioFileUrl?: string;
  audioDemo: {
    callerType: string;
    scenario: string;
    duration: string;
    languages: string[];
    sampleTranscript: { speaker: string; text: string }[];
  };
}

// Exact cue timestamps (in seconds) for each speaker line in the pre-rendered audio files
const CUE_TIMESTAMPS: Record<string, number[]> = {
  clinics: [0, 3.7, 10.5, 13.0],
  'real-estate': [0, 5.0, 12.5, 15.8],
  immigration: [0, 6.0, 14.0, 17.2],
};

export function ReelEmbedPlayer({
  nicheTitle,
  reelEmbedUrl,
  slug = 'clinics',
  audioFileUrl,
  audioDemo,
}: ReelEmbedPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [audioError, setAudioError] = React.useState(false);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const resolvedAudioSrc = audioFileUrl || `/audio/${slug}-demo.mp3`;

  // Sync active transcript line based on audio playback time
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    const cues = CUE_TIMESTAMPS[slug] || [0, 4, 10, 14];
    let step = 0;
    for (let i = cues.length - 1; i >= 0; i--) {
      if (cur >= cues[i]) {
        step = i;
        break;
      }
    }
    setActiveStep(step);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveStep(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Speech synthesis fallback in case external audio is blocked
  const playSpeechSynthesisFallback = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    let currentIndex = 0;
    const speakNextLine = () => {
      if (currentIndex >= audioDemo.sampleTranscript.length) {
        setIsPlaying(false);
        setActiveStep(0);
        return;
      }
      const item = audioDemo.sampleTranscript[currentIndex];
      setActiveStep(currentIndex);

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.rate = 1.0;
      utterance.pitch = item.speaker.includes('AI') ? 1.15 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find((v) => v.lang.includes('IN') || v.lang.includes('pa') || v.lang.includes('hi'));
      if (inVoice) utterance.voice = inVoice;

      utterance.onend = () => {
        currentIndex++;
        speakNextLine();
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextLine();
  };

  const togglePlay = () => {
    if (audioError) {
      // Use fallback
      if (isPlaying) {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        playSpeechSynthesisFallback();
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('[AUDIO] HTML Audio playback failed, switching to speech synthesis:', err);
          setAudioError(true);
          setIsPlaying(true);
          playSpeechSynthesisFallback();
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const seekToLine = (idx: number) => {
    const cues = CUE_TIMESTAMPS[slug] || [0, 4, 10, 14];
    if (audioRef.current && cues[idx] !== undefined) {
      audioRef.current.currentTime = cues[idx];
      setCurrentTime(cues[idx]);
      setActiveStep(idx);
      if (!isPlaying) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Hidden audio element playing real MP3 voice file */}
      <audio
        ref={audioRef}
        src={resolvedAudioSrc}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => {
          console.warn('[AUDIO] Could not load audio file:', resolvedAudioSrc);
          setAudioError(true);
        }}
      />

      {/* Interactive AI Call Demo Box */}
      <div className="lg:col-span-7 space-y-4">
        <div className="p-6 rounded-2xl bg-[#0A1B3D] text-[#F7F5F0] border border-[#233A6B] shadow-2xl space-y-5 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-[#C99A44]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Player Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#233A6B] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#122C57] border border-[#C99A44]/40 flex items-center justify-center text-[#C99A44]">
                <PhoneCall className={`w-5 h-5 ${isPlaying ? 'animate-bounce text-emerald-400' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C99A44] font-semibold">
                    Live Voice Demo
                  </span>
                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Speaking Now
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-[#FFFFFF]">{audioDemo.callerType}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="p-2 rounded-md bg-[#122C57] text-[#C99A44] hover:bg-[#1a3d75] transition-all border border-[#233A6B]"
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="px-3.5 py-2 rounded-lg bg-[#C99A44] text-[#122C57] text-xs font-mono font-bold hover:bg-[#d6a953] transition-all flex items-center gap-2 shadow-lg active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Pause Call
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Play Call Demo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Soundbar & Waveform graphic */}
          <div className="space-y-2">
            <div className="py-2.5 flex items-center justify-between gap-1 h-14 px-3 bg-[#0F234D]/90 rounded-xl border border-[#233A6B] relative">
              {[25, 45, 70, 95, 55, 30, 80, 100, 65, 40, 85, 50, 35, 75, 90, 60, 30, 85, 65, 40, 95, 70, 35, 55, 80, 45, 90, 60].map(
                (h, i) => {
                  const barHeight = isPlaying
                    ? Math.min(100, Math.max(20, (h * ((i + Math.floor(currentTime * 3)) % 5 + 2)) / 4))
                    : 22;
                  return (
                    <span
                      key={i}
                      className="w-1 rounded-full transition-all duration-150"
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: isPlaying ? '#F59E0B' : '#C99A44',
                        opacity: isPlaying ? 0.95 : 0.35,
                      }}
                    />
                  );
                }
              )}
            </div>

            {/* Audio Progress Scrubber */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#E4E2DC]/70 px-1">
              <span>{formatSeconds(currentTime)}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Headphones className="w-3 h-3" />
                {isPlaying ? 'Turn up volume to hear conversation' : 'Click Play to listen'}
              </span>
              <span>{formatSeconds(duration || 20)}</span>
            </div>
          </div>

          {/* Transcript Dialogue Stream */}
          <div className="space-y-3 min-h-[160px]">
            {audioDemo.sampleTranscript.map((line, idx) => {
              const isSpeakerCaller =
                line.speaker === 'Caller' || line.speaker === 'Patient' || line.speaker === 'Student';
              const isCurrent = idx === activeStep;

              return (
                <div
                  key={idx}
                  onClick={() => seekToLine(idx)}
                  title="Click to jump audio here"
                  className={`p-3.5 rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                    isCurrent
                      ? isSpeakerCaller
                        ? 'bg-[#122C57] border-2 border-[#C99A44] shadow-lg scale-[1.01]'
                        : 'bg-[#C99A44]/20 border-2 border-[#F59E0B] shadow-lg scale-[1.01]'
                      : 'opacity-50 hover:opacity-80 bg-white/5 border border-transparent'
                  }`}
                >
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                      isSpeakerCaller
                        ? 'bg-white/20 text-white'
                        : 'bg-[#C99A44] text-[#122C57]'
                    }`}
                  >
                    {line.speaker}
                  </span>
                  <div className="space-y-1">
                    <p className="leading-relaxed text-[#F7F5F0] font-sans">{line.text}</p>
                    {isCurrent && isPlaying && (
                      <span className="inline-block text-[10px] font-mono text-[#F59E0B]">
                        ● Playing audio segment...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Player Footer */}
          <div className="pt-3 border-t border-[#233A6B] flex flex-wrap items-center justify-between text-xs font-mono text-[#E4E2DC]/80 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C99A44]"></span>
              Click any dialogue turn to jump playback
            </span>
            <div className="flex items-center gap-1.5">
              <span>Languages:</span>
              {audioDemo.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded bg-white/10 text-[#C99A44] text-[10px] font-semibold"
                >
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

            <div className="p-3.5 rounded-lg bg-[#F7F5F0] border border-[#E4E2DC] text-center">
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
