import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

/**
 * Données de test dans la base locale de Symfony (jamais un serveur partagé) :
 * un message, une offre et une candidature, un commentaire en attente.
 * Tout ce qui est créé porte une adresse e2e-…@localhost.test ou un nom
 * « E2E … » et est supprimé au lancement suivant (restes d'un test interrompu).
 *
 * Le serveur Symfony doit tourner avec MAILER_DSN=null://null : changer un
 * statut de candidature ou inviter un utilisateur envoie un email, et le
 * .env.local local pointe vers le vrai relais SMTP. Sous macOS, PHP ignore
 * les variables d'environnement (variables_order=GPCS) : il faut lancer
 *   APP_ENV=dev MAILER_DSN=null://null php -d variables_order=EGPCS -S 127.0.0.1:8000 -t public
 * La préparation le vérifie et refuse de lancer les tests sinon.
 */
const SYMFONY_DIR = resolve(process.env.SYMFONY_DIR ?? `${__dirname}/../../../../alivaon-symfony`);

function sql(query: string) {
  execFileSync('php', ['bin/console', 'dbal:run-sql', '--env=dev', query], { cwd: SYMFONY_DIR, stdio: 'pipe' });
}

const SYMFONY_URL = process.env.SYMFONY_DEV_URL ?? 'http://127.0.0.1:8000';

/** Lit, dans le profileur de Symfony, le MAILER_DSN vu par le serveur web. */
export async function assertNullMailer() {
  const head = await fetch(`${SYMFONY_URL}/`, { method: 'HEAD' });
  const token = head.headers.get('x-debug-token');
  if (!token) {
    throw new Error(`Symfony (${SYMFONY_URL}) doit tourner en environnement dev (profileur requis pour vérifier le mailer).`);
  }
  const panel = await (await fetch(`${SYMFONY_URL}/_profiler/${token}?panel=request`)).text();
  // Chaque ligne « MAILER_DSN » des tableaux du panneau (variables serveur et .env).
  const values = panel
    .split('MAILER_DSN</th>')
    .slice(1)
    .map((cell) => cell.slice(0, cell.indexOf('</td>')).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '').replace(/["\s]/g, ''));
  if (values.length === 0 || values.some((value) => value !== 'null://null')) {
    throw new Error(
      'Refus de lancer les tests : le serveur Symfony n\'utilise pas MAILER_DSN=null://null (des emails réels partiraient).\n' +
        'Relancer : APP_ENV=dev MAILER_DSN=null://null php -d variables_order=EGPCS -S 127.0.0.1:8000 -t public',
    );
  }
}

export default async function globalSetup() {
  // Sans ces comptes, le nettoyage ci-dessous supprimerait aussi les deux
  // comptes de test (NOT IN ('undefined', …)).
  const missing = ['E2E_ADMIN', 'E2E_EDITOR', 'E2E_PASSWORD'].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Variables manquantes : ${missing.join(', ')} (comptes de test de la base locale).`);
  }
  await assertNullMailer();

  const e2e = "LIKE 'e2e-%@localhost.test'";
  sql(`DELETE FROM comment WHERE parent_id IN (SELECT id FROM (SELECT id FROM comment WHERE author_email ${e2e}) AS c)`);
  sql(`DELETE FROM comment WHERE author_email ${e2e}`);
  sql(`DELETE FROM contact_message WHERE email ${e2e}`);
  sql(`DELETE FROM candidate_application WHERE email ${e2e}`);
  sql("DELETE t FROM job_offer_translation t JOIN job_offer j ON j.id = t.job_offer_id WHERE j.location = 'E2E-Ville'");
  sql("DELETE FROM job_offer WHERE location = 'E2E-Ville'");
  sql("DELETE FROM tag WHERE id IN (SELECT tag_id FROM (SELECT tag_id FROM tag_translation WHERE name LIKE 'E2E %') AS t)");
  sql("DELETE FROM article WHERE id IN (SELECT article_id FROM (SELECT article_id FROM article_translation WHERE title LIKE 'E2E %') AS t)");
  sql("DELETE FROM testimonial WHERE client_name LIKE 'E2E %'");
  sql(`DELETE FROM user WHERE email ${e2e} AND email NOT IN ('${process.env.E2E_ADMIN}', '${process.env.E2E_EDITOR}')`);

  sql(
    "INSERT INTO contact_message (name, email, subject, message, phone, service, is_read, created_at) VALUES ('E2E Contact', 'e2e-contact@localhost.test', 'Sujet E2E', 'Bonjour,\nceci est un message de test.', '0600000000', 'Développement web', 0, NOW())",
  );
  sql("INSERT INTO job_offer (contract_type, location, is_published, created_at) VALUES ('CDI', 'E2E-Ville', 0, NOW())");
  sql(
    "INSERT INTO job_offer_translation (title, slug, description, locale, is_published, updated_at, job_offer_id) SELECT 'Offre E2E', 'offre-e2e', 'Description', 'fr', 0, NOW(), id FROM job_offer WHERE location = 'E2E-Ville'",
  );
  sql(
    "INSERT INTO candidate_application (first_name, last_name, email, city, country, motivation, status, created_at, job_offer_id) SELECT 'E2E', 'Candidat', 'e2e-candidat@localhost.test', 'Lyon', 'France', 'Motivation de test.', 'reçue', NOW(), id FROM job_offer WHERE location = 'E2E-Ville'",
  );
  sql(
    "INSERT INTO comment (author_name, author_email, content, is_approved, created_at, article_id) SELECT 'E2E Lecteur', 'e2e-comment@localhost.test', 'Commentaire de test E2E.', 0, NOW(), MIN(id) FROM article",
  );
}
