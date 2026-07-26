import type {
  AccessibilitySettings,
  AccountSettings,
  Message,
} from "@/types/studio";

const STORAGE_VERSION = 1;
const CHAT_HISTORY_KEY = "bauhaus-studio:chat-history";
const ACCOUNT_SETTINGS_KEY = "bauhaus-studio:account-settings";
const ACCESSIBILITY_SETTINGS_KEY = "bauhaus-studio:accessibility-settings";
const MAX_STORED_MESSAGES = 500;

interface StorageEnvelope<T> {
  version: number;
  data: T;
}

function readStorage(key: string): unknown {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  const envelope: StorageEnvelope<T> = {
    version: STORAGE_VERSION,
    data,
  };

  try {
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Storage may be unavailable or full; keep the in-memory experience working.
  }
}

function readEnvelope(value: unknown): unknown {
  if (
    typeof value !== "object" ||
    value === null ||
    !("version" in value) ||
    !("data" in value) ||
    value.version !== STORAGE_VERSION
  ) {
    return null;
  }

  return value.data;
}

function isMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "sender" in value &&
    (value.sender === "user" || value.sender === "ai") &&
    "text" in value &&
    typeof value.text === "string" &&
    "timestamp" in value &&
    typeof value.timestamp === "string"
  );
}

function isAccountSettings(value: unknown): value is AccountSettings {
  if (typeof value !== "object" || value === null) return false;

  return (
    "userName" in value &&
    typeof value.userName === "string" &&
    "userEmail" in value &&
    typeof value.userEmail === "string" &&
    "userOrg" in value &&
    typeof value.userOrg === "string" &&
    "voiceModel" in value &&
    typeof value.voiceModel === "string" &&
    "audioQuality" in value &&
    typeof value.audioQuality === "string"
  );
}

function isAccessibilitySettings(
  value: unknown,
): value is AccessibilitySettings {
  if (typeof value !== "object" || value === null) return false;

  return (
    "language" in value &&
    (value.language === "en" || value.language === "am") &&
    "fontSize" in value &&
    ["small", "normal", "large", "xlarge"].includes(value.fontSize as string) &&
    "theme" in value &&
    (value.theme === "light" || value.theme === "dark") &&
    "contrast" in value &&
    ["normal", "high", "max"].includes(value.contrast as string)
  );
}

export function loadChatHistory(): Message[] | null {
  const data = readEnvelope(readStorage(CHAT_HISTORY_KEY));
  if (!Array.isArray(data) || data.length === 0 || !data.every(isMessage)) {
    return null;
  }

  return data.slice(-MAX_STORED_MESSAGES);
}

export function saveChatHistory(messages: Message[]): void {
  writeStorage(CHAT_HISTORY_KEY, messages.slice(-MAX_STORED_MESSAGES));
}

export function loadAccountSettings(): AccountSettings | null {
  const data = readEnvelope(readStorage(ACCOUNT_SETTINGS_KEY));
  return isAccountSettings(data) ? data : null;
}

export function saveAccountSettings(settings: AccountSettings): void {
  writeStorage(ACCOUNT_SETTINGS_KEY, settings);
}

export function loadAccessibilitySettings(): AccessibilitySettings | null {
  const data = readEnvelope(readStorage(ACCESSIBILITY_SETTINGS_KEY));
  return isAccessibilitySettings(data) ? data : null;
}

export function saveAccessibilitySettings(
  settings: AccessibilitySettings,
): void {
  writeStorage(ACCESSIBILITY_SETTINGS_KEY, settings);
}
