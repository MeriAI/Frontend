"use client";

import { Settings2, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

import { useTranslations } from "@/features/i18n/use-translations";
import type { Contrast, Theme } from "@/features/settings/settings-provider";
import type { StudioMode } from "@/types/studio";

interface HeaderProps {
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onOpenAccessibility: () => void;
  isMuted: boolean;
  onMuteChange: (muted: boolean) => void;
  theme: Theme;
  contrast: Contrast;
}

export function Header({
  mode, onModeChange, onOpenAccessibility,
  isMuted, onMuteChange, theme, contrast,
}: HeaderProps) {
  const t = useTranslations();

  return (
    <header className={`w-full mx-auto px-6 pt-4 pb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${mode === "chat" ? "max-w-full px-4 md:px-6" : "max-w-6xl"}`}>
      <Link
        href="/"
        aria-label="MeriAI home"
        className={`justify-self-start text-base font-semibold tracking-[-0.03em] ${theme === "dark" ? "text-[#F3F8F6]" : "text-[#163F3D]"}`}
      >
        MeriAI
      </Link>

      <div className={`justify-self-center flex p-1 rounded-full space-x-1 ${theme === "dark" ? "bg-[#182726]" : "bg-[#D5DFDB]"}`}>
        <button
          id="voice-mode-toggle"
          onClick={() => onModeChange("voice")}
          className={`pill-button px-8 py-2 text-sm cursor-pointer ${
            mode === "voice"
              ? theme === "dark" ? "bg-[#66C8C1] text-[#101A1A]" : "bg-[#163F3D] text-[#F3F8F6]"
              : theme === "dark" ? "text-[#F3F8F6] hover:bg-[#0F302F]" : "text-[#163F3D] hover:bg-[#F0F4F2]"
          }`}
        >
          {t.studio.voiceMode}
        </button>
        <button
          id="chat-mode-toggle"
          onClick={() => onModeChange("chat")}
          className={`pill-button px-8 py-2 text-sm cursor-pointer ${
            mode === "chat"
              ? theme === "dark" ? "bg-[#66C8C1] text-[#101A1A]" : "bg-[#163F3D] text-[#F3F8F6]"
              : theme === "dark" ? "text-[#F3F8F6] hover:bg-[#0F302F]" : "text-[#163F3D] hover:bg-[#F0F4F2]"
          }`}
        >
          {t.studio.chatMode}
        </button>
      </div>

      <div className="justify-self-end flex items-center gap-2">
        <button
          id="mute-toggle-btn"
          onClick={() => onMuteChange(!isMuted)}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
            theme === "dark"
              ? "bg-[#0F302F] border-[#334846] text-[#F3F8F6] hover:bg-[#182726]"
              : "bg-[#FAFAF7] border-[#D5DFDB] text-[#163F3D] hover:bg-[#F0F4F2]"
          } ${contrast === "high" || contrast === "max" ? "border-2 border-[#163F3D] dark:border-[#F3F8F6]" : ""}`}
          title={isMuted ? t.studio.unmute : t.studio.mute}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#65736F]" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
          id="accessibility-settings-btn"
          onClick={onOpenAccessibility}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            theme === "dark"
              ? "bg-[#0F302F] border-[#334846] text-[#F3F8F6] hover:bg-[#182726]"
              : "bg-[#FAFAF7] border-[#D5DFDB] text-[#163F3D] hover:bg-[#F0F4F2]"
          } ${contrast === "high" || contrast === "max" ? "border-2 border-[#163F3D] dark:border-[#F3F8F6]" : ""}`}
          title={t.studio.accessibilityTitle}
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
