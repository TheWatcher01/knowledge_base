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

test.describe('Historique des URLs', () => {
    test('affiche l’historique après création et ingestion', async ({ page }) => {
        await login(page);

        const kbResponse = await page.request.get('/api/kb');
        expect(kbResponse.ok()).toBeTruthy();
        const knowledgeBases = (await kbResponse.json()) as Array<{ id: string }>;
        expect(knowledgeBases.length, 'au moins une base de connaissance').toBeGreaterThan(0);

        const kbId = knowledgeBases[0]!.id;
        const uniqueSuffix = Date.now().toString(36);
        const title = `URL Playwright ${uniqueSuffix}`;
        const targetUrl = `https://example.com/playwright-${uniqueSuffix}`;

        const createResponse = await page.request.post('/api/urls', {
            data: {
                kbId,
                title,
                url: targetUrl,
                description: `Description ${uniqueSuffix}`,
            },
        });

        expect(createResponse.status()).toBe(201);
        const created = (await createResponse.json()) as {
            url: { id: string; status: string };
        };

        const documentId = created.url.id;
        expect(documentId).toBeTruthy();

        await page.goto(`/fr/kb/${kbId}/urls`);
        await page.waitForLoadState('networkidle');

        const urlRow = page.locator('li').filter({ hasText: title }).first();
        await expect(urlRow, 'la nouvelle URL doit apparaître dans la liste').toBeVisible();

        const historyButton = urlRow.getByRole('button', { name: 'Historique' });
        await historyButton.click();

        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: 'Historique d’ingestion' })).toBeVisible();

        const loadingMessage = dialog.getByText('Chargement de l’historique…');
        await loadingMessage.waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => undefined);

        const historyText = await dialog.innerText();
        expect(historyText.trim().length, 'le dialogue doit afficher un contenu lisible').toBeGreaterThan(0);

        await dialog.getByRole('button', { name: 'Fermer' }).click();
        await expect(dialog).toBeHidden();
    });
});
