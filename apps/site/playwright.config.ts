import { defineConfig } from '@playwright/test';

/**
 * Parcours de bout en bout du site public, contre des serveurs déjà lancés :
 * Symfony local (http://127.0.0.1:8000, MAILER_DSN=null://null, voir
 * ../admin/e2e/global-setup.ts) et `next dev -p 3000` avec SYMFONY_PROXY_URL.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 60_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000',
    channel: 'chrome',
    headless: true,
    screenshot: 'only-on-failure',
  },
});
