"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getRandomSamplePrompt } from "@/features/studio/fixtures";
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runRef = useRef(0);
  const simulatingRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const finish = useCallback((run = runRef.current) => {
    if (run !== runRef.current) {
      return;
    }
    simulatingRef.current = false;
    timeoutRef.current = null;
    setIsListening(false);
    const finalTranscript = transcriptRef.current;
    if (finalTranscript.trim()) {
      onCompleteRef.current(finalTranscript);
    }
  }, []);

  const simulate = useCallback(() => {
    clearTimers();
    simulatingRef.current = true;
    const run = runRef.current;
    const prompt = getRandomSamplePrompt();
    let index = 0;
    intervalRef.current = setInterval(() => {
      index += 3;
      const nextTranscript = prompt.slice(0, index);
      transcriptRef.current = nextTranscript;
      setTranscript(nextTranscript);
      if (index >= prompt.length) {
        clearTimers();
        timeoutRef.current = setTimeout(() => finish(run), 800);
      }
    }, 90);
  }, [clearTimers, finish]);

  const start = useCallback(() => {
    clearTimers();
    runRef.current += 1;
    recognition.abort();
    transcriptRef.current = "";
    setTranscript("");
    setIsListening(true);

    if (!recognition.supported) {
      simulate();
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
          },
          onEnd: () => finish(run),
        },
        { continuous: false, interimResults: true, language },
      );
    } catch {
      simulate();
    }
  }, [clearTimers, finish, language, recognition, simulate]);

  const stop = useCallback(() => {
    if (simulatingRef.current) {
      clearTimers();
      finish();
      return;
    }
    if (recognition.supported) {
      recognition.stop();
      return;
    }
    clearTimers();
    finish();
  }, [clearTimers, finish, recognition]);

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
