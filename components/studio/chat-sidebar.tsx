"use client";

import { Plus } from "lucide-react";

import { useTranslations } from "@/features/i18n/use-translations";
import type { Theme } from "@/features/settings/settings-provider";
import type { MeriAiService } from "@/lib/contracts/meriai";

interface ChatSidebarProps {
  isOpen: boolean;
  theme: Theme;
  onNewChat: () => void;
  onSelectTopic: (topic: string) => void;
  services: MeriAiService[];
  onSelectService: (identifier: string) => void;
}

export function ChatSidebar({
  isOpen,
  theme,
  onNewChat,
  onSelectTopic,
  services,
  onSelectService,
}: ChatSidebarProps) {
  const t = useTranslations();

  return (
    <div
      className={`${
        isOpen ? "w-60 md:w-64" : "w-0 p-0 opacity-0 overflow-hidden"
      } ${
        theme === "dark"
          ? "bg-[#101A1A] border-[#334846]"
          : "bg-[#FAFAF7] border-[#D5DFDB]"
      } border-r flex flex-col justify-between p-3.5 flex-shrink-0 transition-all duration-300 z-10`}
    >
      <div className="space-y-4">
        <button
          id="new-chat-sidebar-btn"
          onClick={onNewChat}
          className={`w-full py-2.5 px-4 rounded-full text-xs font-medium flex items-center justify-between transition-colors shadow-sm cursor-pointer ${
            theme === "dark"
              ? "bg-[#66C8C1] text-[#101A1A] hover:bg-[#F0F4F2]"
              : "bg-[#163F3D] text-[#F3F8F6] hover:bg-[#0F302F]"
          }`}
        >
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /><span>{t.chat.newInquiry}</span></span>
          <span className="text-[10px] font-mono opacity-60">⌘N</span>
        </button>
        <div className="pt-2">
          <div className={`px-3 pb-1 text-[10px] font-mono tracking-widest uppercase ${
            theme === "dark" ? "text-[#D5DFDB]" : "text-[#65736F]"
          }`}>{t.chat.topicsLabel}</div>
          <div className="space-y-0.5">
            {(services.length > 0 ? services : t.chat.topics.map((label) => ({ identifier: label, label }))).map((topic) => (
              <button
                key={topic.identifier}
                onClick={() => services.length > 0 ? onSelectService(topic.identifier) : onSelectTopic(topic.label)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors truncate cursor-pointer ${
                  theme === "dark"
                    ? "text-[#F3F8F6] hover:bg-[#182726]"
                    : "text-[#163F3D] hover:bg-[#F0F4F2]"
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
