# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`.harness/decisions/`** — read ADRs that touch the area you're about to work in. This is the **only** decision log in this repo; there is no `docs/adr/` and none is to be created (`.harness/integration.md`, règle 1).

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── .harness/decisions/
│   ├── 0003-portee-tous-vols-commerciaux.md
│   └── 0004-source-cci-tontouta.md
└── src/
```

Le dépôt est mono-contexte et le restera tant qu'un ADR n'en décide pas
autrement. La variante multi-contexte du pack de skills — un `docs/adr/` par
contexte — **ne s'applique pas ici** : le harnais n'admet qu'un journal de
décision (`.harness/integration.md`, règle 1). Si le besoin apparaît, il se
tranche par un ADR, pas en créant un second journal en silence.

## Le gabarit d'ADR

`.agents/skills/domain-modeling/ADR-FORMAT.md` (fichier vendored, consigné dans
`skills-lock.json` — jamais édité ; aucun capteur ne recompare les sommes,
l'interdit est tenu par revue) décrit un gabarit « une à trois phrases » dans `docs/adr/`.
**Il est superseded ici** par `.harness/decisions/0000-template.md`, qui exige en
plus le critère qui a tranché (Cohérence / Scalabilité / Modularité / Élégance)
et ce qui a été troqué — c'est cette traçabilité-là qui fait le Tier 1. Le
fichier vendored n'est pas édité : une mise à jour du pack l'écraserait. Voir
ADR-0006.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
