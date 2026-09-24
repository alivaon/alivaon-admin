import { expect, test, type Page } from '@playwright/test';

/** Erreurs du navigateur, hors rechargement à chaud du serveur de développement. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/hmr|websocket|Failed to load resource/i.test(m.text())) errors.push(m.text().split('\n')[0]);
  });
  return errors;
}

// Un gabarit par ligne : l'hydratation de React ne doit jamais échouer (sinon
// React reconstruit la page et les effets du thème jQuery sont perdus).
const PAGES = [
  '/',
  '/en',
  '/about',
  '/services',
  '/services/creation-site-web-douala',
  '/portfolio',
  '/team',
  '/faq',
  '/contact',
  '/blog',
  '/blog?page=2',
  '/blog/combien-coute-une-application-mobile-au-cameroun-en-2026',
  '/carrieres',
  '/mentions-legales',
  '/politique-de-confidentialite',
  '/en/about',
];

for (const path of PAGES) {
  test(`hydratation sans erreur et thème initialisé : ${path}`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await page.waitForTimeout(800);
    // Scripts du thème chargés après l'hydratation (jQuery, WOW…).
    expect(await page.evaluate(() => typeof (window as unknown as { jQuery?: unknown }).jQuery)).toBe('function');
    expect(errors).toEqual([]);
  });
}

test('404 : française pour une URL inconnue, même sous /en ; langue de la route pour un contenu absent', async ({ page }) => {
  // URL inconnue : 404 complète dès le HTML (global-not-found). Contenu absent
  // (notFound() d'une fiche) : 404 rendue par React au chargement (voir docs).
  for (const [path, lang] of [
    ['/xyz-inconnu', 'fr'],
    ['/en/xyz-inconnu', 'fr'],
    ['/en/blog/slug-inconnu', 'en'],
    ['/blog/slug-inconnu', 'fr'],
    ['/en/services/slug-inconnu', 'en'],
  ]) {
    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response?.status(), path).toBe(404);
    await expect(page.locator('html'), path).toHaveAttribute('lang', lang);
    await expect(page.locator('.error__title'), path).toBeAttached();
  }
});

test('redirections 301 de Symfony : slash final, /en/, ancienne URL', async ({ request }) => {
  for (const [path, target] of [
    ['/about/', '/about'],
    ['/en/', '/en'],
    ['/blog/?page=2', '/blog?page=2'],
    ['/blog/logiciel-de-gestion-d-entreprise-au-cameroun-le-guide-complet-pour-bien-choisir-en-2026', '/blog/logiciel-de-gestion-entreprise-cameroun-guide-complet-pour-bien-choisir'],
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(301);
    // Next rend Location relatif sur le même hôte (Symfony : absolu) ; même destination.
    const location = new URL(response.headers().location, 'http://base');
    expect(location.pathname + location.search, path).toBe(target);
  }
  // Slash final sur une URL inconnue : pas de redirection.
  expect((await request.get('/xyz-inconnu/', { maxRedirects: 0 })).status()).toBe(404);
});

test('?page= invalide : 400 (non entier) ; carrières : entier ≤ 0 accepté', async ({ request }) => {
  expect((await request.get('/blog?page=abc')).status()).toBe(400);
  expect((await request.get('/portfolio?page=1.5')).status()).toBe(400);
  expect((await request.get('/carrieres?page=x')).status()).toBe(400);
  expect((await request.get('/carrieres?page=0')).status()).toBe(200);
});

test('contact : erreurs par champ, suggestions de sujet, envoi', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/contact', { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.getElementById('contact-form') as HTMLFormElement).requestSubmit());
  await expect(page.locator('#contact-form .ajax-form-error').first()).toBeAttached();
  await page.evaluate(() => {
    (document.querySelector('[name="name"]') as HTMLInputElement).value = 'E2E Contact Site';
    (document.querySelector('[name="email"]') as HTMLInputElement).value = 'e2e-contact@localhost.test';
    (document.querySelector('[name="message"]') as HTMLTextAreaElement).value = 'Message envoyé par les tests du site.';
    (document.getElementById('contact-form') as HTMLFormElement).requestSubmit();
  });
  await expect(page.locator('.ajax-contact-success')).toBeAttached();
  expect(errors).toEqual([]);
});

test('article : commentaire (erreurs puis envoi, une seule requête) et vue signalée à l’API', async ({ page }) => {
  let commentPosts = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().endsWith('/comments')) commentPosts++;
  });
  const views = page.waitForRequest((r) => r.method() === 'POST' && r.url().endsWith('/views'));
  await page.goto('/blog/combien-coute-une-application-mobile-au-cameroun-en-2026', { waitUntil: 'networkidle' });
  expect((await views).url()).toContain('/api/public/fr/articles/combien-coute-une-application-mobile-au-cameroun-en-2026/views');
  const submit = () => page.evaluate(() => (document.querySelector('#comment-form form') as HTMLFormElement).requestSubmit());
  await submit();
  await expect(page.locator('#comment-form .ajax-form-error').first()).toBeAttached();
  await page.evaluate(() => {
    (document.getElementById('comment_authorName') as HTMLInputElement).value = 'E2E Lecteur';
    (document.getElementById('comment_authorEmail') as HTMLInputElement).value = 'e2e-comment@localhost.test';
    (document.getElementById('comment_content') as HTMLTextAreaElement).value = 'Commentaire envoyé par les tests du site.';
  });
  await submit();
  await expect(page.locator('.ajax-comment-success')).toBeAttached();
  // Formulaire initialisé une seule fois (pas de double envoi) : 2 soumissions → 2 requêtes.
  expect(commentPosts).toBe(2);
});
