import { expect, type Page } from '@playwright/test';

export const ADMIN = process.env.E2E_ADMIN ?? '';
export const EDITOR = process.env.E2E_EDITOR ?? '';
export const PASSWORD = process.env.E2E_PASSWORD ?? '';

export async function login(page: Page, email: string, next = '/') {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(next);
}
