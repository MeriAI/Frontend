import { expect, test } from "@playwright/test";

test("landing page presents the government service catalogue", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /Know what you need before you visit a government office/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Service catalogue", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "National ID Registration" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /passport/i })).toHaveCount(1);
});

test("catalogue cards are informational and never navigate", async ({ page }) => {
  await page.goto("/services");

  const passportCard = page
    .getByRole("article")
    .filter({ hasText: "Passport Application & Renewal" });

  await expect(passportCard.getByText("Available Now")).toBeVisible();
  await expect(passportCard.getByRole("link")).toHaveCount(0);
  await expect(passportCard.getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("article").getByRole("link")).toHaveCount(0);
});

test("switching to Amharic translates every page", async ({ page }) => {
  await page.goto("/");

  // The first click can land before React hydrates the settings button.
  await expect(async () => {
    await page.locator("#marketing-accessibility-btn").click();
    await expect(page.locator("#lang-am-btn")).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
  await page.locator("#lang-am-btn").click();
  await page.locator("#close-accessibility-modal-btn").click();

  await expect(
    page.getByRole("heading", { name: /የሚያስፈልግዎትን ይወቁ/ }),
  ).toBeVisible();
  await expect(page.getByText("የአገልግሎት ዝርዝር")).toBeVisible();

  await page.goto("/services");
  await expect(
    page.getByRole("heading", { name: "የትኛው የመንግስት አገልግሎት ያስፈልግዎታል?" }),
  ).toBeVisible();

  await page.goto("/studio?mode=chat");
  await expect(page.getByText("የኢትዮጵያ የመንግስት አገልግሎቶች")).toBeVisible();
});

test("assistant section opens the chat experience", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Chat with our AI assistant" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Open the AI assistant chat" }).click();

  await expect(page).toHaveURL(/\/studio\?mode=chat$/);
  await expect(page.locator("#chat-workspace")).toBeVisible();
});
