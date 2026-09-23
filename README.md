# alivaon-next

Front public (`www.alivaon.com`) et back-office (`admin.alivaon.com`) d'Alivaon
en Next.js. Le backend reste l'application Symfony (`alivaon-symfony`), exposée
en API.

## Organisation (workspace pnpm)

| Dossier | Contenu | État |
|---|---|---|
| `apps/site` | Site public | à venir (phase 4) |
| `apps/admin` | Back-office | à venir (phase 3) |
| `packages/api-client` | Client typé généré depuis l'OpenAPI de Symfony | à venir (phase 1) |
| `tools/seo-parity` | Relevé SEO de référence et contrôle de parité bloquant | ✅ |
| `tests/seo-baseline` | Relevés versionnés (référence de production) | ✅ |

## Prérequis

- Node.js ≥ 24 (exécute le TypeScript nativement, sans étape de build)
- pnpm 9

```bash
pnpm install
pnpm test        # tests de tous les paquets
pnpm typecheck
```

## SEO : zéro régression

Aucune version du front ne part en production sans passer le contrôle de parité
contre le relevé de référence de la production actuelle. Voir
[docs/seo-parity.md](docs/seo-parity.md).
