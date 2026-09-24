import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { isCacheTag } from '@/lib/cache-tags';

/**
 * Appelé par Symfony (App\Revalidation\FrontendRevalidator) sur le réseau
 * Docker interne après chaque modification de contenu :
 * POST { "tags": ["articles", …] }, en-tête X-Revalidate-Secret.
 *
 * Non exposé publiquement (Traefik route /api/* vers Symfony) ; le secret
 * reste obligatoire en défense en profondeur.
 */
export const dynamic = 'force-dynamic';

function authorized(request: Request): boolean {
  const expected = process.env.NEXT_REVALIDATE_SECRET ?? '';
  const given = request.headers.get('x-revalidate-secret') ?? '';
  if (expected === '' || given.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const tags = (body as { tags?: unknown }).tags;
  if (!Array.isArray(tags) || tags.length === 0 || !tags.every(isCacheTag)) {
    return Response.json({ error: 'Tags invalides.' }, { status: 400 });
  }

  // 'max' : pages servies depuis le cache pendant leur régénération (pas de
  // latence pour le visiteur), recommandé par Next.js 16.
  for (const tag of tags) {
    revalidateTag(tag, 'max');
  }

  return Response.json({ revalidated: tags });
}
