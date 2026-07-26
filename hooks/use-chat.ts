"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createMessage,
  createWelcomeMessage,
  DEFAULT_CHAT_COPY,
  generateUniqueId,
} from "@/features/studio/fixtures";
import { chatClient } from "@/lib/adapters/chat-client";
import { normalizeApiError, type ApiError } from "@/lib/api/errors";
import type { ChatClientPort } from "@/lib/ports/chat";
import {
  loadChatHistory,
  saveChatHistory,
} from "@/lib/storage/studio-storage";
import { translations } from "@/features/i18n/translations";
import type { Language, Message, StudioMode } from "@/types/studio";

interface UseChatOptions {
  mode: StudioMode;
  language?: Language;
  welcomeText?: string;
  newSessionText?: string;
  initialResponse?: string;
  client?: ChatClientPort;
  onResponse?: (text: string) => void;
}

export function useChat({
  mode,
  language = "en",
  welcomeText = DEFAULT_CHAT_COPY.welcome,
  newSessionText = DEFAULT_CHAT_COPY.newSession,
  initialResponse = translations.en.voice.initialResponse,
  client = chatClient,
  onResponse,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>(() => [
    createWelcomeMessage(welcomeText),
  ]);
  const [latestResponse, setLatestResponse] = useState(initialResponse);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasHydratedHistory, setHasHydratedHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const onResponseRef = useRef(onResponse);
  const newSessionTextRef = useRef(newSessionText);
  const hasRespondedRef = useRef(false);

  useEffect(() => {
    onResponseRef.current = onResponse;
  }, [onResponse]);

  useEffect(() => {
    newSessionTextRef.current = newSessionText;
  }, [newSessionText]);

  useEffect(() => {
    const savedMessages = loadChatHistory();
    if (savedMessages) setMessages(savedMessages);
    setHasHydratedHistory(true);
  }, []);

  // Keep the untouched greeting in the language the reader just selected.
  useEffect(() => {
    if (hasRespondedRef.current) return;
    setLatestResponse(initialResponse);
    setMessages((current) =>
      current.length === 1 && current[0].id === "1"
        ? [createWelcomeMessage(welcomeText)]
        : current,
    );
  }, [initialResponse, welcomeText]);

  useEffect(() => {
    if (hasHydratedHistory) saveChatHistory(messages);
  }, [hasHydratedHistory, messages]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const processPrompt = useCallback(
    async (rawText: string): Promise<void> => {
      const prompt = rawText.trim();
      if (!prompt) {
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsProcessing(true);
      setError(null);
      setMessages((current) => [...current, createMessage("user", prompt)]);

      try {
        const response = await client.send(
          { prompt, mode, language },
          { signal: controller.signal },
        );
        if (controller.signal.aborted) {
          return;
        }
        const text = response.text || translations[language].chat.emptyResponse;
        hasRespondedRef.current = true;
        setMessages((current) => [...current, createMessage("ai", text)]);
        setLatestResponse(text);
        onResponseRef.current?.(text);
      } catch (error: unknown) {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        setError(
          normalizeApiError(error, {
            code: "NETWORK_ERROR",
            message: "The studio could not reach the chat service.",
            status: 503,
          }),
        );
        const fallback = translations[language].chat.errorFallback;
        hasRespondedRef.current = true;
        setLatestResponse(fallback);
        onResponseRef.current?.(fallback);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsProcessing(false);
        }
      }
    },
    [client, language, mode],
  );

  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsProcessing(false);
    setError(null);
    setMessages([
      {
        id: generateUniqueId(),
        sender: "ai",
        text: newSessionTextRef.current,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, []);

  return {
    messages,
    latestResponse,
    isProcessing,
    error,
    processPrompt,
    startNewChat,
  };
}
