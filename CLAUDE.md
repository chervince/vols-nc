# Prompt Claude Code : Application Aircalin Flight Tracker

## Contexte du projet

Application web affichant **tous les vols commerciaux** (toutes compagnies) au départ et à l'arrivée de **Nouméa - La Tontouta** (code IATA: NOU) pour une date choisie par l'utilisateur. « Aircalin » désigne l'identité visuelle du produit, **pas** un filtre : aucun transporteur n'est écarté (voir ADR-0003).

Les données proviennent du **tableau de vols officiel de l'aéroport** (CCI Nouvelle-Calédonie), proxié côté serveur par nginx — **aucune clé API** (voir `.harness/decisions/0004-source-cci-tontouta.md`).

---

## Spécifications techniques

### Stack technique

| Technologie        | Version | Rôle                                                                 |
| ------------------ | ------- | -------------------------------------------------------------------- |
| **React**          | 19      | Framework UI avec les nouveaux hooks (useActionState, useOptimistic) |
| **TypeScript**     | 5.9+    | Typage statique                                                      |
| **Vite**           | 7.x     | Build tool & dev server                                              |
| **Tailwind CSS**   | 4.1     | Styling utility-first (nouveau moteur haute performance)             |
| **TanStack Query** | 5.x     | Gestion du server state (cache, refetch, mutations)                  |
| **Zustand**        | 5.x     | Gestion du client state (filtres, préférences UI)                    |

### Structure du projet

```
vols-nc/
├── src/
│   ├── components/       # Composants React (FlightCard, DatePicker, FilterBar, etc.)
│   ├── api/
│   │   └── flights.ts    # Client API (appelle /api/flights/ proxié par nginx)
│   ├── stores/
│   │   └── filters.ts    # Store Zustand pour les filtres et préférences
│   ├── types/
│   │   └── flight.ts     # Types TypeScript pour les vols
│   ├── hooks/
│   │   └── useFlights.ts # Hook TanStack Query pour les vols
│   ├── utils/
│   │   └── formatters.ts # Fonctions de formatage (dates, heures)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css         # Configuration Tailwind CSS 4
├── nginx.conf.template    # Template nginx avec proxy API (envsubst au runtime)
├── Dockerfile
├── .env.example
├── .env                   # Variables d'environnement locales (ignoré par git)
└── package.json
```

---

## Architecture des données (CCI-NC)

La source est le **tableau de vols officiel de l'aéroport de Nouméa - La Tontouta**
(CCI Nouvelle-Calédonie), qui liste tous les vols commerciaux — Air Calédonie
(domestique) comprise. **Aucune clé API.** Décision et compromis assumés :
`.harness/decisions/0004-source-cci-tontouta.md`.

### Proxy (nginx en prod, Vite en dev)

Le navigateur reste en same-origin ; le proxy réécrit `/cci` vers la CCI :

```
Client → /cci/fr/tontouta/vols/recherche → proxy → www.aeroports.cci.nc
```

### Requêtes

```
GET /cci/fr/tontouta/vols/recherche?way=departures|arrivals&date=JJ/MM/AAAA
```

Deux requêtes par date (départs + arrivées). La réponse est du **HTML** ; le
tableau `cci-aeroport-flights` est parsé en `Flight[]` par `src/api/cci.ts`.
Colonnes : date, heure, destination/provenance, compagnie, n° de vol, statut.
Pas de type d'avion / terminal / porte, et une seule heure connue par vol/sens.

---

## Fonctionnalités

1. **Sélection de date** — Date picker + navigation J-1/J+1
2. **Filtrage** — Par type (tous/départs/arrivées), par destination (futur)
3. **Toutes compagnies** — Aucun filtre par transporteur : tous les vols **commerciaux** de NOU sont affichés (fret et aviation privée exclus via l'API — voir ADR-0003)
4. **Affichage** — Cartes de vol avec numéro, horaires, statut, avion
5. **Gestion des états** — Loading, erreur (retry), aucun résultat
6. **Cache** — TanStack Query (stale 5min, GC 30min, refetch on focus)

---

## Déploiement — **suspendu**

L'application **n'est pas en ligne**. Le projet a été retiré du VPS le
2026-08-06 pour une durée indéterminée : `/opt/vols-nc` n'existe plus sur
l'hôte, et `https://vols.neith-consulting.com` ne sert plus l'application.
Décision et procédure de restauration : `.harness/decisions/0005-deploiement-suspendu.md`.

### État du pipeline

- **CI/CD** : GitHub Actions → GHCR. Le pipeline s'arrête à l'image publiée ;
  il n'y a plus d'étape de déploiement (`.github/workflows/build.yml`).
- **Repo** : `chervince/vols-nc`

### Cible historique (à restaurer le jour venu — ADR-0005)

- **VPS** : Debian 12 avec Docker + Traefik v3.6
- **URL** : `https://vols.neith-consulting.com`
- **DNS** : Cloudflare (proxy activé) — pointe toujours vers l'ancien hôte

### Credentials

Toutes les informations sensibles (IP, tokens, clés API) sont dans `DEPLOY-CREDENTIALS.local` (fichier local, non suivi par git).

### GitHub Secrets

- Aucun secret n'est nécessaire au pipeline actuel (`GITHUB_TOKEN` suffit pour GHCR).
- `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`, `VPS_PORT` : inutilisés depuis l'ADR-0005, conservés pour la restauration.
- Plus de clé API : la source CCI-NC est publique (ADR-0004). `VITE_RAPIDAPI_KEY` / `RAPIDAPI_KEY` ne sont plus utilisés.

### Docker

- Image : `ghcr.io/chervince/vols-nc:latest`
- nginx sert les fichiers statiques + proxy `/cci/` vers le tableau CCI-NC
- Aucune clé API à injecter au runtime (source publique — voir ADR-0004)

---

## Commandes

```bash
npm run dev       # Dev server (localhost:5173, proxy API via Vite)
npm run build     # Build production → dist/
npm run preview   # Preview du build
npm run lint      # ESLint
```

---

## Codes aéroports fréquents Aircalin

NOU (Nouméa), SYD (Sydney), BNE (Brisbane), MEL (Melbourne), AKL (Auckland), NAN (Nadi), VLI (Port-Vila), WLS (Wallis), PPT (Papeete), SIN (Singapour), NRT/TYO (Tokyo), KIX (Osaka), CDG (Paris)

<!-- harness:pointer -->
## Harness
Quality contract: load `.harness/HARNESS.md` before planning or writing code.
One command judges everything: `just gate` (green is the floor, not the goal).
Non-trivial diffs are reviewed with `.harness/review.md` — never by the author.
Other tooling yields to `.harness/integration.md` on ADRs, review, and done.
<!-- /harness:pointer -->

## Agent skills

Ces skills se branchent **sous** le harnais : `.harness/integration.md` tranche
sur les ADR, la revue de référence et la définition de « fini ». Les adaptations
faites pour cela sont enregistrées dans ADR-0006.

### Issue tracker

Le travail est spécifié en markdown local, un fichier par story dans `docs/stories/`. Pas d'issues GitHub. Voir `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` — portés par une ligne `Statut:` dans le fichier de story. Voir `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — root `CONTEXT.md` + `.harness/decisions/` (le journal du harnais, pas `docs/adr/`). Voir `docs/agents/domain.md`.
