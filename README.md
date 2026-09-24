# alivaon-admin

Back-office d'Alivaon (`www.admin.alivaon.com`) en Next.js. Le backend reste
l'application Symfony (`alivaon-symfony`), exposée en API ; le site public
(`www.alivaon.com`) est dans le dépôt `alivaon-site`.

Anciennement `alivaon-next` (site et back-office), séparé le 24/09/2026.

## Organisation (workspace pnpm)

| Dossier | Contenu | État |
|---|---|---|
| `apps/admin` | Back-office (Next.js 16, Tailwind) | ✅ écrans d'EasyAdmin repris (phase 3) — tests e2e : `apps/admin/e2e` |
| `packages/api-client` | Client typé généré depuis l'OpenAPI de Symfony (copie également présente dans `alivaon-site` : régénérer les deux après une évolution de l'API) | ✅ |
| `docker/Dockerfile` | Image du back-office (`ghcr.io/alivaon/alivaon-next-admin`) | ✅ |

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


### Images Docker

```bash
docker build -f docker/Dockerfile -t alivaon-admin .
```

Serveur standalone sur le port 3000, utilisateur non root, contrôle de santé
`/api/health`.
