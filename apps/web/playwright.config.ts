import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const defaultTestKbId = '00000000-0000-4000-8000-000000000000';
const resolvedTestKbId = (process.env.PLAYWRIGHT_TEST_KB_ID ?? defaultTestKbId).trim();
if (!resolvedTestKbId) {
    throw new Error('PLAYWRIGHT_TEST_KB_ID must be defined (or fallback to default) for Playwright runs.');
}

process.env.PLAYWRIGHT_TEST_KB_ID = resolvedTestKbId;

const repoRoot = path.resolve(__dirname, '..', '..');
const ragToken = process.env.RAG_API_TOKEN ?? 'ci-token';
const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://kb:kb@localhost:5432/kb';
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';

if (!process.env.E2E_USE_RAG_MOCK) {
    process.env.E2E_USE_RAG_MOCK = 'true';
}

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
    webServer: [
        {
            command: 'pnpm --filter web dev --port 3001',
            cwd: repoRoot,
            env: {
                ...process.env,
                DATABASE_URL: databaseUrl,
                MONGODB_URI: mongoUri,
                MONGODB_DB: process.env.MONGODB_DB ?? 'kbapp',
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'test-nextauth-secret',
                NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'http://localhost:3001',
                RAG_API_BASE: process.env.RAG_API_BASE ?? 'http://localhost:8000',
                RAG_API_TOKEN: ragToken,
                RAG_SYNC_SERVICE_TOKEN: process.env.RAG_SYNC_SERVICE_TOKEN ?? ragToken,
                USE_RAG_MOCK: process.env.USE_RAG_MOCK ?? 'false',
                PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001',
            },
            port: 3001,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'uv run -- uvicorn rag_api.main:app --host 0.0.0.0 --port 8000',
            cwd: path.resolve(repoRoot, 'services', 'rag-api'),
            env: {
                ...process.env,
                RAG_AUTH_TOKEN: ragToken,
                RAG_POSTGRES_DSN: process.env.RAG_POSTGRES_DSN ?? databaseUrl,
                RAG_MONGODB_URI: mongoUri,
                RAG_MONGO_DB: process.env.RAG_MONGO_DB ?? 'kbapp',
                RAG_WEB_BASE_URL: process.env.RAG_WEB_BASE_URL ?? 'http://localhost:3001',
                RAG_SYNC_SERVICE_TOKEN: process.env.RAG_SYNC_SERVICE_TOKEN ?? ragToken,
                RAG_SYNC_INTERVAL_SECONDS: process.env.RAG_SYNC_INTERVAL_SECONDS ?? '0',
                RAG_ENABLE_FALLBACK_EMBEDDINGS: process.env.RAG_ENABLE_FALLBACK_EMBEDDINGS ?? 'true',
            },
            port: 8000,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
