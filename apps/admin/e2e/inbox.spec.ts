import { expect, test } from '@playwright/test';
import { ADMIN, EDITOR, login } from './helpers';

test.describe.configure({ mode: 'serial' });

test('messages : filtre, fiche, lu / non lu, suppression réservée à l’admin', async ({ page }) => {
  await login(page, EDITOR, '/messages');
  await page.getByLabel('Statut de lecture').selectOption('false');
  await expect(page).toHaveURL(/isRead=false/);
  await page.getByRole('searchbox').fill('E2E Contact');
  await expect(page).toHaveURL(/search=E2E/);
  await page.getByRole('link', { name: 'E2E Contact' }).click();

  await expect(page.getByRole('heading', { name: 'Sujet E2E' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Supprimer' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Marquer comme lu' }).click();
  await expect(page.getByText('Message marqué comme lu.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Marquer comme non lu' })).toBeVisible();

  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await login(page, ADMIN, '/messages?search=E2E');
  await page.getByRole('link', { name: 'E2E Contact' }).click();
  await page.screenshot({ path: 'e2e/screenshots/message.png', fullPage: true });
  await page.getByRole('button', { name: 'Supprimer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
  await expect(page).toHaveURL('/messages');
  await expect(page.getByText('Message supprimé.')).toBeVisible();
});

test('candidatures : filtre par offre, statut avec confirmation (email), export', async ({ page }) => {
  await login(page, EDITOR, '/candidatures');
  await expect(page.getByRole('link', { name: 'Exporter (CSV)' })).toHaveAttribute('href', '/api/admin/candidate-applications/export');
  await page.getByLabel('Offre').selectOption({ label: 'Offre E2E' });
  await expect(page.getByRole('row')).toHaveCount(2);
  await page.getByRole('link', { name: 'E2E Candidat' }).click();

  await expect(page.getByRole('heading', { name: 'E2E Candidat' })).toBeVisible();
  await page.getByLabel('Nouveau statut').selectOption('entretien');
  await page.getByRole('button', { name: 'Changer le statut' }).click();
  await expect(page.getByRole('dialog')).toContainText('e2e-candidat@localhost.test');
  await page.getByRole('button', { name: 'Changer et prévenir' }).click();
  await expect(page.getByText('Statut mis à jour, le candidat a été prévenu par email.')).toBeVisible();
  await expect(page.locator('[data-slot=badge]', { hasText: 'Entretien' })).toBeVisible();
  await page.screenshot({ path: 'e2e/screenshots/candidature.png', fullPage: true });

  const csv = await page.request.get('/api/admin/candidate-applications/export');
  expect(csv.ok()).toBe(true);
  expect(await csv.text()).toContain('e2e-candidat@localhost.test');
});

test('commentaires : approbation, réponse de l’équipe (admin uniquement)', async ({ page }) => {
  await login(page, EDITOR, '/commentaires?isApproved=false');
  const row = page.getByRole('row').filter({ hasText: 'E2E Lecteur' });
  await expect(row).toBeVisible();
  await expect(row.getByRole('button', { name: 'Répondre' })).toHaveCount(0);
  await row.getByRole('button', { name: 'Approuver' }).click();
  await expect(page.getByText('Commentaire approuvé.')).toBeVisible();

  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await login(page, ADMIN, '/commentaires?isApproved=true');
  const approved = page.getByRole('row').filter({ hasText: 'E2E Lecteur' });
  await approved.getByRole('button', { name: 'Répondre' }).click();
  await page.getByLabel('Réponse').fill('Merci pour votre commentaire !');
  await page.getByRole('button', { name: 'Publier la réponse' }).click();
  await expect(page.getByText('Réponse publiée.')).toBeVisible();
  await expect(approved).toContainText('1 réponse');
  await page.screenshot({ path: 'e2e/screenshots/commentaires.png', fullPage: true });
});

test('utilisateurs : invitation, renvoi, erreurs de validation, suppression', async ({ page }) => {
  await login(page, ADMIN, '/utilisateurs');
  await page.getByRole('link', { name: 'Inviter un utilisateur' }).click();
  await page.getByLabel('Email').fill(ADMIN);
  await page.getByRole('button', { name: "Envoyer l'invitation" }).click();
  await expect(page.locator('p.text-destructive')).toBeVisible();

  const email = `e2e-invite-${Date.now()}@localhost.test`;
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Nom complet').fill('E2E Invité');
  await page.getByRole('button', { name: "Envoyer l'invitation" }).click();
  await expect(page.getByText(`Invitation envoyée à ${email}.`)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'E2E Invité' })).toBeVisible();
  await expect(page.getByText(/Invitation en attente/)).toBeVisible();

  await page.getByRole('button', { name: "Renvoyer l'invitation" }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Renvoyer' }).click();
  await expect(page.getByText('Invitation renvoyée.')).toBeVisible();

  await page.getByLabel('Nouveau mot de passe').fill('court');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText(/au moins 12 caractères/)).toBeVisible();
  await page.screenshot({ path: 'e2e/screenshots/utilisateur.png', fullPage: true });

  await page.getByRole('button', { name: 'Supprimer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
  await expect(page).toHaveURL('/utilisateurs');
  await expect(page.getByText(email)).toHaveCount(0);
});

test('utilisateurs : écran refusé à un éditeur', async ({ page }) => {
  await login(page, EDITOR, '/utilisateurs');
  await expect(page.getByText('Accès réservé aux administrateurs.')).toBeVisible();
});

test('profil : confirmation du mot de passe et enregistrement', async ({ page }) => {
  await login(page, EDITOR, '/profil');
  const name = page.getByLabel('Nom complet');
  const original = await name.inputValue();
  await page.getByLabel('Nouveau mot de passe').fill('un-mot-de-passe-long');
  await page.getByLabel('Confirmation du mot de passe').fill('autre-chose-encore');
  await expect(page.getByText('Les mots de passe ne correspondent pas.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
  await page.getByLabel('Nouveau mot de passe').fill('');

  await name.fill('Éditeur E2E modifié');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Profil enregistré.')).toBeVisible();
  await name.fill(original);
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Profil enregistré.').first()).toBeVisible();
});
