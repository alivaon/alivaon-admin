import { defineConfig } from '@playwright/test';

/**
 * Parcours de bout en bout de l'admin, contre des serveurs déjà lancés :
 * Symfony local (http://127.0.0.1:8000) et `next dev -p 3001`.
 * Comptes : E2E_ADMIN, E2E_EDITOR, E2E_PASSWORD (base locale uniquement).
 * Symfony lancé avec MAILER_DSN=null://null (voir e2e/global-setup.ts).
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 30_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3001',
    channel: 'chrome',
    headless: true,
    screenshot: 'only-on-failure',
  },
});
