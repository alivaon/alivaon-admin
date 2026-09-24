import { expect, test } from '@playwright/test';
import { ADMIN, EDITOR, login } from './helpers';

test('sans session, renvoi vers la connexion en gardant la page demandée', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login\?next=%2F$/);
});

test('mauvais mot de passe : message d’erreur, pas de session', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN);
  await page.getByLabel('Mot de passe').fill('mauvais-mot-de-passe');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('administrateur : tableau de bord et menu complet', async ({ page }) => {
  await login(page, ADMIN);
  await expect(page.getByRole('heading', { name: "Vue d'ensemble" })).toBeVisible();
  await expect(page.getByText('Articles publiés', { exact: true })).toBeVisible();
  await expect(page.getByText('Traductions (EN) à faire')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Utilisateurs' })).toBeVisible();
  await page.screenshot({ path: 'e2e/screenshots/dashboard-admin.png', fullPage: true });
});

test('éditeur : pas d’accès au menu Utilisateurs', async ({ page }) => {
  await login(page, EDITOR);
  await expect(page.getByRole('heading', { name: "Vue d'ensemble" })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Utilisateurs' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Mon profil' })).toBeVisible();
});

test('déconnexion : retour à la connexion, session fermée', async ({ page }) => {
  await login(page, ADMIN);
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/');
  await expect(page).toHaveURL(/\/login\?next=%2F$/);
});
