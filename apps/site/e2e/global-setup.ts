import { assertNullMailer } from '../../admin/e2e/global-setup';

/**
 * Les formulaires du site écrivent dans la base locale et déclenchent des
 * emails (notification de contact à une adresse réelle) : refus de lancer
 * les tests si Symfony n'utilise pas MAILER_DSN=null://null.
 */
export default async function globalSetup() {
  await assertNullMailer();
}
