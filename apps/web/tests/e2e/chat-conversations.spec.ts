import { test, expect } from "./fixtures";
import { execSync } from "node:child_process";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
const DEFAULT_TEST_KB_ID = "00000000-0000-4000-8000-000000000000";
const KB_ID = (process.env.PLAYWRIGHT_TEST_KB_ID ?? DEFAULT_TEST_KB_ID).trim();
if (!KB_ID) {
  throw new Error("PLAYWRIGHT_TEST_KB_ID must be defined to run the chat conversations e2e spec");
}

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@kb.local";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "Playwright!23";

test.describe("Chat conversations seed", () => {
  test.beforeAll(() => {
    execSync("node tmp/seed-target-kb.cjs", {
      cwd: REPO_ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_TEST_KB_ID: KB_ID,
      },
    });
  });

  test("la page chat liste les conversations seedées", async ({ page }) => {
    await page.goto("/fr/login");

    await page.getByPlaceholder("Adresse e-mail").fill(DEMO_EMAIL);
    await page.getByPlaceholder("Mot de passe").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await page.waitForURL("**/fr/dashboard");

    await page.goto(`/fr/kb/${KB_ID}/chat`);
    await page.waitForLoadState("networkidle");

    const conversationLinks = page.locator('a[href*="/chat?conversation="]');
    await expect(conversationLinks).toHaveCount(5);
    await expect(conversationLinks.first()).toContainText("Monitoring");
  });
});
