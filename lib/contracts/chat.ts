import {
  isRecord,
  type ParseResult,
  type ValidationIssue,
} from "@/lib/contracts/api";

export const CHAT_MODES = ["chat", "voice"] as const;
export type ChatMode = (typeof CHAT_MODES)[number];

export const CHAT_LANGUAGES = ["en", "am"] as const;
export type ChatLanguage = (typeof CHAT_LANGUAGES)[number];

export interface ChatRequest {
  prompt: string;
  mode: ChatMode;
  language: ChatLanguage;
}

export interface ChatResponse {
  text: string;
}

const MAX_PROMPT_LENGTH = 10_000;

function isChatMode(value: unknown): value is ChatMode {
  return value === "chat" || value === "voice";
}

function isChatLanguage(value: unknown): value is ChatLanguage {
  return value === "en" || value === "am";
}

export function parseChatRequest(value: unknown): ParseResult<ChatRequest> {
  if (!isRecord(value)) {
    return {
      ok: false,
      issues: [{ path: "$", message: "Expected a JSON object." }],
    };
  }

  const issues: ValidationIssue[] = [];
  const rawPrompt = value.prompt;
  const rawMode = value.mode;
  const rawLanguage = value.language;

  if (typeof rawPrompt !== "string" || rawPrompt.trim().length === 0) {
    issues.push({
      path: "prompt",
      message: "Prompt must be a non-empty string.",
    });
  } else if (rawPrompt.length > MAX_PROMPT_LENGTH) {
    issues.push({
      path: "prompt",
      message: `Prompt must be at most ${MAX_PROMPT_LENGTH} characters.`,
    });
  }

  if (rawMode !== undefined && !isChatMode(rawMode)) {
    issues.push({
      path: "mode",
      message: 'Mode must be either "chat" or "voice".',
    });
  }

  if (rawLanguage !== undefined && !isChatLanguage(rawLanguage)) {
    issues.push({
      path: "language",
      message: 'Language must be either "en" or "am".',
    });
  }

  if (issues.length > 0 || typeof rawPrompt !== "string") {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      prompt: rawPrompt.trim(),
      mode: isChatMode(rawMode) ? rawMode : "chat",
      language: isChatLanguage(rawLanguage) ? rawLanguage : "en",
    },
  };
}

export function parseChatResponse(value: unknown): ParseResult<ChatResponse> {
  if (!isRecord(value) || typeof value.text !== "string") {
    return {
      ok: false,
      issues: [{ path: "text", message: "Expected response text." }],
    };
  }

  return { ok: true, value: { text: value.text } };
}
