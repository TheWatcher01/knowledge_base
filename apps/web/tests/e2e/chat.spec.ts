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

test.describe('Chat des bases de connaissance', () => {
    test('démarre une nouvelle conversation pour chaque base sélectionnée', async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (message) => {
            if (message.type() === 'error') {
                consoleErrors.push(message.text());
            }
        });

        await login(page);

        await page.goto('/fr/kb');
        await expect(page.getByRole('heading', { level: 1, name: 'Bases de connaissance' })).toBeVisible();
        const firstKbHeading = page.getByRole('heading', { level: 2 }).first();
        const firstKbName = (await firstKbHeading.textContent())?.trim() ?? '';
        expect(firstKbName.length).toBeGreaterThan(0);

        const firstOpenLink = page.getByRole('link', { name: 'Ouvrir', exact: true }).first();
        await Promise.all([
            page.waitForURL(/\/fr\/kb\/[\w-]+$/),
            firstOpenLink.click(),
        ]);
        const navChatLink = page.getByRole('link', { name: 'Chat', exact: true }).first();
        await Promise.all([
            page.waitForURL(/\/fr\/kb\/[\w-]+\/chat$/),
            navChatLink.click(),
        ]);
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('textbox', { name: 'Message' })).toBeEnabled();
        await expect(page.getByRole('heading', { name: 'Nouvelle conversation' })).toBeVisible();

        const modelTrigger = page.getByRole('combobox', { name: 'Modèles disponibles pour le chat' });
        await modelTrigger.click();
        const llamaModelOption = page.getByRole('option', { name: 'llama3.1:8b' }).first();
        await expect(llamaModelOption, 'llama3.1:8b doit être disponible').toBeVisible();
        await llamaModelOption.click();
        await expect(modelTrigger).toHaveText(/llama3\.1:8b/i);

        const messageText = `Conversation de test ${Date.now()}`;
        const messageTextarea = page.getByRole('textbox', { name: 'Message' });
        await messageTextarea.fill(messageText);
        await page.getByRole('button', { name: 'Envoyer' }).click();

        const streamingIndicator = page
            .locator('form')
            .getByText('Réponse en cours…', { exact: true })
            .first();
        await expect(streamingIndicator).toBeVisible();
        await expect(streamingIndicator).toBeHidden({ timeout: 45_000 });

        const firstKbId = new URL(page.url()).pathname.split('/')[3];
        await expect
            .poll(async () => {
                return await page.evaluate(async ({ kbId, expectedTitle }) => {
                    const response = await fetch(`/api/kb/${kbId}/chat/conversations?limit=30`);
                    const payload = (await response.json()) as {
                        conversations?: Array<{ title: string }>;
                    };
                    return payload.conversations?.some((conversation) => conversation.title === expectedTitle) ?? false;
                }, { kbId: firstKbId, expectedTitle: messageText });
            }, { message: 'conversation should be saved in history' })
            .toBeTruthy();

        await expect(page.getByRole('heading', { name: messageText })).toBeVisible({ timeout: 15_000 });

        const reopenChatLink = page.getByRole('link', { name: 'Chat', exact: true }).first();
        await Promise.all([
            page.waitForURL((url) => url.pathname.endsWith('/chat') && !url.searchParams.has('conversation')),
            reopenChatLink.click(),
        ]);
        await page.waitForLoadState('networkidle');
        const resetTextarea = page.getByRole('textbox', { name: 'Message' });
        await expect(resetTextarea).toBeEnabled();
        await expect(resetTextarea).toHaveValue('');
        await expect(page.getByRole('heading', { name: 'Nouvelle conversation' })).toBeVisible();

        const newConversationUrl = new URL(page.url());
        expect(newConversationUrl.search).toBe('');

        expect(consoleErrors.join('\n')).not.toMatch(/Fetch failed loading/i);
    });
});
