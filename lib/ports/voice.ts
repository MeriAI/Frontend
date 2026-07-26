export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface VoiceRecognitionHandlers {
  onResult: (result: VoiceRecognitionResult) => void;
  onEnd?: () => void;
  onError?: (error: VoiceRecognitionError) => void;
}

export interface VoiceRecognitionError {
  code: string;
  message: string;
}

export interface VoiceRecognitionPort {
  readonly supported: boolean;
  start(
    handlers: VoiceRecognitionHandlers,
    options?: VoiceRecognitionOptions,
  ): void;
  stop(): void;
  abort(): void;
}

export interface VoiceDescriptor {
  id: string;
  name: string;
  language: string;
  isDefault: boolean;
}

export interface VoiceSynthesisOptions {
  language?: string;
  voiceId?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  signal?: AbortSignal;
}

export interface VoiceSynthesisPort {
  readonly supported: boolean;
  getVoices(): VoiceDescriptor[];
  speak(text: string, options?: VoiceSynthesisOptions): Promise<void>;
  cancel(): void;
}
