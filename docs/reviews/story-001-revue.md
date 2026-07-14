# Revue adversariale — story-001 (commit 846b326)

Protocole : `.harness/review.md`. Diff jugé : `fix(filters): la date du jour
se calcule à Nouméa, plus en UTC`.

> Réserve de véracité : cette revue est menée par l'agent qui a écrit le code
> (le protocole recommande un reviewer distinct). Les constats ci-dessous
> s'appuient sur ce qui est vérifiable — exécution du gate et des tests — pas
> sur la confiance de l'auteur.

## Étage 0 — Plancher mécanique

`just gate` **vert** avant commit (biome ci, tsc strict, 16 tests, plancher de
couverture 28/5/38/27). À noter : le capteur de couverture a rejeté une
première version du cliquet (lignes et instructions inversées) — corrigée
avant commit. On continue.

## Étage 1 — Véracité

- Le commentaire de `getTodayDate()` affirme le symptôme (« l'app s'ouvrait
  sur les vols d'hier ») : conforme au bug constaté et à la story. ✓
- `Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Noumea" })` retourne bien
  AAAA-MM-JJ : prouvé par exécution (tests aux deux bords du fuseau, valeurs
  exactes attendues). ✓
- Les tests testent la vraie logique : l'horloge est fixée (`setSystemTime`),
  le module rechargé, l'assertion porte sur l'état public du store — rien de
  moqué qui soit l'objet du test. Le stub `localStorage` ne masque que la
  persistance, qui n'est pas l'objet de la story. ✓

Aucun blocage.

## Étage 2 — Conformité à la spec

- Date en Pacific/Noumea quelle que soit la machine : ✓ (2 tests aux bords).
- `resetFilters()` revient à cette date : ✓ (testé).
- Navigation inchangée, passages de mois couverts : ✓ (2 tests).
- Cliquet du plancher appliqué : ✓ (13/5/16/13 → 28/5/38/27).
- Rien au-delà du périmètre ; le hors-périmètre (fuseau des horaires distants,
  sémantique AeroDataBox) est resté hors du diff. ✓

**Nit** : la persistance (`partialize` ne conserve que `flightFilter`) n'est
couverte par aucun test — hors spec de cette story ; candidate pour une story
dédiée.

## Étage 3 — Interrogatoire Tier 1

1. **Cohérence** — le fix suit le motif du projet (fuseau explicite
   `Pacific/Noumea`, comme `src/utils/formatters.ts`) ; il *répare* une
   violation de cette convention plutôt qu'il n'en crée une. Aucun ADR
   contredit. ✓
2. **Scalabilité** — pas de dimension de croissance engagée (fonction O(1)
   appelée à l'initialisation et au reset). ✓
3. **Modularité** — `getTodayDate` reste privée au store ; les tests passent
   par l'API publique (état initial, `resetFilters`) au lieu d'exporter le
   helper pour les besoins du test. ✓
4. **Élégance** — une ligne, un commentaire qui dit le pourquoi. **Conflit
   résolu dans l'ordre** : hisser le `Intl.DateTimeFormat` en constante de
   module serait micro-plus-efficace (Élégance), mais l'idiome du codebase
   (formatters.ts instancie à chaque appel) prime — Cohérence > Élégance,
   laissé tel quel.

## Étage 4 — Dette de décision

- Cliquet du plancher : application mécanique d'ADR-0002, pas de nouvel ADR.
- Idiome `en-CA` : choix trivial et auto-évident (commenté en place) — pas
  d'ADR, conformément au contrat (« do not write one for routine choices »).

## Verdict

**APPROVE** — deux nits, non bloquants :

1. (Étage 2) Couverture de la persistance du store à prévoir dans une story
   ultérieure.
2. (Étage 3) Hisser le formateur en constante si un profil le justifie un
   jour — pas avant.
