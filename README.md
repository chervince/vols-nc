# Vols Aircalin — Nouméa - La Tontouta

Application web qui affiche **tous les vols commerciaux** (toutes compagnies) au
départ et à l'arrivée de Nouméa - La Tontouta (NOU) pour une date choisie. Les
données proviennent du tableau officiel de l'aéroport (CCI Nouvelle-Calédonie),
**sans clé API** (voir [ADR-0004](.harness/decisions/0004-source-cci-tontouta.md)).

> « Aircalin » est l'identité du produit, **pas** un filtre : aucun transporteur
> n'est écarté. Voir le glossaire [`CONTEXT.md`](CONTEXT.md).

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · TanStack Query · Zustand.

## Commandes

```bash
npm run dev       # Serveur de dev (localhost:5173, proxy CCI via Vite)
npm run build     # Build de production → dist/
npm run preview   # Prévisualise le build
npm run lint      # Lint
just gate         # Juge qualité : tout doit être vert (le plancher, pas le but)
```

## Pour aller plus loin

- [`CLAUDE.md`](CLAUDE.md) — le contexte complet (architecture, données, déploiement)
- [`CONTEXT.md`](CONTEXT.md) — le glossaire du langage du projet
- [`.harness/HARNESS.md`](.harness/HARNESS.md) — le contrat qualité
- [`.harness/decisions/`](.harness/decisions/) — les décisions d'architecture (ADR)

## Déploiement — suspendu

L'application **n'est pas en ligne** : le projet a été retiré du VPS pour une
durée indéterminée (voir [ADR-0005](.harness/decisions/0005-deploiement-suspendu.md)).

Le pipeline construit toujours l'image et la publie sur GHCR, mais ne déploie
plus : [`.github/workflows/build.yml`](.github/workflows/build.yml).
