# ADR-0006 — Couche processus : pack de skills d'ingénierie sous le harnais

- **Status:** Accepted
- **Date:** 2026-08-07
- **Deciders:** Vincent

## Context

Le harnais 0.5.0 impose de déclarer la couche processus du projet dans un ADR
(`.harness/integration.md`). Ce dépôt en a une depuis juillet 2026 : un pack de
24 skills d'ingénierie (`mattpocock/skills`), vendored dans `.agents/skills/` et
verrouillé par `skills-lock.json`.

Le pack et le harnais revendiquaient les mêmes artefacts. Trois collisions
constatées, fichier par fichier, avant cette décision :

1. **Deux journaux de décision.** Le pack écrit ses ADRs dans `docs/adr/` au
   gabarit « une à trois phrases » ; le harnais les veut dans
   `.harness/decisions/` avec le critère qui a tranché. `docs/adr/` n'existait
   pas encore — il serait né au premier ADR écrit par une skill.
2. **Deux protocoles de revue.** Le pack livre `/code-review` (deux axes,
   sous-agents parallèles, aucun verdict) ; le harnais livre `.harness/review.md`
   (cinq étages, APPROVE ou FIX). Et **aucune des 24 skills ne connaît
   `just gate`** (vérifié par grep) : la revue du pack dépenserait du jugement
   sur ce que l'étage 0 attrape gratuitement, et `/implement` peut se déclarer
   terminé sans gate.
3. **Une configuration fausse.** `docs/agents/issue-tracker.md` déclarait que
   les tickets vivent dans les issues GitHub du dépôt. `gh` est authentifié et
   le dépôt n'a **jamais eu la moindre issue** ; le travail réel vit dans
   `docs/stories/`. Une skill qui « récupère le ticket » ne trouvait rien.

## Options considered

1. **Retirer le pack.** Il apporte de vraies choses que le harnais ne fournit
   pas et ne fournira pas : `CONTEXT.md` (glossaire de domaine), `/grilling`,
   `/diagnosing-bugs`, `/to-spec`. C'est exactement la couche que le harnais
   refuse de livrer (harness ADR-0010).
2. **Éditer les fichiers vendored** pour les aligner sur le harnais. Une mise à
   jour du pack les écraserait ; `skills-lock.json` détecterait la divergence
   comme une corruption. Même erreur que d'éditer un fichier `*.harness.*`.
3. **Garder le pack, plier ce qui est project-owned, et enregistrer les
   divergences ici.**

## Decision

Option 3. Déclaration, telle que `.harness/integration.md` la demande :

- **Couche processus** — `mattpocock/skills`, vendored dans `.agents/skills/`,
  versions épinglées par `skills-lock.json`.
- **Où le travail est spécifié** — `docs/stories/story-NNN-<slug>.md`, un
  fichier par story (brief, spécification, hors périmètre). Pas d'issues
  GitHub. `stories/` à la racine est antérieur au harnais et n'est plus
  alimenté.
- **Où les traces de revue sont classées** — `docs/reviews/story-NNN-*.md`, à la
  forme que fixe `.harness/review.md`.
- **Adaptations faites** :
  - `docs/agents/domain.md` — journal unique en `.harness/decisions/`, variante
    multi-contexte retirée, gabarit d'ADR du pack déclaré superseded par
    `.harness/decisions/0000-template.md` ;
  - `docs/agents/issue-tracker.md` — réécrit en markdown local, la déclaration
    GitHub était fausse ;
  - `docs/agents/triage-labels.md` — un rôle s'écrit sur une ligne `Statut:` du
    fichier de story, faute de labels ;
  - `CLAUDE.md` — le bloc `## Agent skills` dit désormais que ces skills se
    branchent **sous** le harnais, et pointe ici ;
  - `/code-review` est **rétrogradé en passe d'alimentation** : ses constats
    entrent dans la revue à l'étage qui les concerne. Il ne rend pas le verdict
    et ne tourne pas avant que l'étage 0 (`just gate`) soit vert.
  - Les fichiers sous `.agents/skills/` ne sont **pas** édités. Leurs
    divergences avec le harnais sont enregistrées dans cet ADR et dans
    `docs/agents/`, qui sont project-owned.

## Rationale (lexicographic)

**Cohérence** tranche, et elle tranche deux fois. Contre l'option 1 : le harnais
est la couche jugement, il n'a jamais prétendu produire des specs, et retirer le
pack laisserait le dépôt sans couche processus — c'est-à-dire à réinventer une
méthode à chaque story, ce qu'il faisait avant juillet. Contre l'option 2 : ne
pas éditer un fichier vendored est la même règle que ne pas éditer un
`*.harness.*` (harness ADR-0008) — la propriété décide, pas la commodité.

**Modularité** confirme le découpage : tout ce qui est plié vit dans
`docs/agents/` et dans cet ADR, donc une mise à jour du pack se relit contre une
liste de divergences explicite au lieu de réintroduire les collisions en
silence.

Compromis assumé : la rétrogradation de `/code-review` n'est tenue par aucun
capteur, et rien n'empêche une skill de se déclarer « done » sans gate — les
hooks lefthook l'attrapent au commit, mais pas avant. C'est du review-enforced,
comme tout le jugement.

## Consequences

- Positive : un agent frais a une réponse unique sur l'emplacement des ADRs,
  l'autorité de la revue et la définition de « fini ». Les trois collisions sont
  fermées ; `docs/adr/` ne naîtra pas.
- Négative / coût accepté : chaque mise à jour du pack demande de rejouer les
  quatre règles d'`.harness/integration.md` contre les nouveaux défauts, et de
  superséder cet ADR si la réponse change. Les fichiers vendored continuent de
  dire `docs/adr/` — c'est faux dans ce dépôt, et seul cet ADR le corrige.
- Suivis : si le tracker devient un jour GitHub Issues, `docs/agents/` et cet
  ADR changent ensemble, jamais l'un sans l'autre.
