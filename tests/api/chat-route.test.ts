// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/chat/route";

describe("POST /api/chat", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects malformed payloads with the shared error contract", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: "" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_REQUEST" },
    });
  });

  it("uses the explicit development fallback without a provider key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const response = await POST(
      new NextRequest("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: "Hello", mode: "voice" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      text: "Welcome to AI Service Desk. Ask me about requirements, documents, fees, or next steps for Ethiopian government services.",
    });
  });

  it("answers in Amharic when the request asks for it", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const response = await POST(
      new NextRequest("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: "ሰላም", mode: "chat", language: "am" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { text: string };
    expect(payload.text).toMatch(/[\u1200-\u137F]/);
  });
});
