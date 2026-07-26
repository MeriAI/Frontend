import path from "node:path";

import { expect, test } from "@playwright/test";

const DEV_OVERLAY_HIDDEN = path.join(__dirname, "screenshot.css");

test.beforeEach(async ({ page }) => {
  // Test machines have no microphone, so drive the simulated recognition path.
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, "SpeechRecognition");
    Reflect.deleteProperty(window, "webkitSpeechRecognition");
  });
  await page.goto("/studio");
});

test("preserves voice, chat, and modal interactions", async ({ page }) => {
  await expect(page.locator("#audio-sphere-button")).toBeVisible();
  await expect(async () => {
    await page.locator("#main-mic-action-btn").click();
    await expect(page.getByText("Listening...")).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });

  await page.locator("#chat-mode-toggle").click();
  await expect(
    page.getByRole("heading", {
      name: "Which government service can I help you prepare for?",
    }),
  ).toBeVisible();

  await page.locator("#accessibility-settings-btn").click();
  await page.locator("#theme-dark-btn").click();
  await expect(page.locator("body").locator("div.min-h-screen")).toHaveClass(
    /bg-\[#101A1A\]/,
  );
  await expect(page.locator("#chat-workspace")).toHaveClass(
    /bg-\[#101A1A\]/,
  );
});

test("keeps stable visual states", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Desktop visual baseline only");

  await expect(page).toHaveScreenshot("voice-idle.png", {
    animations: "disabled",
    fullPage: true,
    stylePath: DEV_OVERLAY_HIDDEN,
  });

  await page.locator("#chat-mode-toggle").click();
  await expect(page).toHaveScreenshot("chat-empty.png", {
    animations: "disabled",
    fullPage: true,
    stylePath: DEV_OVERLAY_HIDDEN,
  });

  await page.locator("#accessibility-settings-btn").click();
  await expect(page).toHaveScreenshot("accessibility-modal.png", {
    animations: "disabled",
    fullPage: true,
    stylePath: DEV_OVERLAY_HIDDEN,
  });
});
