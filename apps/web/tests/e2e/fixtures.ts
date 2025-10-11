import { test as base } from '@playwright/test';

type RagMockOptions = {
    failModels?: string[];
};

type RagMockFixture = {
    configureRagMock: (options?: RagMockOptions) => Promise<void>;
    ragMockDefaults: RagMockOptions;
};

export const test = base.extend<RagMockFixture>({
    ragMockDefaults: [{}, { option: true }],
    configureRagMock: [
        async ({ request, ragMockDefaults }, use) => {
            const apply = async (options?: RagMockOptions) => {
                const payload: RagMockOptions = {
                    ...(ragMockDefaults ?? {}),
                    ...(options ?? {}),
                };

                await request.post('/api/test/rag-mock/reset', {
                    data: payload,
                });
            };

            await apply();
            await use(apply);
        },
        { auto: true },
    ],
});

export const expect = test.expect;

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        (window as { __RAG_MOCK_ENABLED?: boolean }).__RAG_MOCK_ENABLED = true;
    });
});
