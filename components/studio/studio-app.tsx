"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { AccessibilityModal } from "@/components/studio/accessibility-modal";
import { ChatWorkspace } from "@/components/studio/chat-workspace";
import { Header } from "@/components/studio/header";
import { VoiceStage } from "@/components/studio/voice-stage";
import { useTranslations } from "@/features/i18n/use-translations";
import { useSettings } from "@/features/settings/settings-provider";
import { useMeriAiSession } from "@/hooks/use-meriai-session";
import type { SpeechState, StudioMode } from "@/types/studio";

interface StudioAppProps {
  initialMode?: StudioMode;
}

export function StudioApp({ initialMode = "voice" }: StudioAppProps) {
  const {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    contrast,
    setContrast,
    isMuted,
    setIsMuted,
    resetAccessibility,
  } = useSettings();
  const t = useTranslations();
  const [mode, setMode] = useState<StudioMode>(initialMode);
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const [chatInput, setChatInput] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [audioAmplitude, setAudioAmplitude] = useState(1);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    messages,
    isProcessing,
    isVoiceAvailable,
    statusReason,
    transcript,
    checklist,
    research,
    actionPreview,
    activity,
    services,
    missingQuestions,
    error,
    sendText,
    selectService,
    answerQuestion,
    startVoice,
    stopVoice,
    confirmAction,
    startNewChat,
  } = useMeriAiSession(language, mode, t.chat.welcome, isMuted);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => { if (isListening) setSpeechState("listening"); else if (!isProcessing) setSpeechState("idle"); }, [isListening, isProcessing]);

  useEffect(() => {
    if (isProcessing) setSpeechState("processing");
  }, [isProcessing]);

  useEffect(() => {
    if (speechState !== "listening" && speechState !== "speaking") return;
    const interval = setInterval(() => {
      setAudioAmplitude(0.98 + Math.random() * 0.14);
    }, 150);
    return () => {
      clearInterval(interval);
      setAudioAmplitude(1);
    };
  }, [speechState]);

  useEffect(() => {
    if (mode === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, mode]);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopVoice();
      setIsListening(false);
      return;
    }
    if (isVoiceAvailable && (speechState === "idle" || speechState === "speaking")) {
      void startVoice().then(() => setIsListening(true)).catch(() => setSpeechState("idle"));
    }
  }, [
    isListening,
    isVoiceAvailable,
    speechState,
    startVoice,
    stopVoice,
  ]);

  const handleChatSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    setSpeechState("processing");
    void sendText(text);
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const rootClassName = `min-h-screen w-full flex flex-col justify-between transition-colors duration-300 relative selection:bg-[#163F3D] selection:text-[#F3F8F6] ${
    theme === "dark"
      ? contrast === "max"
        ? "bg-[#163F3D] text-[#F3F8F6]"
        : "bg-[#101A1A] text-[#F3F8F6]"
      : contrast === "max"
        ? "bg-[#F3F8F6] text-[#163F3D]"
        : contrast === "high"
          ? "bg-[#F0F4F2] text-[#163F3D]"
          : "bg-[#FAFAF7] text-[#163F3D]"
  } ${
    fontSize === "small"
      ? "text-xs"
      : fontSize === "large"
        ? "text-base"
        : fontSize === "xlarge"
          ? "text-lg"
          : "text-sm"
  }`;

  return (
    <div className={rootClassName}>
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenAccessibility={() => setIsAccessibilityModalOpen(true)}
        isMuted={isMuted}
        onMuteChange={setIsMuted}
        theme={theme}
        contrast={contrast}
      />
      <main className={`flex-1 w-full mx-auto flex flex-col items-center justify-center relative ${mode === "chat" ? "max-w-full px-2 md:px-4 py-2" : "max-w-4xl px-6 py-6"}`}>
        {error && <p role="alert" className="mb-3 max-w-2xl rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-xs text-red-900">{error.message}</p>}
        {mode === "voice" ? (
          <VoiceStage
            speechState={speechState}
            transcript={transcript}
            latestResponse={messages.at(-1)?.sender === "ai" ? messages.at(-1)?.text ?? t.voice.initialResponse : t.voice.initialResponse}
            audioAmplitude={audioAmplitude}
            onToggleListening={toggleListening}
            voiceAvailable={isVoiceAvailable}
            statusReason={statusReason}
          />
        ) : (
          <ChatWorkspace
            messages={messages}
            theme={theme}
            input={chatInput}
            isListening={isListening}
            sidebarOpen
            copiedMessageId={copiedMessageId}
            bottomRef={chatBottomRef}
            onInputChange={setChatInput}
            onSubmit={handleChatSubmit}
            onToggleListening={toggleListening}
            onNewChat={startNewChat}
            onCopy={handleCopyMessage}
            checklist={checklist}
            research={research}
            actionPreview={actionPreview}
            activity={activity}
            onConfirmAction={confirmAction}
            services={services}
            onSelectService={selectService}
            missingQuestions={missingQuestions}
            onAnswerQuestion={answerQuestion}
          />
        )}
      </main>
      {isAccessibilityModalOpen && (
        <AccessibilityModal
          language={language}
          fontSize={fontSize}
          theme={theme}
          contrast={contrast}
          onLanguageChange={setLanguage}
          onFontSizeChange={setFontSize}
          onThemeChange={setTheme}
          onContrastChange={setContrast}
          onReset={resetAccessibility}
          onClose={() => setIsAccessibilityModalOpen(false)}
        />
      )}
    </div>
  );
}
