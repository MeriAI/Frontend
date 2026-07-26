import { translations } from "@/features/i18n/translations";
import type { Message } from "@/types/studio";

export const DEFAULT_CHAT_COPY = translations.en.chat;

export function createWelcomeMessage(
  text: string = DEFAULT_CHAT_COPY.welcome,
): Message {
  return {
    id: "1",
    sender: "ai",
    text,
    timestamp: "11:09 AM",
  };
}

let messageCounter = 0;

export function generateUniqueId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

export function getRandomSamplePrompt(
  prompts: readonly string[] = DEFAULT_CHAT_COPY.samplePrompts,
): string {
  const index = Math.floor(Math.random() * prompts.length);
  return prompts[index];
}

export function createMessage(
  sender: Message["sender"],
  text: string,
): Message {
  return {
    id: generateUniqueId(),
    sender,
    text,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
