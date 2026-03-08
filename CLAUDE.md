# Prompt Claude Code : Application Aircalin Flight Tracker

## Contexte du projet

Application web affichant les vols de la compagnie **Aircalin** (code IATA: SB) au départ et à l'arrivée de **Nouméa** (code IATA: NOU) pour une date choisie par l'utilisateur.

L'application utilise l'API **AeroDataBox** via RapidAPI, proxiée côté serveur par nginx.

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

## Architecture API

### Proxy nginx (production)

En production, nginx fait office de reverse proxy vers l'API AeroDataBox. La clé API n'est **jamais exposée côté client**.

```
Client → /api/flights/... → nginx proxy_pass → aerodatabox.p.rapidapi.com
```

Les headers `X-RapidAPI-Key` et `X-RapidAPI-Host` sont injectés par nginx via `envsubst` au démarrage du container.

### Proxy Vite (développement)

En développement, Vite proxy les requêtes `/api/` vers AeroDataBox via `vite.config.ts`. La clé API est lue depuis `.env`.

### Endpoints utilisés

```
GET /api/flights/airports/iata/{airportCode}/{fromLocal}/{toLocal}
```

Query params : `direction=Both`, `withCancelled=true`, `withCodeshared=false`, `withPrivate=false`, `withCargo=false`

---

## Configuration API AeroDataBox

- **Base URL** : `https://aerodatabox.p.rapidapi.com`
- **Headers requis** (injectés par le proxy, jamais côté client) :
  ```
  X-RapidAPI-Key: <voir DEPLOY-CREDENTIALS.local>
  X-RapidAPI-Host: aerodatabox.p.rapidapi.com
  ```

---

## Fonctionnalités

1. **Sélection de date** — Date picker + navigation J-1/J+1
2. **Filtrage** — Par type (tous/départs/arrivées), par destination (futur)
3. **Filtrage Aircalin** — Seuls les vols `airline.iata === "SB"` sont affichés
4. **Affichage** — Cartes de vol avec numéro, horaires, statut, avion
5. **Gestion des états** — Loading, erreur (retry), aucun résultat
6. **Cache** — TanStack Query (stale 5min, GC 30min, refetch on focus)

---

## Déploiement

### Infrastructure

- **VPS** : Debian 12 avec Docker + Traefik v3.6
- **URL** : `https://vols.neith-consulting.com`
- **DNS** : Cloudflare (proxy activé)
- **CI/CD** : GitHub Actions → GHCR → SSH deploy
- **Repo** : `chervince/vols-nc`

### Credentials

Toutes les informations sensibles (IP, tokens, clés API) sont dans `DEPLOY-CREDENTIALS.local` (fichier local, non suivi par git).

### GitHub Secrets nécessaires

- `SSH_PRIVATE_KEY` : clé privée ed25519 pour le déploiement SSH
- `VITE_RAPIDAPI_KEY` : clé API RapidAPI AeroDataBox (injectée au runtime dans le container)

### Docker

- Image : `ghcr.io/chervince/vols-nc:latest`
- nginx sert les fichiers statiques + proxy `/api/` vers AeroDataBox
- La clé API est passée en variable d'environnement au runtime (jamais dans l'image)

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
