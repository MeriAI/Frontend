"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { AccessibilityModal } from "@/components/studio/accessibility-modal";
import { ChatWorkspace } from "@/components/studio/chat-workspace";
import { Header } from "@/components/studio/header";
import { VoiceStage } from "@/components/studio/voice-stage";
import { useTranslations } from "@/features/i18n/use-translations";
import { useSettings } from "@/features/settings/settings-provider";
import { getRandomSamplePrompt } from "@/features/studio/fixtures";
import { useChat } from "@/hooks/use-chat";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
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
    voiceSpeed,
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

  const { speak, cancel: cancelSpeech } = useSpeechSynthesis({
    isMuted,
    rate: voiceSpeed,
    onStart: () => setSpeechState("speaking"),
    onEnd: () => setSpeechState("idle"),
  });
  const {
    messages,
    latestResponse,
    isProcessing,
    processPrompt,
    startNewChat,
  } = useChat({
    mode,
    language,
    welcomeText: t.chat.welcome,
    newSessionText: t.chat.newSession,
    initialResponse: t.voice.initialResponse,
    onResponse: (text) => {
      void speak(text);
    },
  });
  const completeRecognition = useCallback(
    (text: string) => {
      setSpeechState("processing");
      void processPrompt(text);
    },
    [processPrompt],
  );
  const {
    transcript,
    isListening,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition({ onComplete: completeRecognition });

  useEffect(() => {
    if (isListening) {
      setSpeechState("listening");
    } else if (!isProcessing && speechState === "listening") {
      setSpeechState("idle");
    }
  }, [isListening, isProcessing, speechState]);

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
      stopListening();
      return;
    }
    if (speechState === "idle" || speechState === "speaking") {
      cancelSpeech();
      startListening();
    }
  }, [
    cancelSpeech,
    isListening,
    speechState,
    startListening,
    stopListening,
  ]);

  const handleChatSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    setSpeechState("processing");
    void processPrompt(text);
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
        {mode === "voice" ? (
          <VoiceStage
            speechState={speechState}
            transcript={transcript}
            latestResponse={latestResponse}
            audioAmplitude={audioAmplitude}
            onToggleListening={toggleListening}
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
            onPresetPrompt={() => {
              setSpeechState("processing");
              void processPrompt(getRandomSamplePrompt(t.chat.samplePrompts));
            }}
            onToggleListening={toggleListening}
            onNewChat={startNewChat}
            onSelectTopic={(topic) => {
              setSpeechState("processing");
              void processPrompt(t.chat.topicPrompt(topic));
            }}
            onCopy={handleCopyMessage}
            onSpeak={(text) => void speak(text)}
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
