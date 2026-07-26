import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useChat } from "@/hooks/use-chat";
import type { ChatClientPort } from "@/lib/ports/chat";

describe("useChat", () => {
  it("orchestrates typed chat requests and responses", async () => {
    const send = vi.fn<ChatClientPort["send"]>().mockResolvedValue({
      text: "Backend response",
    });
    const onResponse = vi.fn();
    const { result } = renderHook(() =>
      useChat({
        mode: "chat",
        client: { send },
        onResponse,
      }),
    );

    await act(async () => {
      await result.current.processPrompt("Hello");
    });

    expect(send).toHaveBeenCalledWith(
      { prompt: "Hello", mode: "chat", language: "en" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.messages.at(-1)).toMatchObject({
      sender: "ai",
      text: "Backend response",
    });
    expect(onResponse).toHaveBeenCalledWith("Backend response");
  });

  it("aborts an in-flight request when a newer prompt starts", async () => {
    const signals: AbortSignal[] = [];
    const send: ChatClientPort["send"] = (_request, options) =>
      new Promise((resolve) => {
        if (options?.signal) signals.push(options.signal);
        if (signals.length === 2) resolve({ text: "Latest response" });
      });
    const { result } = renderHook(() =>
      useChat({ mode: "voice", client: { send } }),
    );

    act(() => {
      void result.current.processPrompt("First");
      void result.current.processPrompt("Second");
    });

    await waitFor(() => expect(result.current.isProcessing).toBe(false));
    expect(signals[0]?.aborted).toBe(true);
    expect(result.current.latestResponse).toBe("Latest response");
  });
});
