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

test.describe('Admin modèles (réel)', () => {
    test.skip(process.env.E2E_USE_RAG_MOCK !== 'false', 'Ce test ne s\'exécute qu\'en mode réel (mock désactivé).');

    test('affiche la page gestion des modèles sans mock', async ({ page }) => {
        await login(page);

        await page.goto('/fr/admin/models');
        await expect(page.getByRole('heading', { level: 1, name: 'Gestion des modèles Ollama' })).toBeVisible();
        await expect(page.getByTestId('ollama-jobs-section')).toBeVisible();

        const table = page.locator('[data-slot="table"]');
        await expect(table).toBeVisible();

        const rows = await table.locator('tbody tr').count();
        const emptyStateVisible = await page
            .getByText('Aucun modèle installé pour le moment.')
            .isVisible({ timeout: 1000 })
            .catch(() => false);

        expect(rows > 0 || emptyStateVisible).toBeTruthy();
    });
});
