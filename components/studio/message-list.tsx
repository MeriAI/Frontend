"use client";

import { useId, useState, type RefObject } from "react";
import { BookOpenText, Check, ChevronDown, Copy, ExternalLink, Volume2 } from "lucide-react";

import { useTranslations } from "@/features/i18n/use-translations";
import type { Theme } from "@/features/settings/settings-provider";
import type { Message } from "@/types/studio";

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function SourceTray({ message, theme }: { message: Message; theme: Theme }) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const research = message.research;

  if (!research) return null;

  const citations = research.citations;
  if (citations.length === 0) {
    return (
      <p className={`mt-2 max-w-[92%] px-1 text-xs leading-5 ${theme === "dark" ? "text-[#D5DFDB]" : "text-[#65736F]"}`}>
        {research.warning || t.chat.researchReviewNotice}
      </p>
    );
  }

  return (
    <section className={`mt-2 w-full max-w-[92%] overflow-hidden rounded-xl border ${theme === "dark" ? "border-[#334846] bg-[#182726]" : "border-[#D5DFDB] bg-white"}`} aria-label={t.chat.sources}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-xs font-semibold transition-colors ${theme === "dark" ? "text-[#F3F8F6] hover:bg-[#213331]" : "text-[#163F3D] hover:bg-[#F3F8F6]"}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <BookOpenText className="size-4 shrink-0 text-[#66C8C1]" aria-hidden="true" />
          <span>{t.chat.sources}</span>
          <span className={`font-normal ${theme === "dark" ? "text-[#D5DFDB]" : "text-[#65736F]"}`}>{t.chat.sourceCount(citations.length)}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-[#66C8C1] transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div id={contentId} className={`border-t px-3 pb-3 pt-2.5 ${theme === "dark" ? "border-[#334846]" : "border-[#D5DFDB]"}`}>
          <p className={`mb-2.5 text-xs leading-5 ${theme === "dark" ? "text-[#D5DFDB]" : "text-[#65736F]"}`}>{research.warning || t.chat.researchReviewNotice}</p>
          <ul className="space-y-2">
            {citations.map((citation) => (
              <li key={citation.url}>
                <a href={citation.url} target="_blank" rel="noreferrer" className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${theme === "dark" ? "border-[#334846] hover:border-[#66C8C1] hover:bg-[#213331]" : "border-[#D5DFDB] hover:border-[#66C8C1] hover:bg-[#F3F8F6]"}`}>
                  <span className={`grid size-7 shrink-0 place-items-center rounded-md ${theme === "dark" ? "bg-[#101A1A] text-[#66C8C1]" : "bg-[#F0F4F2] text-[#163F3D]"}`}><BookOpenText className="size-3.5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{citation.title}</span>
                    <span className={`mt-0.5 block truncate text-[11px] font-normal ${theme === "dark" ? "text-[#D5DFDB]" : "text-[#65736F]"}`}>{getHostname(citation.url)}</span>
                  </span>
                  <ExternalLink className="size-3.5 shrink-0 text-[#66C8C1]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

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
          {message.sender === "ai" && <SourceTray message={message} theme={theme} />}
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
