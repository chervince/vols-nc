# ADR-0002 — Plancher de couverture initial : la mesure, pas le vœu

- **Status:** Accepted
- **Date:** 2026-07-14
- **Deciders:** Vincent

## Context

La base du harnais fixe le plancher à 80 % — intenable sur un projet adopté
sans aucun test. Un plancher qu'on n'atteint pas serait contourné ou ignoré :
un capteur rouge en permanence ne capte plus rien.

Mesure à l'adoption (couverture sur tout `src/`, premiers tests des
formatters inclus) : **13,26 % lignes / 5,4 % branches / 16,66 % fonctions /
13,82 % instructions**.

## Options considered

1. Garder 80 % — gate rouge permanent, donc mort.
2. Pas de plancher — la couverture ne peut plus que régresser en silence.
3. Plancher calé sur la mesure (13/5/16/13), avec la règle du cliquet :
   chaque story qui touche de la logique relève le plancher au niveau
   nouvellement mesuré ; on ne le baisse jamais sans un nouvel ADR.

## Decision

Option 3, dans `vitest.config.ts` (fichier projet, survit aux `--update` du
harnais).

## Rationale (lexicographic)

**Véracité (G1)** : le plancher dit la vérité du projet aujourd'hui et
empêche toute régression silencieuse — c'est sa seule fonction ; 80 % affiché
sur 13 % réel serait un mensonge institutionnalisé. La **Cohérence** avec le
contrat est préservée : la baisse est faite par ADR, jamais en silence.

## Consequences

- Positive : le gate est vert et vigilant dès le premier jour ; toute
  régression de couverture bloque.
- Négative / coût accepté : 13 % reste faible — c'est un point de départ,
  pas une cible.
- Suivis : cliquet à chaque story (story-001 le relèvera dès son premier
  passage) ; viser ≥ 80 % sur `src/utils`, `src/stores`, `src/api` avant les
  composants React.
