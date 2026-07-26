"use client";

import type { FormEvent, RefObject } from "react";
import { BadgeCheck, BookOpenText } from "lucide-react";

import { ChatComposer } from "@/components/studio/chat-composer";
import { ChatSidebar } from "@/components/studio/chat-sidebar";
import { MessageList } from "@/components/studio/message-list";
import { useTranslations } from "@/features/i18n/use-translations";
import type { Theme } from "@/features/settings/settings-provider";
import type { Message } from "@/types/studio";

interface ChatWorkspaceProps {
  messages: Message[];
  theme: Theme;
  input: string;
  isListening: boolean;
  sidebarOpen: boolean;
  copiedMessageId: string | null;
  bottomRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onPresetPrompt: () => void;
  onToggleListening: () => void;
  onNewChat: () => void;
  onSelectTopic: (topic: string) => void;
  onCopy: (id: string, text: string) => void;
  onSpeak: (text: string) => void;
}

export function ChatWorkspace({
  messages,
  theme,
  input,
  isListening,
  sidebarOpen,
  copiedMessageId,
  bottomRef,
  onInputChange,
  onSubmit,
  onPresetPrompt,
  onToggleListening,
  onNewChat,
  onSelectTopic,
  onCopy,
  onSpeak,
}: ChatWorkspaceProps) {
  const t = useTranslations();

  return (
    <div id="chat-workspace" className={`w-full flex-1 h-[85vh] md:h-[88vh] flex border rounded-[20px] overflow-hidden relative ${
      theme === "dark"
        ? "bg-[#101A1A] border-[#334846] shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
        : "bg-[#F0F4F2] border-[#D5DFDB] shadow-[0_1px_3px_rgba(22,63,61,0.02)]"
    }`}>
      <ChatSidebar
        isOpen={sidebarOpen}
        theme={theme}
        onNewChat={onNewChat}
        onSelectTopic={onSelectTopic}
      />
      <div className={`flex-1 flex flex-col justify-between overflow-hidden ${
        theme === "dark" ? "bg-[#101A1A]" : "bg-[#F0F4F2]"
      }`}>
        <div
          className={`flex items-center justify-between gap-4 border-b px-4 py-3 md:px-6 ${
            theme === "dark"
              ? "border-[#334846] bg-[#182726]"
              : "border-[#D5DFDB] bg-white"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                theme === "dark"
                  ? "bg-[#66C8C1] text-[#101A1A]"
                  : "bg-[#163F3D] text-[#F3F8F6]"
              }`}
            >
              <BookOpenText className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-semibold ${
                  theme === "dark" ? "text-[#F3F8F6]" : "text-[#0F302F]"
                }`}
              >
                {t.chat.contextTitle}
              </p>
              <p
                className={`truncate text-xs ${
                  theme === "dark" ? "text-[#D5DFDB]" : "text-[#65736F]"
                }`}
              >
                {t.chat.contextSubtitle}
              </p>
            </div>
          </div>
          <span
            className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold sm:flex ${
              theme === "dark"
                ? "border-[#334846] bg-[#101A1A] text-[#D5DFDB]"
                : "border-[#D5DFDB] bg-[#FAFAF7] text-[#163F3D]"
            }`}
          >
            <BadgeCheck className="size-3.5 text-[#66C8C1]" aria-hidden="true" />
            {t.chat.officialBadge}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col justify-between">
          {messages.length <= 1 ? (
            <div className="my-auto text-center max-w-2xl w-full mx-auto px-2 py-6 flex flex-col items-center justify-center">
              <h1 className={`headline-300 text-2xl md:text-3xl font-light tracking-[-0.02em] ${
                theme === "dark" ? "text-[#F3F8F6]" : "text-[#163F3D]"
              }`}>
                {t.chat.emptyTitle}
              </h1>
              <p
                className={`mt-3 mb-6 max-w-lg text-sm leading-6 ${
                  theme === "dark" ? "text-[#D5DFDB]" : "text-[#65736F]"
                }`}
              >
                {t.chat.emptyBody}
              </p>
              <ChatComposer
                variant="centered"
                theme={theme}
                value={input}
                isListening={isListening}
                onChange={onInputChange}
                onSubmit={onSubmit}
                onPresetPrompt={onPresetPrompt}
                onToggleListening={onToggleListening}
              />
            </div>
          ) : (
            <MessageList
              messages={messages}
              theme={theme}
              copiedMessageId={copiedMessageId}
              bottomRef={bottomRef}
              onCopy={onCopy}
              onSpeak={onSpeak}
            />
          )}
        </div>
        {messages.length > 1 && (
          <div className={`p-3 md:p-4 border-t ${
            theme === "dark"
              ? "border-[#334846] bg-[#101A1A]"
              : "border-[#D5DFDB] bg-[#F0F4F2]"
          }`}>
            <ChatComposer
              variant="active"
              theme={theme}
              value={input}
              isListening={isListening}
              onChange={onInputChange}
              onSubmit={onSubmit}
              onPresetPrompt={onPresetPrompt}
              onToggleListening={onToggleListening}
            />
          </div>
        )}
      </div>
    </div>
  );
}
