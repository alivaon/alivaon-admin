# Parité SEO — protocole zéro régression

La migration du front Symfony/Twig vers Next.js ne doit entraîner **aucune perte
de référencement**. Ce document décrit comment on le garantit : un relevé de
référence de la production actuelle, puis une comparaison automatique **bloquante**
de chaque version candidate contre ce relevé.

Principe directeur : **migration iso**. Aucun choix SEO existant n'est corrigé
pendant la migration, même contestable (voir « Constats de l'état initial »). Les
améliorations viendront après la bascule, une à la fois, mesurées.

## L'outil : `tools/seo-parity`

| Commande | Rôle |
|---|---|
| `pnpm seo:snapshot --origin <url> --label <nom>` | Relevé complet d'un site dans `tests/seo-baseline/<nom>/` |
| `pnpm seo:lighthouse --label <nom>` | Performance mobile (médiane de 3 runs) par gabarit de page |
| `pnpm seo:compare --baseline <nom> --target <nom>` | Diff ; code de sortie 1 s'il reste un écart bloquant |

### Ce qui est relevé

- **Par page** (HTML brut, sans exécuter le JavaScript — ce que lit un moteur
  avant rendu) : code HTTP, chaîne de redirections complète, en-têtes,
  `<html lang>`, title, toutes les metas (description, robots, Open Graph,
  Twitter), canonical, hreflang (x-default compris), `<link>` de tête, JSON-LD
  normalisé, suite des titres H1–H6, texte visible normalisé, liens (URL, texte
  et rel), images (src + alt, alt absent ≠ alt vide), mode de découverte (lien
  interne, sitemap).
- **Sondes** : slash final (301), `/en/`, http → https, domaine nu → www, casse,
  `/index.php`, 404 par section, contenu dans l'autre langue (doit rester 404 :
  aucun repli), anciennes URLs redirigées, `/admin`, `/login`, pagination hors
  limites.
- **Sitemap** (entrées, alternates, priorités), `robots.txt`, `llms.txt`, favicon.
- **Ressources référencées** (images indexées, og:image, icônes) : doivent rester
  servies en 200 aux mêmes URLs.
- **Performance** : scores Lighthouse et LCP/FCP/TBT/CLS par gabarit.

### Ce qui bloque

Tout écart sur ce qui précède, à l'exception de :

- informatif seulement : `lastmod` du sitemap (date du jour pour les pages
  statiques), `cache-control`/`vary`/noms de cookies, nombre d'occurrences d'un
  même lien, images de fond décoratives, empreinte des fichiers binaires ;
- performance : tolérance de mesure (score −3 pts, LCP/FCP +10 %, TBT +20 % et
  +50 ms, CLS +0,02). Le score SEO Lighthouse, lui, ne peut pas baisser du tout.

**Performance : mesurer la référence et la cible dans la même session.** Les
mesures Lighthouse dépendent du réseau et de la machine : sur les mêmes pages,
le LCP de l'accueil est passé de 6,2 s (23/09) à 14,8 s (24/09) sans aucun
changement du site. Pour le contrôle de bascule, relancer `seo:lighthouse` sur
la production PUIS sur le staging, depuis la même machine, et comparer ces
deux mesures fraîches — jamais une mesure du jour à une mesure archivée.

Un écart légitime (ex. comportement volontairement modifié) ne passe que via
`tools/seo-parity/exceptions.json`, **une entrée par écart, avec son motif**,
validée par le propriétaire du site :

```json
[
  { "url": "https://www.alivaon.com/admin", "field": "probe.admin", "reason": "Admin déplacé sur admin.alivaon.com (301) — validé le JJ/MM/AAAA" }
]
```

### Comparer le staging

Le staging est comparé **avec les URLs du relevé de référence comme graines** (il
est donc interrogé exactement sur les mêmes URLs, plus celles qu'il expose en
propre), et ses URLs sont réécrites vers le domaine de production pour que la
comparaison porte sur le fond :

```bash
SEO_BASIC_AUTH='utilisateur:motdepasse' pnpm seo:snapshot \
  --origin https://www.staging.alivaon.com \
  --rewrite-to https://www.alivaon.com \
  --seeds-from prod-2026-09-24 \
  --label _work/staging
pnpm seo:compare --baseline prod-2026-09-24 --target _work/staging
```

Condition pour que la comparaison ait un sens : le staging tourne sur **une copie
des données de production** (anonymisée).

### Fiabilité du contrôle

Un contrôle bloquant n'a de valeur que s'il est déterministe. Deux relevés
successifs de la production (23/09/2026) donnent **0 écart**, bloquant ou
informatif.

Le relevé est poli (2 requêtes simultanées, 300 ms de pause, ~320 requêtes) et
n'exécute pas de JavaScript : il ne déclenche pas Google Analytics. Lighthouse
bloque les domaines Google Analytics pour la même raison. Seul effet de bord
connu : chaque relevé incrémente de 1 le compteur de vues des articles (comme
une visite de Googlebot).

## Relevés de référence

| Relevé | Contenu |
|---|---|
| `tests/seo-baseline/prod-2026-09-24/` | Production avant toute modification — **référence de la migration** (remplace le relevé du 23/09, enrichi des sources externes) |

Le `README.md` de chaque relevé contient l'audit de l'état initial.

### Sources à ajouter au relevé

Le crawl part du sitemap et suit les liens internes. Deux sources complètent
l'inventaire des URLs connues de Google, à déposer dans
`tools/seo-parity/seeds/` puis à relever de nouveau :

1. **Search Console** : export des pages indexées et des performances par page
   (16 mois).
2. **Logs Traefik** : URLs demandées par Googlebot (voir le runbook remis avec
   la phase −1).

Déjà intégrées (24/09/2026) : Wayback Machine, Common Crawl (8 index), Google
`site:`, emails Search Console (dont `http://alivaon.com/` présent dans les
résultats Google : redirection critique), anciennes routes de l'historique git.
Détail dans `tools/seo-parity/seeds/extra-urls.txt`.

## Constats de l'état initial (reproduits à l'identique pendant la migration)

Relevés le 23/09/2026. À traiter **après** la bascule :

1. `/blog?page=0` renvoie **500** (page d'erreur serveur) ; `?page=abc` → 400 ;
   `?page=999` → 200 (page vide).
2. Pages catégories et tags : **aucun H1**, title et description identiques à
   ceux de `/blog` (20 pages concernées).
3. 16 pages catégories/tags liées depuis la sidebar mais **absentes du sitemap**
   (le sitemap exclut volontairement les taxonomies sans article publié, alors
   que leurs pages répondent 200).
4. `//blog` (double slash) répond 200 au lieu de rediriger.
5. `/en/blog` n'a pas de H1.
6. Performance mobile faible sur tous les gabarits (Lighthouse, médiane de 3
   runs) : score 0,51 à 0,63, LCP de 5,7 s à 23,7 s (portfolio), CLS jusqu'à
   0,22 (`/en`). Détail : `tests/seo-baseline/prod-2026-09-24/lighthouse/summary.json`.
   Le contrôle ne bloque que les régressions : une amélioration est acceptée.
7. Audit Lighthouse SEO `crawlable-anchors` en échec sur toutes les pages (liens
   sans href exploitable, hérités du thème) ; `link-text` en échec sur `/en`.
8. `/favicon.ico` répond 404 (le favicon déclaré est `/build/images/logo/favicon.png`).
9. Les pages légales affichent « Dernière mise à jour : » suivi de la **date du
   jour** (`"now"|date` dans le template) : elles se déclarent modifiées chaque
   jour. L'outil remplace la date du relevé par un marqueur pour rester
   déterministe d'un jour à l'autre.
10. Common Crawl a reçu une **500 sur `/robots.txt`** lors d'un passage en 2026
    (incident passé, aujourd'hui 200).

Seul le point 1 déroge à la parité stricte : reproduire volontairement une
erreur 500 n'a pas de sens. **Décision du 23/09/2026 : exception documentée**
dans `tools/seo-parity/exceptions.json`, le nouveau site renverra 404 sur
`/blog?page=0`.
