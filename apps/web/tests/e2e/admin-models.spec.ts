import { expect, test } from '@playwright/test';

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@kb.local';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Playwright!23';

async function login(page: import('@playwright/test').Page) {
    await page.goto('/fr/login');
    await page.getByPlaceholder('Adresse e-mail').fill(DEMO_EMAIL);
    await page.getByPlaceholder('Mot de passe').fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('**/fr/dashboard');
}

test.describe('Admin modèles', () => {
    test('affiche la liste et permet de lancer une installation', async ({ page }) => {
        await login(page);

        await page.goto('/fr/admin/models');
        await expect(page.getByRole('heading', { level: 1, name: 'Gestion des modèles Ollama' })).toBeVisible();

        // Vérifier que le tableau apparaît
        const table = page.locator('[data-slot="table"]');
        await expect(table).toBeVisible();

        // Cliquer sur rafraîchir
        await page.getByRole('button', { name: /Actualiser la liste|Actualisation…/ }).click();

        const rows = table.locator('tbody tr');
        const emptyState = page.getByText('Aucun modèle installé pour le moment.');
        const errorState = page.getByText(/Impossible de charger la liste des modèles/);

        await expect(async () => {
            if (await rows.first().isVisible()) return;
            if (await emptyState.isVisible()) return;
            if (await errorState.isVisible()) return;
            throw new Error('no state visible');
        }).toPass({ timeout: 8000 });

        // Lancer l’installation : saisir rapidement un modèle inexistant pour tester le flux d’erreur
        const modelName = `playwright-test-${Date.now()}`;
        page.once('dialog', (dialog) => {
            dialog.accept(modelName).catch(() => undefined);
        });
        await page.getByRole('button', { name: 'Installer un modèle' }).click();

        // Attendre que le bouton repasse à l'état normal
        await expect(page.getByRole('button', { name: 'Installation en cours…' })).toBeHidden({ timeout: 20000 });
    });
});
