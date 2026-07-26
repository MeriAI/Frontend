import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { MessageList } from "@/components/studio/message-list";
import { SettingsProvider } from "@/features/settings/settings-provider";
import type { Message } from "@/types/studio";

const message: Message = {
  id: "assistant-1",
  sender: "ai",
  text: "Here is external context.",
  timestamp: "09:05 AM",
  research: {
    warning: "External research only. Review these sources before relying on this guidance.",
    citations: [
      { title: "Immigration and Citizenship Service", url: "https://www.immigration.gov.et/passport" },
    ],
  },
};

function renderMessageList(messages: Message[], theme: "light" | "dark") {
  return render(createElement(
    SettingsProvider,
    null,
    createElement(MessageList, {
      messages,
      theme,
      copiedMessageId: null,
      bottomRef: { current: null },
      onCopy: () => undefined,
    }),
  ));
}

afterEach(cleanup);

describe("MessageList sources", () => {
  it("keeps sources collapsed until the user opens the tray", () => {
    renderMessageList([message], "light");

    const sourcesButton = screen.getByRole("button", { name: /sources\s*1 source/i });
    expect(sourcesButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /immigration and citizenship service/i })).not.toBeInTheDocument();

    fireEvent.click(sourcesButton);

    expect(sourcesButton).toHaveAttribute("aria-expanded", "true");
    const citation = screen.getByRole("link", { name: /immigration and citizenship service/i });
    expect(citation).toHaveAttribute("href", "https://www.immigration.gov.et/passport");
    expect(citation).toHaveAttribute("target", "_blank");
    expect(citation).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByText("immigration.gov.et")).toBeInTheDocument();
  });

  it("keeps a research warning attached to an answer without citations", () => {
    renderMessageList([{ ...message, research: { warning: "Review before relying.", citations: [] } }], "dark");

    expect(screen.getByText("Review before relying.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sources/i })).not.toBeInTheDocument();
  });
});
