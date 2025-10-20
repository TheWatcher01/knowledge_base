import { execSync } from "node:child_process";
import path from "node:path";

import { expect, test } from "./fixtures";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
const DEFAULT_TEST_KB_ID = "00000000-0000-4000-8000-000000000000";
const KB_ID = (process.env.PLAYWRIGHT_TEST_KB_ID ?? DEFAULT_TEST_KB_ID).trim();

if (!KB_ID) {
  throw new Error("PLAYWRIGHT_TEST_KB_ID must be defined to run the chat history badge spec");
}

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@kb.local";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "Playwright!23";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/fr/login");
  await page.getByPlaceholder("Adresse e-mail").fill(DEMO_EMAIL);
  await page.getByPlaceholder("Mot de passe").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("**/fr/dashboard");
}

test.describe("Badge de conversations", () => {
  test("décrémente après suppression d'une conversation", async ({ page }) => {
    execSync("node tmp/seed-target-kb.cjs", {
      cwd: REPO_ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_TEST_KB_ID: KB_ID,
      },
    });

    await login(page);

    await page.goto(`/fr/kb/${KB_ID}/chat`);
    await page.waitForLoadState("networkidle");

    const badge = page.getByTestId("chat-tab-badge");
    const initialCount = parseInt((await badge.textContent()) ?? "0", 10);
    expect(initialCount).toBeGreaterThan(0);

    const historyItems = page.getByTestId("chat-history-item");
    await expect(historyItems).toHaveCount(initialCount);

    const firstDeleteButton = historyItems.first().getByTestId("chat-history-delete");

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await firstDeleteButton.click();

    await expect(badge).toHaveText(String(initialCount - 1));
    await expect(historyItems).toHaveCount(initialCount - 1);
  });
});
