import type {
  VoiceDescriptor,
  VoiceRecognitionHandlers,
  VoiceRecognitionOptions,
  VoiceRecognitionPort,
  VoiceSynthesisOptions,
  VoiceSynthesisPort,
} from "@/lib/ports/voice";

interface BrowserRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface BrowserRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: BrowserRecognitionAlternative;
}

interface BrowserRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    readonly [index: number]: BrowserRecognitionResult;
  };
}

interface BrowserRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface BrowserRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserRecognitionEvent) => void) | null;
  onerror: ((event: BrowserRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface BrowserRecognitionConstructor {
  new (): BrowserRecognition;
}

type SpeechWindow = Window & {
  SpeechRecognition?: BrowserRecognitionConstructor;
  webkitSpeechRecognition?: BrowserRecognitionConstructor;
};

function getRecognitionConstructor(): BrowserRecognitionConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const speechWindow = window as SpeechWindow;
  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition
  );
}

export class BrowserVoiceRecognitionAdapter
  implements VoiceRecognitionPort
{
  private recognition: BrowserRecognition | undefined;

  get supported(): boolean {
    return getRecognitionConstructor() !== undefined;
  }

  start(
    handlers: VoiceRecognitionHandlers,
    options: VoiceRecognitionOptions = {},
  ): void {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      handlers.onError?.({
        code: "not-supported",
        message: "Speech recognition is not supported by this browser.",
      });
      return;
    }

    this.abort();
    const recognition = new Recognition();
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = options.language ?? "en-US";
    recognition.onresult = (event) => {
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const alternative = result[0];
        handlers.onResult({
          transcript: alternative.transcript,
          isFinal: result.isFinal,
          ...(Number.isFinite(alternative.confidence)
            ? { confidence: alternative.confidence }
            : {}),
        });
      }
    };
    recognition.onerror = (event) => {
      handlers.onError?.({
        code: event.error,
        message: event.message ?? `Speech recognition failed: ${event.error}.`,
      });
    };
    recognition.onend = () => {
      if (this.recognition === recognition) {
        this.recognition = undefined;
      }
      handlers.onEnd?.();
    };
    this.recognition = recognition;
    recognition.start();
  }

  stop(): void {
    this.recognition?.stop();
  }

  abort(): void {
    this.recognition?.abort();
    this.recognition = undefined;
  }
}

export class BrowserVoiceSynthesisAdapter implements VoiceSynthesisPort {
  get supported(): boolean {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined"
    );
  }

  getVoices(): VoiceDescriptor[] {
    if (!this.supported) {
      return [];
    }
    return window.speechSynthesis.getVoices().map((voice) => ({
      id: voice.voiceURI,
      name: voice.name,
      language: voice.lang,
      isDefault: voice.default,
    }));
  }

  speak(text: string, options: VoiceSynthesisOptions = {}): Promise<void> {
    if (!this.supported) {
      return Promise.reject(
        new Error("Speech synthesis is not supported by this browser."),
      );
    }
    if (options.signal?.aborted) {
      return Promise.reject(
        new DOMException("Speech synthesis was aborted.", "AbortError"),
      );
    }

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language ?? "en-US";
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      if (options.voiceId) {
        utterance.voice =
          window.speechSynthesis
            .getVoices()
            .find((voice) => voice.voiceURI === options.voiceId) ?? null;
      }

      const abort = () => {
        window.speechSynthesis.cancel();
        reject(new DOMException("Speech synthesis was aborted.", "AbortError"));
      };
      const cleanup = () => {
        options.signal?.removeEventListener("abort", abort);
      };

      utterance.onend = () => {
        cleanup();
        resolve();
      };
      utterance.onerror = (event) => {
        cleanup();
        reject(new Error(`Speech synthesis failed: ${event.error}.`));
      };
      options.signal?.addEventListener("abort", abort, { once: true });
      window.speechSynthesis.speak(utterance);
    });
  }

  cancel(): void {
    if (this.supported) {
      window.speechSynthesis.cancel();
    }
  }
}
