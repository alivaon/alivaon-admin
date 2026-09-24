import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { ADMIN, EDITOR, login } from './helpers';

test.describe.configure({ mode: 'serial' });

const TYPES: [slug: string, endpoint: string][] = [
  ['articles', '/api/admin/articles'],
  ['auteurs', '/api/admin/authors'],
  ['categories', '/api/admin/categories'],
  ['tags', '/api/admin/tags'],
  ['projets', '/api/admin/projects'],
  ['categories-projet', '/api/admin/project-categories'],
  ['services', '/api/admin/services'],
  ['equipe', '/api/admin/team-members'],
  ['temoignages', '/api/admin/testimonials'],
  ['faq', '/api/admin/faqs'],
  ['offres', '/api/admin/job-offers'],
];

const JSONLD = { headers: { Accept: 'application/ld+json' } };

async function getJson(request: APIRequestContext, url: string) {
  const response = await request.get(url, JSONLD);
  expect(response.ok(), url).toBe(true);
  return response.json();
}

type Item = Record<string, unknown> & { translations: Record<string, Record<string, unknown>> };

/**
 * Contenu sans les champs recalculés à chaque écriture. Une langue absente
 * avant l'enregistrement peut apparaître en brouillon vide : Symfony complète
 * toujours les langues manquantes (TranslationInitializer), comme EasyAdmin.
 */
function comparable(item: Item, reference: Item) {
  const withoutUpdatedAt = (values: Record<string, unknown>) => Object.fromEntries(Object.entries(values).filter(([key]) => key !== 'updatedAt'));
  const translations = Object.fromEntries(
    Object.entries(item.translations)
      .filter(([locale]) => locale in reference.translations)
      .map(([locale, t]) => [locale, withoutUpdatedAt(t)]),
  );
  return { ...withoutUpdatedAt(item), translations };
}

async function save(page: Page, message: RegExp | string) {
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText(message).first()).toBeVisible();
}

test('enregistrer une fiche sans la modifier ne change aucune donnée (11 types)', async ({ page }) => {
  test.setTimeout(120_000);
  await login(page, ADMIN);
  for (const [slug, endpoint] of TYPES) {
    const list = await getJson(page.request, `${endpoint}?itemsPerPage=1`);
    if (list.member.length === 0) {
      continue;
    }
    const id = list.member[0].id;
    const before = await getJson(page.request, `${endpoint}/${id}`);

    await page.goto(`/${slug}/${id}`);
    await expect(page.getByRole('button', { name: 'Enregistrer' })).toBeVisible();
    await save(page, /enregistrée?\./);

    const after = await getJson(page.request, `${endpoint}/${id}`);
    expect(comparable(after, before), `${slug} #${id}`).toEqual(comparable(before, before));
    for (const [locale, translation] of Object.entries(after.translations as Item['translations'])) {
      if (!(locale in before.translations)) {
        expect(translation.isPublished, `${slug} #${id} ${locale}`).toBe(false);
      }
    }
  }
});

test('tag : slug dérivé du nom, publication, avertissement sur un slug publié, suppression', async ({ page }) => {
  await login(page, EDITOR, '/tags');
  await page.getByRole('link', { name: 'Nouveau tag' }).click();
  const suffix = Date.now();
  await page.getByLabel('Nom *').fill(`E2E Tag Été ${suffix}`);
  await expect(page.getByLabel('Slug')).toHaveValue(`e2e-tag-ete-${suffix}`);
  await page.getByRole('switch', { name: 'Traduction publiée (FR)' }).click();
  await save(page, 'Tag créé.');
  await expect(page).toHaveURL(/\/tags\/\d+$/);
  await expect(page.getByRole('heading', { name: `E2E Tag Été ${suffix}` })).toBeVisible();

  // Publiée : le slug ne suit plus le nom, et le modifier avertit.
  await page.getByLabel('Nom *').fill(`E2E Tag renommé ${suffix}`);
  await expect(page.getByLabel('Slug')).toHaveValue(`e2e-tag-ete-${suffix}`);
  await page.getByLabel('Slug').fill(`autre-${suffix}`);
  await expect(page.getByRole('alert').filter({ hasText: 'casse l’URL indexée' })).toBeVisible();
  await page.getByLabel('Slug').fill(`e2e-tag-ete-${suffix}`);
  await expect(page.getByRole('alert').filter({ hasText: 'casse l’URL indexée' })).toHaveCount(0);

  // EN : brouillon, slug dérivé du nom anglais.
  await page.getByRole('tab', { name: /^EN/ }).click();
  const en = page.getByRole('tabpanel', { name: /^EN/ });
  await en.getByLabel('Nom *').fill(`E2E Summer tag ${suffix}`);
  await expect(en.getByLabel('Slug')).toHaveValue(`e2e-summer-tag-${suffix}`);
  await save(page, 'Tag enregistré.');

  await page.getByRole('button', { name: 'Supprimer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
  await expect(page).toHaveURL('/tags');
  await expect(page.getByText('Tag supprimé.')).toBeVisible();
});

test('article : erreurs signalées sur l’onglet, éditeur riche, relations, création et suppression', async ({ page }) => {
  await login(page, ADMIN, '/articles/nouveau');
  const title = `E2E Article ${Date.now()}`;
  await page.getByLabel('Titre *').fill(title);
  await page.getByRole('button', { name: 'Enregistrer' }).click();

  // Auteur obligatoire : erreur sur l'onglet « Informations générales ».
  const general = page.getByRole('tab', { name: /Informations générales/ });
  await expect(general.getByTitle('Cet onglet contient des erreurs')).toBeVisible();
  await general.click();
  await expect(page.getByText('Ce champ est obligatoire.')).toBeVisible();
  await page.getByLabel('Auteur *').selectOption({ index: 1 });
  await page.getByLabel('Catégorie').selectOption({ index: 1 });
  await page.locator('#main-tags').getByRole('checkbox').first().click();

  await page.getByRole('tab', { name: 'Contenu (FR / EN)' }).click();
  const editor = page.locator('.ck-editor__editable');
  await editor.click();
  await page.keyboard.type('Premier paragraphe écrit par le test.');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Second paragraphe.');
  await page.screenshot({ path: 'e2e/screenshots/article-form.png', fullPage: true });
  await save(page, 'Article créé.');
  await expect(page).toHaveURL(/\/articles\/\d+$/);

  const id = page.url().split('/').pop();
  const saved = await getJson(page.request, `/api/admin/articles/${id}`);
  expect(saved.translations.fr.content).toBe('<p>Premier paragraphe écrit par le test.</p><p>Second paragraphe.</p>');
  expect(saved.translations.fr.slug).toMatch(/^e2e-article-\d+$/);
  expect(saved.author).not.toBeNull();
  expect(saved.tags).toHaveLength(1);
  expect(saved.translations.en.isPublished).toBe(false);

  await page.getByRole('button', { name: 'Supprimer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
  await expect(page).toHaveURL('/articles');
});

test('témoignage : envoi d’une image, aperçu, enregistrement', async ({ page }) => {
  await login(page, EDITOR, '/temoignages/nouveau');
  await page.getByLabel('Témoignage *').fill('Un excellent partenaire, à l’écoute.');
  await page.getByRole('tab', { name: 'Informations générales' }).click();
  await page.getByLabel('Nom client *').fill('E2E Client');
  // PNG 1×1 valide.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
  await page.locator('#main-avatarName').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('img[src^="/uploads/testimonials/"]')).toBeVisible();
  await save(page, 'Témoignage créé.');
  await expect(page).toHaveURL(/\/temoignages\/\d+$/);

  const id = page.url().split('/').pop();
  const saved = await getJson(page.request, `/api/admin/testimonials/${id}`);
  expect(saved.avatarName).toMatch(/\.png$/);
  expect(saved.rating).toBe(5);

  await page.getByRole('button', { name: 'Supprimer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
  await expect(page).toHaveURL('/temoignages');
});

test('listes : filtres booléens et recherche dans l’URL', async ({ page }) => {
  await login(page, EDITOR, '/projets');
  await page.getByLabel('Publication').selectOption('true');
  await expect(page).toHaveURL(/isActive=true/);
  await page.getByRole('searchbox').fill('zzz-aucun-resultat');
  await expect(page.getByText('Aucun élément.')).toBeVisible();
  await page.screenshot({ path: 'e2e/screenshots/projets-vide.png' });
});
