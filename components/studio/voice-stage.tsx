"use client";

import { Mic, MicOff, RefreshCw } from "lucide-react";

import { useTranslations } from "@/features/i18n/use-translations";
import { useSettings } from "@/features/settings/settings-provider";
import type { SpeechState } from "@/types/studio";

interface VoiceStageProps {
  speechState: SpeechState;
  transcript: string;
  latestResponse: string;
  audioAmplitude: number;
  onToggleListening: () => void;
  voiceAvailable: boolean;
  statusReason: string | null;
}

export function VoiceStage({
  speechState,
  transcript,
  latestResponse,
  audioAmplitude,
  onToggleListening,
  voiceAvailable,
  statusReason,
}: VoiceStageProps) {
  const t = useTranslations();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const headlineClass = isDark ? "text-[#F3F8F6]" : "text-[#163F3D]";
  const mutedClass = isDark ? "text-[#D5DFDB]" : "text-[#65736F]";

  return (
    <div className="w-full flex flex-col items-center justify-center text-center my-auto py-10">
      <div className="relative mb-10 flex items-center justify-center">
        {(speechState === "listening" || speechState === "speaking") && (
          <>
            <div className="absolute w-72 h-72 rounded-full border border-[#D5DFDB] opacity-50 animate-ping pointer-events-none" style={{ animationDuration: "3s" }} />
            <div className="absolute w-80 h-80 rounded-full border border-[#F0F4F2] opacity-30 animate-pulse pointer-events-none" />
          </>
        )}
        <button
          id="audio-sphere-button"
          onClick={onToggleListening}
          disabled={!voiceAvailable}
          style={{ transform: `scale(${speechState === "idle" ? 1 : audioAmplitude})` }}
          className={`w-56 h-56 md:w-64 md:h-64 cursor-pointer focus:outline-none audio-sphere transition-all duration-300 relative flex items-center justify-center group ${
            speechState === "idle" ? "audio-sphere-idle"
              : speechState === "listening" ? "audio-sphere-active"
                : speechState === "speaking" ? "audio-sphere-speaking" : "audio-sphere-active"
          }`}
          aria-label={speechState === "listening" ? t.voice.stopLabel : t.voice.startLabel}
        >
          <div className="w-16 h-16 rounded-full bg-[#163F3D]/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-[#F3F8F6]">
            {speechState === "listening" ? <MicOff className="w-6 h-6 text-[#F3F8F6]" /> : <Mic className="w-6 h-6 text-[#F3F8F6]" />}
          </div>
        </button>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2">
          {speechState === "listening" && (
            <span className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-[#66C8C1] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-0.5 h-3 bg-[#66C8C1] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-0.5 h-1.5 bg-[#66C8C1] animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          )}
          <p className={`ui-secondary text-xs font-mono tracking-widest uppercase ${mutedClass}`}>
            {speechState === "idle" && t.voice.idle}
            {speechState === "listening" && t.voice.listening}
            {speechState === "processing" && t.voice.processing}
            {speechState === "speaking" && t.voice.speaking}
          </p>
        </div>
        <div className="min-h-[5rem] flex items-center justify-center">
          {speechState === "listening" ? (
            <h1 className={`headline-300 text-2xl md:text-3xl font-light tracking-[-0.02em] leading-snug ${headlineClass}`}>{transcript || t.voice.prompt}</h1>
          ) : speechState === "processing" ? (
            <div className={`flex items-center gap-2.5 text-sm font-mono ${mutedClass}`}>
              <RefreshCw className="w-4 h-4 animate-spin text-[#66C8C1]" />
              <span>{t.voice.processingDetail}</span>
            </div>
          ) : (
            <h1 className={`headline-300 text-xl md:text-2xl font-light tracking-[-0.02em] leading-relaxed max-w-xl ${headlineClass}`}>&ldquo;{latestResponse}&rdquo;</h1>
          )}
        </div>
        {!voiceAvailable && statusReason && <p className={`text-xs leading-5 ${mutedClass}`}>Voice is unavailable ({statusReason}). You can continue with text chat.</p>}
      </div>

      <div className="mt-10">
        <button
          id="main-mic-action-btn"
          onClick={onToggleListening}
          disabled={!voiceAvailable}
          className={`pill-button px-8 py-3.5 text-sm font-medium transition-all duration-200 flex items-center gap-2.5 cursor-pointer border ${
            speechState === "listening"
              ? "bg-[#66C8C1] text-[#101A1A] border-[#66C8C1] shadow-md scale-105"
              : isDark
                ? "bg-[#66C8C1] text-[#101A1A] border-[#66C8C1] hover:bg-[#8FD8D3]"
                : "bg-[#163F3D] text-[#F3F8F6] border-[#163F3D] hover:bg-[#0F302F]"
          }`}
        >
          {speechState === "listening" ? (
            <><MicOff className="w-4 h-4" /><span>{t.voice.stop}</span></>
          ) : (
            <><Mic className="w-4 h-4" /><span>{t.voice.start}</span></>
          )}
        </button>
      </div>
    </div>
  );
}
