"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BrowserVoiceRecognitionAdapter } from "@/lib/adapters/browser-voice";
import type { VoiceRecognitionPort } from "@/lib/ports/voice";

interface UseSpeechRecognitionOptions {
  adapter?: VoiceRecognitionPort;
  language?: string;
  onComplete: (transcript: string) => void;
}

export function useSpeechRecognition({
  adapter,
  language = "en-US",
  onComplete,
}: UseSpeechRecognitionOptions) {
  const recognition = useMemo(
    () => adapter ?? new BrowserVoiceRecognitionAdapter(),
    [adapter],
  );
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const transcriptRef = useRef("");
  const onCompleteRef = useRef(onComplete);
  const runRef = useRef(0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimers = useCallback(() => {
    // Reserved for a future recognition adapter that needs local cleanup.
  }, []);

  const finish = useCallback((run = runRef.current) => {
    if (run !== runRef.current) {
      return;
    }
    setIsListening(false);
    const finalTranscript = transcriptRef.current;
    if (finalTranscript.trim()) {
      onCompleteRef.current(finalTranscript);
    }
  }, []);

  const start = useCallback(() => {
    clearTimers();
    runRef.current += 1;
    recognition.abort();
    transcriptRef.current = "";
    setTranscript("");
    setIsListening(true);

    if (!recognition.supported) {
      setIsListening(false);
      return;
    }

    try {
      const run = runRef.current;
      recognition.start(
        {
          onResult: (result) => {
            transcriptRef.current = result.transcript;
            setTranscript(result.transcript);
          },
          onError: (error) => {
            console.log("Speech recognition error:", error.code);
            setIsListening(false);
          },
          onEnd: () => finish(run),
        },
        { continuous: false, interimResults: true, language },
      );
    } catch {
      setIsListening(false);
    }
  }, [clearTimers, finish, language, recognition]);

  const stop = useCallback(() => {
    if (recognition.supported) {
      recognition.stop();
      return;
    }
    clearTimers();
    setIsListening(false);
  }, [clearTimers, recognition]);

  useEffect(
    () => () => {
      runRef.current += 1;
      clearTimers();
      recognition.abort();
    },
    [clearTimers, recognition],
  );

  return { transcript, isListening, start, stop };
}
