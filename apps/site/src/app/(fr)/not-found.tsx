import { NotFoundPage } from '@/components/pages/not-found-page';
import { requestPath } from '@/lib/request';

/** Contenu introuvable sur une route française (notFound()) : 404 dans la langue de la route. */
export default async function NotFound() {
  return <NotFoundPage locale="fr" pathname={await requestPath()} />;
}
