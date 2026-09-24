# alivaon-next

Front public (`www.alivaon.com`) et back-office (`www.admin.alivaon.com`) d'Alivaon
en Next.js. Le backend reste l'application Symfony (`alivaon-symfony`), exposée
en API.

## Organisation (workspace pnpm)

| Dossier | Contenu | État |
|---|---|---|
| `apps/site` | Site public (Next.js 16) | socle ✅ — pages en phase 4 |
| `apps/admin` | Back-office (Next.js 16, Tailwind) | ✅ écrans d'EasyAdmin repris (phase 3) — tests e2e : `apps/admin/e2e` |
| `packages/api-client` | Client typé généré depuis l'OpenAPI de Symfony | ✅ |
| `docker/Dockerfile` | Image d'une application (`--build-arg APP=site\|admin`) | ✅ |
| `tools/seo-parity` | Relevé SEO de référence et contrôle de parité bloquant | ✅ |
| `tests/seo-baseline` | Relevés versionnés (référence de production) | ✅ |

## Prérequis

- Node.js ≥ 24 (exécute le TypeScript nativement, sans étape de build)
- pnpm 9

```bash
pnpm install
pnpm test        # tests de tous les paquets
pnpm typecheck
pnpm lint
pnpm build
```

### Client de l'API

`packages/api-client/openapi.json` est l'export de l'API Symfony
(`php bin/console api:openapi:export` dans alivaon-symfony). Après une
évolution de l'API : remplacer ce fichier puis `pnpm api:generate`. La CI
échoue si les types ne correspondent plus au fichier.

Appels depuis le serveur Next.js : adresse interne de Symfony + `publicOrigin`
(transmis en `X-Forwarded-Host`) pour que les URLs absolues renvoyées
(canonical, hreflang) portent le domaine public.

### Régénération des pages

`apps/site` expose `POST /api/revalidate` (réseau interne uniquement), appelé
par Symfony après chaque modification de contenu avec le secret
`NEXT_REVALIDATE_SECRET`. Les tags acceptés (`src/lib/cache-tags.ts`) sont ceux
de `App\Revalidation\RevalidationTags`.

### Images Docker

```bash
docker build -f docker/Dockerfile --build-arg APP=site  -t alivaon-site  .
docker build -f docker/Dockerfile --build-arg APP=admin -t alivaon-admin .
```

Serveur standalone sur le port 3000, utilisateur non root, contrôle de santé
`/api/health`.

## SEO : zéro régression

Aucune version du front ne part en production sans passer le contrôle de parité
contre le relevé de référence de la production actuelle. Voir
[docs/seo-parity.md](docs/seo-parity.md).
