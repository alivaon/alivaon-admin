import { SiteDocument } from '@/components/layout/site-document';
import { NotFoundPage } from '@/components/pages/not-found-page';
import { requestPath } from '@/lib/request';

/**
 * URL ne correspondant à aucune route : comme Symfony, 404 en français, y
 * compris sous /en (la locale n'est connue que d'une route reconnue).
 */
export default async function GlobalNotFound() {
  return (
    <SiteDocument locale="fr">
      <NotFoundPage locale="fr" pathname={await requestPath()} />
    </SiteDocument>
  );
}
