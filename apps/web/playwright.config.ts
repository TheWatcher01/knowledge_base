import { defineConfig, devices } from '@playwright/test';

const defaultTestKbId = '00000000-0000-4000-8000-000000000000';
const resolvedTestKbId = (process.env.PLAYWRIGHT_TEST_KB_ID ?? defaultTestKbId).trim();
if (!resolvedTestKbId) {
    throw new Error('PLAYWRIGHT_TEST_KB_ID must be defined (or fallback to default) for Playwright runs.');
}

process.env.PLAYWRIGHT_TEST_KB_ID = resolvedTestKbId;

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60_000,
    expect: {
        timeout: 5_000,
    },
    reporter: 'list',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001',
        headless: true,
        ignoreHTTPSErrors: true,
        locale: 'fr-FR',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        video: 'off',
        launchOptions: {
            executablePath: process.env.PLAYWRIGHT_CHROME_PATH ?? '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
        },
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                browserName: 'chromium',
            },
        },
    ],
});
