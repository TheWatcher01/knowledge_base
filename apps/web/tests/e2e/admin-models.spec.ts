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

test.use({ ragMockDefaults: { failModels: ['demo-chat', 'llama3.1:8b'] } });

test.describe('Admin modèles', () => {
    test('affiche les erreurs renvoyées par le service RAG', async ({ page, configureRagMock }) => {
        await configureRagMock();
        await login(page);

        await page.goto('/fr/admin/models');
        await expect(page.getByRole('heading', { level: 1, name: 'Gestion des modèles Ollama' })).toBeVisible();
        await expect(page.getByTestId('ollama-jobs-section')).toBeVisible();

        const table = page.locator('[data-slot="table"]');
        await expect(table).toBeVisible();
        const rows = table.locator('tbody tr');
        const emptyState = page.getByText('Aucun modèle installé pour le moment.');
        await expect(async () => {
            if ((await rows.count()) > 0) return;
            if (await emptyState.isVisible()) return;
            throw new Error('aucun état visible');
        }).toPass({ timeout: 8000 });

        page.once('dialog', (dialog) => dialog.accept('demo-chat').catch(() => undefined));
        await page.getByRole('button', { name: 'Installer un modèle' }).click();

        await page.getByTestId('ollama-jobs-refresh').click();
        await expect(page.getByTestId('ollama-job-recent')).toContainText('demo-chat', { timeout: 15_000 });
        await expect(page.getByText("Dernière erreur : Model 'demo-chat' failed")).toBeVisible({ timeout: 15_000 });

        const snapshotBeforeDefaults = await page.request.get('/api/test/rag-mock/state');
        const beforeState = (await snapshotBeforeDefaults.json()) as { defaults: { chat_model: string | null } };
        expect(beforeState.defaults.chat_model).toBeNull();

        await table
            .locator('tbody tr')
            .filter({ hasText: 'llama3.1:8b' })
            .getByRole('button', { name: 'Définir pour le chat' })
            .first()
            .click();

        const snapshotAfterDefaults = await page.request.get('/api/test/rag-mock/state');
        const afterState = (await snapshotAfterDefaults.json()) as { defaults: { chat_model: string | null } };
        expect(afterState.defaults.chat_model).toBeNull();
    });
});
