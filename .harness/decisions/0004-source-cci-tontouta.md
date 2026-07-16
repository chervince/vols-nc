# ADR-0004 — Source de données : le tableau de vols CCI-NC, à la place d'AeroDataBox

- **Status:** Accepted
- **Date:** 2026-07-16
- **Deciders:** Vincent

## Context

AeroDataBox (RapidAPI) ne référence **ni Air Calédonie ni aucun vol domestique
calédonien** — vérifié en direct sur plusieurs dates, filtres grands ouverts :
seuls SB (Aircalin) et QF (Qantas) remontent pour NOU, et Magenta (GEA) renvoie
`204 No Content`. Or, depuis le transfert d'Air Calédonie de Magenta à La
Tontouta le **2 mars 2026**, ces vols opèrent bien depuis NOU et doivent
apparaître. La vocation de l'app (ADR-0003 : tous les vols commerciaux de
Tontouta) n'était donc pas remplie.

Le tableau de vols **officiel de l'aéroport** (CCI-NC, `aeroports.cci.nc`) liste,
lui, TOUS les vols de Tontouta : Air Calédonie (TY) domestique **et** Aircalin,
Qantas, Air New Zealand, COTAM — soit plus complet qu'AeroDataBox. Il est
consommable en `GET …/vols/recherche?way=departures|arrivals&date=JJ/MM/AAAA`,
en HTML server-rendered, **sans clé API**.

## Options considered

1. **Garder AeroDataBox** — laisse un trou permanent (aucun vol Air Calédonie),
   contredit ADR-0003.
2. **Deux sources** (AeroDataBox international + CCI domestique) — double
   intégration, déduplication, deux points de casse, pour aucun gain : la CCI
   couvre déjà l'international.
3. **Basculer entièrement sur CCI-NC** — une seule source, couverture complète,
   plus de clé API.

## Decision

Option 3. `src/api/flights.ts` récupère deux pages CCI (départs + arrivées) par
date via le proxy `/cci` ; `src/api/cci.ts` parse le tableau HTML en `Flight[]`.
La dépendance RapidAPI (clé, en-têtes, secret de déploiement) est retirée.

## Rationale (lexicographic)

**Cohérence** tranche : CCI-NC *est* le tableau de l'aéroport, donc la définition
même de « tous les vols de Tontouta » posée par ADR-0003 ; AeroDataBox était une
source partielle incapable de tenir cette promesse. **Véracité (G1)** confirme :
la CCI donne une seule heure vraie par vol et par sens — on cesse d'afficher la
fausse égalité « heure de départ = heure d'arrivée » héritée d'AeroDataBox. Le
compromis (scraping HTML plus fragile qu'une API JSON, perte du détail
avion/terminal/porte) est accepté : la complétude prime pour cet usage.

## Consequences

- Positive : Air Calédonie (+ Air NZ, COTAM) apparaissent enfin ; plus de
  clé/secret RapidAPI à gérer ; horaires honnêtes.
- Négative / coût accepté : le parsing HTML est sensible à un changement de la
  page CCI — mitigé par des tests sur HTML réel et un état d'erreur clair ; plus
  de type d'avion/terminal/porte (le bas de la carte ne s'affiche plus).
- Suivis : l'ancien client AeroDataBox et son test sont remplacés ; surveiller
  la casse du scraping ; `.env`, CLAUDE.md et PRD mis à jour ; envisager un cache
  court côté proxy si la CCI est lente.
