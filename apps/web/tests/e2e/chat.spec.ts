import { expect, test } from './fixtures';

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@kb.local';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Playwright!23';

async function login(page: import('@playwright/test').Page) {
    await page.goto('/fr/login');
    await page.getByPlaceholder('Adresse e-mail').fill(DEMO_EMAIL);
    await page.getByPlaceholder('Mot de passe').fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    const useRealRag = process.env.USE_RAG_MOCK !== 'true';
    if (useRealRag) {
        await page.waitForURL('**/fr/dashboard');
    } else {
        await page.waitForURL('**/fr/kb');
        await expect(page.getByRole('heading', { name: 'Bases de connaissance', level: 1 })).toBeVisible();
    }
}

test.describe('Chat des bases de connaissance', () => {
    test('démarre une nouvelle conversation pour chaque base sélectionnée', async ({ page, configureRagMock }) => {
        const consoleErrors: string[] = [];
        page.on('console', (message) => {
            if (message.type() === 'error') {
                consoleErrors.push(message.text());
            }
        });

        await configureRagMock();

        await login(page);

        await page.goto('/fr/kb');
        await expect(page.getByRole('heading', { level: 1, name: 'Bases de connaissance' })).toBeVisible();
        await expect(page.locator('[data-testid="rag-status-banner"]')).toHaveCount(0);
        const firstKbHeading = page.getByRole('heading', { level: 2 }).first();
        const firstKbName = (await firstKbHeading.textContent())?.trim() ?? '';
        expect(firstKbName.length).toBeGreaterThan(0);

        const firstOpenLink = page.getByRole('link', { name: 'Ouvrir', exact: true }).first();
        await Promise.all([
            page.waitForURL(/\/fr\/kb\/[\w-]+$/),
            firstOpenLink.click(),
        ]);
        const navChatLink = page.getByRole('link', { name: /^Chat\b/i }).first();
        await expect(navChatLink).toBeVisible({ timeout: 15_000 });
        await Promise.all([
            page.waitForURL(/\/fr\/kb\/[\w-]+\/chat(\?.*)?$/, { timeout: 30_000 }),
            navChatLink.click(),
        ]);
        await page.waitForLoadState('networkidle');

        const settingsButton = page.getByTestId('chat-settings-button');
        await expect(settingsButton).toBeVisible({ timeout: 10_000 });
        await settingsButton.click();

        const settingsDialog = page.getByTestId('chat-settings-dialog');
        await expect(settingsDialog).toBeVisible();

        const dialogModelCombobox = settingsDialog.getByRole('combobox', {
            name: 'Modèles disponibles pour le chat',
        });

        if (await dialogModelCombobox.count()) {
            const modelTrigger = dialogModelCombobox.first();
            await modelTrigger.click();
            const llamaModelOption = page.getByRole('option', { name: 'llama3.1:8b' }).first();
            await expect(llamaModelOption, 'llama3.1:8b doit être disponible').toBeVisible();
            await llamaModelOption.click();
            await expect(modelTrigger).toHaveText(/llama3\.1:8b/i);
        } else {
            const modelInput = settingsDialog.getByLabel('Modèles disponibles pour le chat');
            await expect(modelInput).toBeVisible();
            await modelInput.fill('llama3.1:8b');
            await modelInput.blur();
        }

        const closeSettingsButton = page.getByTestId('chat-settings-close');
        await closeSettingsButton.click();
        await expect(settingsDialog).not.toBeVisible();

        const messageTextarea = page.getByRole('textbox', { name: 'Message' });
        await expect(messageTextarea, 'le champ message doit être activé une fois le modèle renseigné').toBeEnabled({ timeout: 10_000 });
        await expect(page.getByRole('heading', { name: 'Nouvelle conversation' })).toBeVisible();

        const messageText = `Conversation de test ${Date.now()}`;
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

        await expect(page.locator('a[href*="/chat?conversation="]').filter({ hasText: messageText }).first())
            .toBeVisible({ timeout: 15_000 });

        const reopenChatLink = page.getByRole('link', { name: /^Chat\b/i }).first();
        await Promise.all([
            page.waitForURL((url) => url.pathname.endsWith('/chat') && !url.searchParams.has('conversation')),
            reopenChatLink.click(),
        ]);
        await page.waitForLoadState('networkidle');
        const resetTextarea = page.getByRole('textbox', { name: 'Message' });
        await expect(resetTextarea).toBeEnabled();
        await expect(resetTextarea).toHaveValue('');
        await page.waitForSelector('[data-testid="chat-conversation-title"]', { timeout: 10_000 });
        await expect(page.getByTestId('chat-conversation-title')).toHaveText('Nouvelle conversation', {
            timeout: 10_000,
        });

        const newConversationUrl = new URL(page.url());
        expect(newConversationUrl.search).toBe('');

        // Navigation dans l'historique : cliquer rapidement sur plusieurs conversations et vérifier que chaque vue se charge.
        const conversationLinks = await page.locator('a[href*="/chat?conversation="]');
        const conversationData = await conversationLinks.evaluateAll((elements) =>
            elements.map((element) => {
                const href = element.getAttribute('href') ?? '';
                const title = (element.textContent ?? '').split('\n')[0].trim();
                return { href, title };
            }),
        );

        expect(conversationData.length, 'au moins une conversation seedée').toBeGreaterThan(0);

        const maxIterations = Math.min(conversationData.length, 5);
        for (let index = 0; index < maxIterations; index += 1) {
            const { href, title } = conversationData[index];
            const conversationId = new URL(href, 'http://localhost:3001').searchParams.get('conversation');
            expect(conversationId, `conversation id manquant pour le lien ${href}`).toBeTruthy();
            const escapedHref = href.replace(/(["\\])/g, '\\$1');

            await Promise.all([
                page.waitForURL((url) => url.searchParams.get('conversation') === conversationId, {
                    timeout: 25_000,
                }),
                page.locator(`a[href="${escapedHref}"]`).first().click(),
            ]);

            await expect(page.getByTestId('chat-conversation-title')).toContainText(title, {
                timeout: 10_000,
            });
        }

        expect(consoleErrors.join('\n')).not.toMatch(/Fetch failed loading/i);
    });
});
