import "server-only";

import { GoogleGenAI } from "@google/genai";

import type {
  ChatRequest,
  ChatResponse,
} from "@/lib/contracts/chat";
import type {
  ChatCallOptions,
  ChatProviderPort,
} from "@/lib/ports/chat";

const DEFAULT_MODEL = "gemini-3.6-flash";

const SYSTEM_INSTRUCTIONS = {
  chat:
    "You are AI Service Desk, a clear and cautious assistant for Ethiopian government services such as passports, national ID, civil registration, driving licences, business and trade licensing, tax registration, land and property records, and document authentication. Explain requirements, documents, fees, offices, and processing steps in plain language. Distinguish general guidance from official decisions, never invent requirements, and advise users to verify current details with the responsible agency. Use concise headings or bullets when they improve clarity.",
  voice:
    "You are AI Service Desk, a warm voice assistant for Ethiopian government services such as passports, national ID, civil registration, driving licences, business licensing, tax registration, and document authentication. Give concise spoken guidance about requirements, documents, fees, and next steps in 1-3 conversational sentences. Never invent requirements; remind users to verify current details with the responsible agency when appropriate. Avoid markdown and bullet points.",
} as const;

const LANGUAGE_INSTRUCTIONS = {
  en: "Reply in clear English.",
  am: "Reply entirely in Amharic (አማርኛ), using Ethiopic script and everyday wording.",
} as const;

export interface GeminiChatProviderOptions {
  apiKey: string;
  model?: string;
}

function rejectWhenAborted<T>(
  promise: Promise<T>,
  signal: AbortSignal | undefined,
): Promise<T> {
  if (!signal) {
    return promise;
  }
  if (signal.aborted) {
    return Promise.reject(
      new DOMException("The provider request was aborted.", "AbortError"),
    );
  }

  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (!settled) {
        settled = true;
        signal.removeEventListener("abort", abort);
        callback();
      }
    };
    const abort = () => {
      finish(() =>
        reject(
          new DOMException("The provider request was aborted.", "AbortError"),
        ),
      );
    };
    signal.addEventListener("abort", abort, { once: true });
    promise.then(
      (value) => finish(() => resolve(value)),
      (error: unknown) => finish(() => reject(error)),
    );
  });
}

export class GeminiChatProvider implements ChatProviderPort {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(options: GeminiChatProviderOptions) {
    this.client = new GoogleGenAI({
      apiKey: options.apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });
    this.model = options.model ?? DEFAULT_MODEL;
  }

  async complete(
    request: ChatRequest,
    options: ChatCallOptions = {},
  ): Promise<ChatResponse> {
    if (options.signal?.aborted) {
      throw new DOMException("The provider request was aborted.", "AbortError");
    }
    const generation = this.client.models.generateContent({
      model: this.model,
      contents: request.prompt,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTIONS[request.mode]} ${
          LANGUAGE_INSTRUCTIONS[request.language]
        }`,
        temperature: 0.7,
      },
    });
    const response = await rejectWhenAborted(generation, options.signal);
    return { text: response.text?.trim() || "Message received." };
  }
}

export function createGeminiChatProvider(
  apiKey: string | undefined = process.env.GEMINI_API_KEY,
): ChatProviderPort | null {
  return apiKey
    ? new GeminiChatProvider({
        apiKey,
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      })
    : null;
}
