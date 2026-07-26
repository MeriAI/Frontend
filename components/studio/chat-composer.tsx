"use client";

import type { FormEvent } from "react";
import { Mic, Send } from "lucide-react";

import { useTranslations } from "@/features/i18n/use-translations";
import type { Theme } from "@/features/settings/settings-provider";

type ComposerVariant = "centered" | "active";

interface ChatComposerProps {
  variant: ComposerVariant;
  theme: Theme;
  value: string;
  isListening: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onToggleListening: () => void;
}

const variants = {
  centered: {
    form: "w-full flex items-center gap-2 border focus-within:border-[#66C8C1] rounded-full p-2 pl-3 shadow-md transition-all",
    inputId: "chat-input-field-centered",
    sendId: "send-chat-btn-centered",
  },
  active: {
    form: "w-full max-w-2xl mx-auto flex items-center gap-2 border focus-within:border-[#66C8C1] rounded-full p-2 pl-3 shadow-sm transition-all",
    inputId: "chat-input-field",
    sendId: "send-chat-btn",
  },
} as const;

export function ChatComposer({
  variant,
  theme,
  value,
  isListening,
  onChange,
  onSubmit,
  onToggleListening,
}: ChatComposerProps) {
  const config = variants[variant];
  const t = useTranslations();

  return (
    <form
      onSubmit={onSubmit}
      className={`${config.form} ${
        theme === "dark"
          ? "bg-[#182726] border-[#334846]"
          : "bg-[#FAFAF7] border-[#D5DFDB]"
      }`}
    >
      <input
        id={config.inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.chat.placeholder}
        className={`flex-1 bg-transparent text-sm focus:outline-none px-2 ${
          theme === "dark"
            ? "text-[#F3F8F6] placeholder-[#D5DFDB]"
            : "text-[#163F3D] placeholder-[#65736F]"
        }`}
      />
      <button
        type="button"
        onClick={onToggleListening}
        title={t.chat.speakTitle}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
          isListening
            ? "bg-[#66C8C1] text-[#101A1A] animate-pulse"
            : theme === "dark"
              ? "hover:bg-[#334846] text-[#F3F8F6]"
              : "hover:bg-[#F0F4F2] text-[#163F3D]"
        }`}
      >
        <Mic className="w-4 h-4" />
      </button>
      <button
        id={config.sendId}
        type="submit"
        disabled={!value.trim()}
        className={`w-9 h-9 rounded-full disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer flex-shrink-0 shadow-xs ${
          theme === "dark"
            ? "bg-[#66C8C1] text-[#101A1A] hover:bg-[#F0F4F2]"
            : "bg-[#163F3D] text-[#F3F8F6] hover:bg-[#0F302F]"
        }`}
      >
        <Send className={`w-4 h-4 ${theme === "dark" ? "text-[#101A1A]" : "text-[#F3F8F6]"}`} />
      </button>
    </form>
  );
}
