// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { FetchClient } from "@/lib/api/fetch-client";
import { parseChatResponse } from "@/lib/contracts/chat";

describe("FetchClient", () => {
  it("serializes a request and parses a successful response", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ text: "Hello" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new FetchClient({ fetchImplementation });

    await expect(
      client.request("/api/chat", {
        method: "POST",
        body: { prompt: "Hi", mode: "chat" },
        parse: parseChatResponse,
      }),
    ).resolves.toEqual({ text: "Hello" });

    expect(fetchImplementation).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ prompt: "Hi", mode: "chat" }),
      }),
    );
  });

  it("preserves normalized API errors", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "INVALID_REQUEST", message: "Invalid chat request." },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );
    const client = new FetchClient({ fetchImplementation });

    await expect(
      client.request("/api/chat", {
        parse: parseChatResponse,
      }),
    ).rejects.toMatchObject({
      code: "INVALID_REQUEST",
      status: 400,
    });
  });

  it("uses a bound default fetch so Window.fetch is not illegally invoked", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ text: "Hello" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new FetchClient({ baseUrl: "https://example.test" });

    await expect(
      client.request("/api/chat", {
        parse: parseChatResponse,
      }),
    ).resolves.toEqual({ text: "Hello" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://example.test/api/chat",
      expect.objectContaining({ method: "GET" }),
    );
    fetchSpy.mockRestore();
  });

  it("parses MeriAI FastAPI detail errors", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: { code: "unknown_session", message: "Unknown session." },
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      ),
    );
    const client = new FetchClient({ fetchImplementation });

    await expect(
      client.request("/api/sessions/missing/text", {
        method: "POST",
        body: { turn_id: "t1", language: "en", text: "hello" },
        parse: () => ({ ok: true as const, value: null }),
      }),
    ).rejects.toMatchObject({
      code: "unknown_session",
      message: "Unknown session.",
      status: 404,
    });
  });

  it("rejects responses that violate the contract", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ value: "wrong" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new FetchClient({ fetchImplementation });

    await expect(
      client.request("/api/chat", {
        parse: parseChatResponse,
      }),
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });
});
