"use client";

import type { RefObject } from "react";
import { Check, Copy, Volume2 } from "lucide-react";

import { useTranslations } from "@/features/i18n/use-translations";
import type { Theme } from "@/features/settings/settings-provider";
import type { Message } from "@/types/studio";

interface MessageListProps {
  messages: Message[];
  theme: Theme;
  copiedMessageId: string | null;
  bottomRef: RefObject<HTMLDivElement | null>;
  onCopy: (id: string, text: string) => void;
  onSpeak?: (text: string) => void;
}

export function MessageList({
  messages,
  theme,
  copiedMessageId,
  bottomRef,
  onCopy,
  onSpeak,
}: MessageListProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}
        >
          {message.sender === "ai" && (
            <span
              className={`mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                theme === "dark" ? "text-[#66C8C1]" : "text-[#163F3D]"
              }`}
            >
              {message.verified ? "Verified guidance" : t.chat.assistantName}
            </span>
          )}
          <div
            className={`max-w-[92%] md:max-w-[82%] p-4 rounded-[20px] text-sm leading-relaxed border shadow-2xs ${
              message.sender === "user"
                ? theme === "dark"
                  ? "bg-[#66C8C1] text-[#101A1A] border-[#66C8C1] rounded-br-xs"
                  : "bg-[#163F3D] text-[#F3F8F6] border-[#163F3D] rounded-br-xs"
                : theme === "dark"
                  ? "bg-[#182726] text-[#F3F8F6] border-[#334846] border-l-4 border-l-[#66C8C1] rounded-bl-md"
                  : "bg-white text-[#163F3D] border-[#D5DFDB] border-l-4 border-l-[#66C8C1] rounded-bl-md"
            }`}
          >
            <p className="font-normal whitespace-pre-wrap">{message.text}</p>
          </div>
          <div className={`flex items-center gap-2 text-[10px] font-mono mt-1 px-1 ${
            theme === "dark" ? "text-[#D5DFDB]" : "text-[#65736F]"
          }`}>
            <span>{message.sender === "user" ? t.chat.userFooter : t.chat.assistantFooter} • {message.timestamp}</span>
            {message.sender === "ai" && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => onCopy(message.id, message.text)}
                  title={t.chat.copyTitle}
                  className={`transition-colors cursor-pointer ${
                    theme === "dark" ? "hover:text-[#66C8C1]" : "hover:text-[#163F3D]"
                  }`}
                >
                  {copiedMessageId === message.id ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                {onSpeak && <button
                  onClick={() => onSpeak(message.text)}
                  title={t.chat.speakAloudTitle}
                  className={`transition-colors cursor-pointer ${
                    theme === "dark" ? "hover:text-[#66C8C1]" : "hover:text-[#163F3D]"
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                </button>}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
