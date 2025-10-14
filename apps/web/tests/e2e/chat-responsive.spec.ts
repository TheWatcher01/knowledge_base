import { expect, test } from './fixtures';

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@kb.local';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Playwright!23';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/fr/login');
  await page.getByPlaceholder('Adresse e-mail').fill(DEMO_EMAIL);
  await page.getByPlaceholder('Mot de passe').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL('**/fr/dashboard');
}

test.describe('Chat responsive layout', () => {
  test.use({ viewport: { width: 430, height: 932 } });

  test('mobile viewport offers ergonomic layout', async ({ page, configureRagMock }) => {
    await configureRagMock();
    await login(page);

    await page.goto('/fr/kb');
    const firstOpenLink = page.getByRole('link', { name: 'Ouvrir', exact: true }).first();
    await Promise.all([
      page.waitForURL(/\/fr\/kb\//),
      firstOpenLink.click(),
    ]);
    await Promise.all([
      page.waitForURL(/\/fr\/kb\/[^/]+\/chat$/),
      page.getByRole('link', { name: 'Chat', exact: true }).first().click(),
    ]);

    const kbOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const winWidth = window.innerWidth;
      const docWidth = doc.scrollWidth;
      const overflow = docWidth > winWidth + 1;

      if (!overflow) {
        return { overflow: false, docWidth, winWidth, offending: [] as string[] };
      }

      const offenders = Array.from(document.body.querySelectorAll<HTMLElement>("*"))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.right - winWidth > 1 || rect.left < -1
          );
        })
        .slice(0, 20)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const classes = element.className?.toString?.() ?? "";
          return `${element.tagName.toLowerCase()}${classes ? `.${classes.split(/\s+/).join('.')}` : ""} [left:${rect.left.toFixed(1)}, right:${rect.right.toFixed(1)}]`;
        });

      return { overflow: true, docWidth, winWidth, offending: offenders };
    });

    if (kbOverflow.overflow) {
      console.log("[chat-responsive] Horizontal overflow detected on KB page", kbOverflow);
    }

    expect(kbOverflow.overflow).toBeFalsy();

    const promptArea = page.getByLabel('Message');
    await expect(promptArea).toBeVisible();

    await page.goto('/fr/admin/models');
    await expect(page.getByRole('heading', { level: 1, name: 'Gestion des modèles Ollama' })).toBeVisible();

    const actionButtons = page.getByTestId('model-action-buttons');
    if (await actionButtons.count()) {
      const flexDirection = await actionButtons
        .first()
        .evaluate((element) => getComputedStyle(element).flexDirection);
      expect(flexDirection === 'column' || flexDirection === 'column-reverse').toBeTruthy();
    }

    const adminOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const winWidth = window.innerWidth;
      const docWidth = doc.scrollWidth;
      const overflow = docWidth > winWidth + 1;

      if (!overflow) {
        return { overflow: false, docWidth, winWidth, offending: [] as string[] };
      }

      const offenders = Array.from(document.body.querySelectorAll<HTMLElement>("*"))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.right - winWidth > 1 || rect.left < -1
          );
        })
        .slice(0, 20)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const classes = element.className?.toString?.() ?? "";
          return `${element.tagName.toLowerCase()}${classes ? `.${classes.split(/\s+/).join('.')}` : ""} [left:${rect.left.toFixed(1)}, right:${rect.right.toFixed(1)}]`;
        });

      return { overflow: true, docWidth, winWidth, offending: offenders };
    });

    if (adminOverflow.overflow) {
      console.log("[chat-responsive] Horizontal overflow detected on admin page", adminOverflow);
    }

    expect(adminOverflow.overflow).toBeFalsy();
  });
});
