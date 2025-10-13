import { test as base } from '@playwright/test';
import { enableRagMock, resetRagMockState } from '../../src/lib/rag-mock';

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
        async ({ ragMockDefaults }, use) => {
            if (process.env.E2E_USE_RAG_MOCK === 'false') {
                await use(async () => {});
                return;
            }
            const apply = async (options?: RagMockOptions) => {
                enableRagMock();
                const payload: RagMockOptions = {
                    ...(ragMockDefaults ?? {}),
                    ...(options ?? {}),
                };
                resetRagMockState(payload);
            };

            await apply();
            await use(apply);
        },
        { auto: true },
    ],
});

export const expect = test.expect;

test.beforeEach(async ({ page }) => {
    if (process.env.E2E_USE_RAG_MOCK === 'false') {
        return;
    }
    await page.addInitScript(() => {
        (window as { __RAG_MOCK_ENABLED?: boolean }).__RAG_MOCK_ENABLED = true;
    });
});
