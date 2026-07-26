import { describe, expect, it } from "vitest";

import {
  parseChatRequest,
  parseChatResponse,
} from "@/lib/contracts/chat";

describe("chat contracts", () => {
  it("normalizes a valid request and defaults its mode and language", () => {
    expect(parseChatRequest({ prompt: "  Hello  " })).toEqual({
      ok: true,
      value: { prompt: "Hello", mode: "chat", language: "en" },
    });
  });

  it("keeps a supported language", () => {
    expect(parseChatRequest({ prompt: "Hello", language: "am" })).toEqual({
      ok: true,
      value: { prompt: "Hello", mode: "chat", language: "am" },
    });
  });

  it("rejects invalid requests", () => {
    const result = parseChatRequest({
      prompt: "",
      mode: "unsupported",
      language: "fr",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.path)).toEqual([
        "prompt",
        "mode",
        "language",
      ]);
    }
  });

  it("accepts only typed chat responses", () => {
    expect(parseChatResponse({ text: "Ready." })).toEqual({
      ok: true,
      value: { text: "Ready." },
    });
    expect(parseChatResponse({ message: "Ready." }).ok).toBe(false);
  });
});
