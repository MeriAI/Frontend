"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { BrowserVoiceSynthesisAdapter } from "@/lib/adapters/browser-voice";
import type { VoiceSynthesisPort } from "@/lib/ports/voice";

interface UseSpeechSynthesisOptions {
  isMuted: boolean;
  rate: number;
  adapter?: VoiceSynthesisPort;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useSpeechSynthesis({
  isMuted,
  rate,
  adapter,
  onStart,
  onEnd,
}: UseSpeechSynthesisOptions) {
  const synthesis = useMemo(
    () => adapter ?? new BrowserVoiceSynthesisAdapter(),
    [adapter],
  );
  const abortRef = useRef<AbortController | null>(null);
  const callbacksRef = useRef({ onStart, onEnd });

  useEffect(() => {
    callbacksRef.current = { onStart, onEnd };
  }, [onEnd, onStart]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    synthesis.cancel();
  }, [synthesis]);

  useEffect(() => cancel, [cancel]);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      cancel();
      if (isMuted || !synthesis.supported) {
        callbacksRef.current.onEnd?.();
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const preferredVoice = synthesis
        .getVoices()
        .find(
          (voice) =>
            voice.language.includes("en") &&
            (voice.name.includes("Natural") ||
              voice.name.includes("Google") ||
              voice.name.includes("Samantha")),
        );

      callbacksRef.current.onStart?.();
      try {
        await synthesis.speak(text, {
          rate,
          pitch: 1,
          voiceId: preferredVoice?.id,
          signal: controller.signal,
        });
      } catch (error: unknown) {
        if (
          !controller.signal.aborted &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          console.log("Speech synthesis error:", error);
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          callbacksRef.current.onEnd?.();
        }
      }
    },
    [cancel, isMuted, rate, synthesis],
  );

  return { speak, cancel };
}
