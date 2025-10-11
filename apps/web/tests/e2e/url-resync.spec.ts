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

test.describe('Relance ingestion URL', () => {
    test('relance une URL en erreur et met à jour le statut', async ({ page, configureRagMock }) => {
        await configureRagMock();

        await login(page);

        const kbResponse = await page.request.get('/api/kb');
        expect(kbResponse.ok(), 'liste des KB accessible').toBeTruthy();
        const knowledgeBases = (await kbResponse.json()) as Array<{ id: string }>;
        expect(knowledgeBases.length).toBeGreaterThan(0);

        const kbId = knowledgeBases[0]!.id;
        const uniqueSuffix = Date.now().toString(36);
        const title = `URL erreur ${uniqueSuffix}`;
        const targetUrl = `https://example.com/error-${uniqueSuffix}`;

        const createResponse = await page.request.post('/api/urls', {
            data: {
                kbId,
                title,
                url: targetUrl,
                description: `URL de test ${uniqueSuffix}`,
                status: 'error',
            },
        });

        expect(createResponse.status()).toBe(201);
        const created = (await createResponse.json()) as {
            url: { id: string };
        };

        const documentId = created.url.id;
        expect(documentId).toBeTruthy();

        const forceError = await page.request.patch(`/api/urls/${documentId}`, {
            data: {
                status: 'error',
            },
        });
        expect(forceError.status()).toBe(200);

        await page.goto(`/fr/kb/${kbId}/urls`);
        await page.waitForLoadState('networkidle');

        const urlRow = page.locator('li').filter({ hasText: title }).first();
        await expect(urlRow, 'le lien doit être visible').toBeVisible();

        const resyncButton = urlRow.getByRole('button', { name: 'Relancer l’ingestion' });
        await expect(resyncButton).toBeVisible();

        await Promise.all([
            page.waitForResponse((response) => response.url().includes(`/api/urls/${documentId}`) && response.request().method() === 'PATCH'),
            resyncButton.click(),
        ]);

        await expect(urlRow).toContainText('En attente', { timeout: 15_000 });
    });
});
