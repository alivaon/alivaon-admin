import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

/**
 * Données de test dans la base locale de Symfony (jamais un serveur partagé) :
 * un message, une offre et une candidature, un commentaire en attente.
 * Tout ce qui est créé porte une adresse e2e-…@localhost.test ou un nom
 * « E2E … » et est supprimé au lancement suivant (restes d'un test interrompu).
 *
 * Le serveur Symfony doit tourner avec MAILER_DSN=null://null : changer un
 * statut de candidature ou inviter un utilisateur envoie un email.
 */
const SYMFONY_DIR = resolve(process.env.SYMFONY_DIR ?? `${__dirname}/../../../../alivaon-symfony`);

function sql(query: string) {
  execFileSync('php', ['bin/console', 'dbal:run-sql', '--env=dev', query], { cwd: SYMFONY_DIR, stdio: 'pipe' });
}

export default function globalSetup() {
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
