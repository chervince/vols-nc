# ADR-0001 — Adoption du harnais 0.4.0 (biome remplace eslint, tsconfig unifié)

- **Status:** Accepted
- **Date:** 2026-07-14
- **Deciders:** Vincent

## Context

Le projet n'avait ni test, ni hook, ni CI de qualité ; eslint était configuré
mais rien ne l'imposait ; deux styles de formatage cohabitaient (src en
simples quotes sans point-virgule, vite.config en doubles quotes). Le harnais
(github.com/chervince/harness, v0.4.0) apporte le contrat, le gate, la grille
de revue et les capteurs.

## Options considered

1. Garder eslint à côté de biome — deux linters, deux vérités, aucun des deux
   ne bloquant.
2. Garder le tsconfig « solution » de vite (references + fichiers app/node) —
   mais le typecheck du gate (`tsc --noEmit -p tsconfig.json`) n'y compile
   **aucun fichier** : un capteur vide qui ment.
3. Adopter pleinement : biome (celui du gate) remplace eslint ; tsconfig
   unifié qui étend `tsconfig.harness.json` (strict + noUncheckedIndexedAccess
   + exactOptionalPropertyTypes) ; reformatage global au standard du harnais.

## Decision

Option 3. En outre : `src/index.css` est exclu du lint/format (biome 2.5.3 ne
parse pas la syntaxe CSS de Tailwind v4 — capteur différé, tenu par revue) ;
perte assumée de `eslint-plugin-react-refresh` (les règles hooks restent
couvertes par `useExhaustiveDependencies` de biome).

## Rationale (lexicographic)

**Cohérence** tranche trois fois : un seul juge de lint (celui que le gate
exécute), un seul style (celui du standard partagé entre tous les projets
harnachés), un seul tsconfig réellement vérifié. **Véracité (G1)** impose le
tsconfig unifié : un typecheck qui ne compile rien était un mensonge du gate.

## Consequences

- Positive : `just gate` juge réellement format, lint, types stricts et tests ;
  les types stricts ont immédiatement attrapé 5 erreurs réelles (accès index
  non vérifiés, `undefined` explicites) et biome 9 défauts d'accessibilité.
- Négative / coût accepté : diff de reformatage massif (mécanique, une fois) ;
  CSS hors capteurs pour l'instant.
- Suivis : ré-inclure le CSS quand biome saura parser Tailwind v4 ; plancher
  de couverture : ADR-0002.
