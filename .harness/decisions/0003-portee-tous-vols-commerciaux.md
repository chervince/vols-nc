# ADR-0003 — Portée : tous les vols commerciaux de Nouméa, pas de filtre par compagnie

- **Status:** Accepted
- **Date:** 2026-07-16
- **Deciders:** Vincent

## Context

Le CLAUDE.md (fonctionnalité #3) et le PRD (§1) décrivaient l'application comme
n'affichant que les vols **Aircalin** (`airline.iata === "SB"`) ;
`todo-implement.md` cochait même un filtre SB comme implémenté. Le code, lui,
n'a **jamais** filtré par compagnie : `useFlights.ts` renvoie tous les vols de
l'aéroport (commentaire « Tous les vols (toutes compagnies) »), et `EmptyState`
affichait « Aucun vol Aircalin ».

Vérifié en test avec le propriétaire produit : l'intention réelle est d'afficher
**tous les vols commerciaux** de Nouméa - La Tontouta (NOU), toutes compagnies,
départs et arrivées — pas seulement Aircalin. Le fret et l'aviation privée sont
hors périmètre. C'était donc la **spec écrite** qui mentait, pas le code.

## Options considered

1. Ajouter le filtre `airline.iata === "SB"` pour respecter la spec écrite —
   casserait l'usage réel (on ne verrait plus Qantas, Air NZ, Air Vanuatu…).
2. Garder le code tel quel et corriger la spec : aucun filtre par compagnie,
   « commercial only » assuré côté API (`withCargo=false`, `withPrivate=false`).

## Decision

Option 2. **Aucun filtre par transporteur.** Le périmètre « vols commerciaux »
est porté par les paramètres de la requête AeroDataBox, inchangés :
`direction=Both`, `withCancelled=true`, `withCodeshared=false` (dédoublonnage,
pas d'exclusion de vol), `withPrivate=false`, `withCargo=false`. « Aircalin » ne
désigne plus que l'identité visuelle (thème, nom, titre), jamais un filtre de
données.

## Rationale (lexicographic)

**Véracité (G1)** tranche : nom, spec et comportement doivent coïncider ; la spec
affirmait un filtre inexistant et non voulu — on aligne la spec sur l'intention
vérifiée et sur le code, plutôt que l'inverse. **Cohérence** confirme le sens de
l'alignement : le sous-titre de l'app (« Tous les vols au départ et à l'arrivée »)
et l'endpoint utilisé (tableau de bord de l'aéroport) portaient déjà « tous les
vols » — la ligne « SB uniquement » était l'intruse.

## Consequences

- Positive : la doc cesse de piéger le prochain agent (plus de « filtre Aircalin
  manquant » à « corriger ») ; le code reste inchangé, `just gate` reste vert.
- Positive : copie UI alignée — `EmptyState` affiche « Aucun vol » au lieu de
  « Aucun vol Aircalin ».
- Coût accepté : le branding « Aircalin » (nom du paquet, `<title>`, thème)
  désigne désormais l'identité, pas le périmètre — légère ambiguïté tolérée.
- Hors périmètre : le README (encore le template Vite) et le state mort
  `selectedAirport` (dropdown destination non câblé) restent à traiter.
