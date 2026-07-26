import { describe, expect, it } from "vitest";

import {
  loadAccessibilitySettings,
  loadAccountSettings,
  loadChatHistory,
  saveAccessibilitySettings,
  saveAccountSettings,
  saveChatHistory,
} from "@/lib/storage/studio-storage";

describe("studio storage", () => {
  it("round-trips validated chat history", () => {
    const messages = [
      {
        id: "message-1",
        sender: "user" as const,
        text: "Persist this conversation",
        timestamp: "10:00 AM",
      },
    ];

    saveChatHistory(messages);

    expect(loadChatHistory()).toEqual(messages);
  });

  it("round-trips account and voice defaults", () => {
    const settings = {
      userName: "Studio User",
      userEmail: "studio@example.com",
      userOrg: "Design Team",
      voiceModel: "Eleven Turbo v2.5",
      audioQuality: "22.05 kHz Low Latency",
    };

    saveAccountSettings(settings);

    expect(loadAccountSettings()).toEqual(settings);
  });

  it("round-trips accessibility settings so every page stays in sync", () => {
    const settings = {
      language: "am" as const,
      fontSize: "large" as const,
      theme: "dark" as const,
      contrast: "high" as const,
    };

    saveAccessibilitySettings(settings);

    expect(loadAccessibilitySettings()).toEqual(settings);
  });

  it("ignores unsupported accessibility values", () => {
    window.localStorage.setItem(
      "bauhaus-studio:accessibility-settings",
      JSON.stringify({
        version: 1,
        data: { language: "fr", fontSize: "huge", theme: "light", contrast: "normal" },
      }),
    );

    expect(loadAccessibilitySettings()).toBeNull();
  });

  it("ignores malformed or outdated data", () => {
    window.localStorage.setItem(
      "bauhaus-studio:chat-history",
      JSON.stringify({ version: 99, data: [{ text: "invalid" }] }),
    );

    expect(loadChatHistory()).toBeNull();
  });
});
