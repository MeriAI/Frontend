import type { ChatLanguage, ChatMode } from "@/lib/contracts/chat";
import type { Research } from "@/lib/contracts/meriai";

export type StudioMode = ChatMode;
export type Language = ChatLanguage;
export type FontSize = "small" | "normal" | "large" | "xlarge";
export type Theme = "light" | "dark";
export type Contrast = "normal" | "high" | "max";
export type SpeechState = "idle" | "listening" | "processing" | "speaking";

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  verified?: boolean;
  research?: Research;
}

export interface AccountSettings {
  userName: string;
  userEmail: string;
  userOrg: string;
  voiceModel: string;
  audioQuality: string;
}

export interface AccessibilitySettings {
  language: Language;
  fontSize: FontSize;
  theme: Theme;
  contrast: Contrast;
}
