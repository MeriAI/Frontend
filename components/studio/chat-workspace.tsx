"use client";

import { useState, type FormEvent, type RefObject } from "react";
import { BadgeCheck, BookOpenText } from "lucide-react";

import { ChatComposer } from "@/components/studio/chat-composer";
import { ChatSidebar } from "@/components/studio/chat-sidebar";
import { MessageList } from "@/components/studio/message-list";
import { useTranslations } from "@/features/i18n/use-translations";
import type { Theme } from "@/features/settings/settings-provider";
import type { Message } from "@/types/studio";
import type { ActivityEntry, BrowserActionPreview, Checklist } from "@/lib/contracts/meriai";
import type { MeriAiService, MissingQuestion } from "@/lib/contracts/meriai";

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
  onToggleListening: () => void;
  onNewChat: () => void;
  onCopy: (id: string, text: string) => void;
  checklist: Checklist | null;
  actionPreview: BrowserActionPreview | null;
  activity: ActivityEntry[];
  onConfirmAction: (confirmationText: string) => void;
  services: MeriAiService[];
  onSelectService: (identifier: string) => void;
  missingQuestions: MissingQuestion[];
  onAnswerQuestion: (questionKey: string, value: unknown) => void;
}

function MissingQuestionAnswer({
  question,
  onAnswer,
}: {
  question: MissingQuestion;
  onAnswer: (questionKey: string, value: unknown) => void;
}) {
  const [value, setValue] = useState("");

  if (question.answerType === "choice") {
    return (
      <div>
        <p>{question.prompt}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {question.options.map((option) => (
            <button key={option.value} type="button" onClick={() => onAnswer(question.key, option.value)} className="rounded-full border border-[#66C8C1] px-3 py-1.5 text-xs font-medium">
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.answerType === "yes_no") {
    return (
      <div>
        <p>{question.prompt}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => onAnswer(question.key, true)} className="rounded-full border border-[#66C8C1] px-3 py-1.5 text-xs font-medium">Yes</button>
          <button type="button" onClick={() => onAnswer(question.key, false)} className="rounded-full border border-[#66C8C1] px-3 py-1.5 text-xs font-medium">No</button>
        </div>
      </div>
    );
  }

  const inputType = question.answerType === "number" ? "number" : question.answerType === "date" ? "date" : "text";
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const answer = question.answerType === "number" ? Number(value) : value.trim();
        if (answer === "" || (typeof answer === "number" && !Number.isFinite(answer))) return;
        onAnswer(question.key, answer);
        setValue("");
      }}
    >
      <label className="block" htmlFor={`question-${question.key}`}>{question.prompt}</label>
      <div className="mt-2 flex gap-2">
        <input id={`question-${question.key}`} type={inputType} value={value} onChange={(event) => setValue(event.target.value)} required className="min-w-0 flex-1 rounded-lg border border-[#D5DFDB] bg-white px-3 py-2 text-xs text-[#163F3D]" />
        <button type="submit" className="rounded-full bg-[#163F3D] px-4 py-2 text-xs font-semibold text-[#F3F8F6]">Continue</button>
      </div>
    </form>
  );
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
  onToggleListening,
  onNewChat,
  onCopy,
  checklist,
  actionPreview,
  activity,
  onConfirmAction,
  services,
  onSelectService,
  missingQuestions,
  onAnswerQuestion,
}: ChatWorkspaceProps) {
  const t = useTranslations();
  const [confirmationText, setConfirmationText] = useState("");

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
        services={services}
        onSelectService={onSelectService}
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
            />
          )}
          {(checklist || actionPreview || activity.length > 0 || missingQuestions.length > 0) && (
            <aside className={`mt-6 max-w-2xl mx-auto w-full space-y-3 text-sm ${theme === "dark" ? "text-[#F3F8F6]" : "text-[#163F3D]"}`} aria-label="Session guidance">
              {missingQuestions.length > 0 && (
                <section className={`rounded-xl border p-4 ${theme === "dark" ? "border-[#334846] bg-[#182726]" : "border-[#D5DFDB] bg-white"}`}>
                  <p className="font-semibold">Information still needed</p>
                  <div className="mt-3 space-y-3">
                    {missingQuestions.map((question) => <MissingQuestionAnswer key={question.key} question={question} onAnswer={onAnswerQuestion} />)}
                  </div>
                </section>
              )}
              {checklist && (
                <section className={`rounded-xl border p-4 ${theme === "dark" ? "border-[#334846] bg-[#182726]" : "border-[#D5DFDB] bg-white"}`}>
                  <p className="font-semibold">{checklist.verified ? "Verified checklist" : "Checklist"}{checklist.title ? ` · ${checklist.title}` : ""}</p>
                  <ul className="mt-2 space-y-1.5">{checklist.items.map((item) => <li key={item.id} className="flex gap-2"><span aria-hidden="true">{item.complete ? "✓" : "○"}</span><span>{item.label}{item.detail ? ` — ${item.detail}` : ""}</span></li>)}</ul>
                </section>
              )}
              {actionPreview && (
                <section className={`rounded-xl border p-4 ${theme === "dark" ? "border-[#66C8C1] bg-[#182726]" : "border-[#66C8C1] bg-[#F3F8F6]"}`}>
                  <p className="font-semibold">Action requires your confirmation</p><p className="mt-1 whitespace-pre-wrap">{actionPreview.preview}</p>
                  <p className="mt-2 text-xs">Continuing may open the official portal. Login, OTP, CAPTCHA, payments, uploads, declarations, signatures, and final submission remain on that portal.</p>
                  <label className="mt-3 block text-xs font-medium" htmlFor="action-confirmation">Type your confirmation</label>
                  <div className="mt-1 flex gap-2"><input id="action-confirmation" value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#D5DFDB] bg-white px-3 py-2 text-xs text-[#163F3D]" placeholder="Yes, continue" /><button type="button" disabled={!confirmationText.trim()} onClick={() => { onConfirmAction(confirmationText); setConfirmationText(""); }} className="rounded-full bg-[#163F3D] px-4 py-2 text-xs font-semibold text-[#F3F8F6] disabled:opacity-40">Confirm action</button></div>
                </section>
              )}
              {activity.length > 0 && <section className={`rounded-xl border p-4 ${theme === "dark" ? "border-[#334846] bg-[#182726]" : "border-[#D5DFDB] bg-white"}`}><p className="font-semibold">Activity</p><ul className="mt-2 space-y-1.5 text-xs">{activity.map((entry) => <li key={entry.id}>{entry.text}{entry.timestamp ? ` · ${entry.timestamp}` : ""}</li>)}</ul></section>}
            </aside>
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
              onToggleListening={onToggleListening}
            />
          </div>
        )}
      </div>
    </div>
  );
}
