# PRD — Aircalin Flight Tracker

> Document de référence pour tout agent travaillant sur ce projet.
> Dernière mise à jour : 2026-03-08

---

## 1. Vision produit

Application web affichant les vols de la compagnie **Aircalin** (IATA: SB) au départ et à l'arrivée de **Nouméa La Tontouta** (IATA: NOU) pour une date choisie par l'utilisateur. Les données proviennent de l'API **AeroDataBox** via RapidAPI.

---

## 2. Stack technique

| Technologie        | Version  | Rôle                          |
| ------------------ | -------- | ----------------------------- |
| React              | 19.2     | UI (hooks modernes, compiler) |
| TypeScript         | 5.9      | Typage statique strict        |
| Vite               | 7.x      | Build & dev server            |
| Tailwind CSS       | 4.1      | Styling (plugin Vite natif)   |
| TanStack Query     | 5.x      | Server state, cache, refetch  |
| Zustand            | 5.x      | Client state (filtres)        |

**Node.js** : 20.19+ ou 22.12+ requis (Vite 7).

---

## 3. Architecture du projet

```
src/
├── api/
│   └── flights.ts            # Client API AeroDataBox
├── components/
│   ├── DatePicker.tsx         # Sélecteur de date + navigation J-1/J+1
│   ├── EmptyState.tsx         # Aucun vol trouvé
│   ├── ErrorState.tsx         # Erreur API avec bouton retry
│   ├── FilterBar.tsx          # Filtres Tous / Départs / Arrivées
│   ├── FlightCard.tsx         # Carte de vol individuelle
│   ├── FlightList.tsx         # Conteneur liste + gestion des états
│   ├── Header.tsx             # Bandeau bleu avec titre
│   ├── LoadingSpinner.tsx     # Spinner de chargement
│   └── index.ts               # Barrel export
├── hooks/
│   └── useFlights.ts          # Hook TanStack Query
├── stores/
│   └── filters.ts             # Store Zustand (date, filtres)
├── types/
│   ├── flight.ts              # Interfaces TypeScript
│   └── index.ts               # Barrel export
├── utils/
│   ├── formatters.ts          # Formatage dates, heures, statuts, aéroports
│   └── index.ts               # Barrel export
├── App.tsx                    # Composant racine
├── main.tsx                   # Point d'entrée React + QueryClientProvider
└── index.css                  # Tailwind CSS 4 config + thème Aircalin
```

Fichiers racine : `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.env`, `.env.example`, `index.html`.

**Alias** : `@/*` → `src/*` (configuré dans tsconfig + vite).

---

## 4. Flux de données

```
[Zustand store] ──selectedDate──→ [useFlights hook]
                                       │
                                       ▼
                              [fetchFlights(date)]
                                       │
                              2 requêtes parallèles
                         (00:00-11:59) + (12:00-23:59)
                                       │
                                       ▼
                              [AeroDataBox API]
                                       │
                                       ▼
                         [Transform ApiFlight → Flight]
                                       │
                                       ▼
                    [select: filtre direction + tri horaire]
                                       │
                                       ▼
                         [FlightList → FlightCard[]]
```

### 4.1 API AeroDataBox

- **Base URL** : `https://aerodatabox.p.rapidapi.com`
- **Endpoint** : `GET /flights/airports/iata/{code}/{from}/{to}`
- **Auth** : Headers `X-RapidAPI-Key` + `X-RapidAPI-Host`
- **Limitation** : Fenêtre max de 12h → 2 requêtes par jour (matin + après-midi)
- **Query params** : `direction=Both`, `withCancelled=true`, `withCodeshared=false`, `withPrivate=false`, `withCargo=false`

### 4.2 Transformation des données

L'API renvoie des `ApiFlight` avec une structure `movement` (un seul point du vol). Le client transforme en structure normalisée `Flight` avec `departure` et `arrival` explicites :

- **Départ** : `departure.airport` = NOU, `arrival.airport` = destination
- **Arrivée** : `departure.airport` = origine, `arrival.airport` = NOU

### 4.3 Gestion d'erreurs API

| Status | Comportement                                  |
| ------ | --------------------------------------------- |
| 404    | Retourne `{ departures: [], arrivals: [] }`   |
| 429    | `ApiError` : "Limite API atteinte"            |
| 401/403| `ApiError` : "Clé API invalide"               |
| Autre  | `ApiError` : "Erreur serveur (XXX)"           |

### 4.4 Cache TanStack Query

- **Query key** : `['flights', selectedDate]`
- **Stale time** : 5 minutes
- **GC time** : 30 minutes
- **Refetch on window focus** : oui
- **Retry** : 2 tentatives automatiques

---

## 5. State management

### Zustand store (`stores/filters.ts`)

| State            | Type           | Défaut         | Persisté |
| ---------------- | -------------- | -------------- | -------- |
| `selectedDate`   | `string`       | aujourd'hui    | Non      |
| `flightFilter`   | `FlightFilter` | `'all'`        | Oui      |
| `selectedAirport`| `string\|null` | `null`         | Non      |

**Actions** : `setSelectedDate`, `setFlightFilter`, `setSelectedAirport`, `goToPreviousDay`, `goToNextDay`, `resetFilters`.

**Persistence** : localStorage clé `aircalin-filters`, seul `flightFilter` est persisté.

---

## 6. Système de types

```typescript
// API brute
ApiFlight { movement, number, callSign?, status, airline, aircraft?, isCargo }
ApiFlightsResponse { departures: ApiFlight[], arrivals: ApiFlight[] }

// Normalisé
Flight { departure: FlightTime, arrival: FlightTime, number, status, airline, aircraft? }
FlightsResponse { departures: Flight[], arrivals: Flight[] }

// Affichage
DisplayFlight extends Flight { direction: 'departure' | 'arrival' }

// Enums
FlightStatus = 'Scheduled' | 'Expected' | 'Departed' | 'EnRoute' | 'Landed' | 'Cancelled' | 'Delayed' | 'Unknown'
FlightFilter = 'all' | 'departures' | 'arrivals'
```

---

## 7. Composants — Comportement attendu

### DatePicker
- Affiche la date formatée (ex: "Sam. 8 mars 2026")
- Boutons ← / → pour naviguer jour par jour
- Input date natif caché, déclenché au clic sur la date affichée
- Connecté au store Zustand

### FilterBar
- 3 boutons radio : Tous / Départs / Arrivées
- L'actif est en bleu, les inactifs en gris
- Connecté au store Zustand

### FlightCard
- **Header** : badge direction (coral=départ, bleu=arrivée) + numéro de vol + badge statut coloré
- **Corps** : heure départ — icône avion — heure arrivée, avec codes IATA et noms de villes
- **Footer** (optionnel) : terminal, porte, immatriculation avion
- Hover : ombre renforcée

### FlightList
- Affiche le nombre de vols trouvés
- Délègue à `LoadingSpinner`, `ErrorState`, ou `EmptyState` selon l'état
- `ErrorState` a un bouton "Réessayer" connecté à `refetch()`

### Header
- Fond bleu Aircalin, icône avion dans cercle blanc
- Titre : "Vols Nouméa - La Tontouta"
- Sous-titre : "Tous les vols au départ et à l'arrivée"

---

## 8. Thème visuel

### Palette Aircalin (définies dans `index.css` via `@theme`)

| Token              | Hex       | Usage                    |
| ------------------ | --------- | ------------------------ |
| `aircalin-blue`    | `#0066b3` | Couleur primaire         |
| `aircalin-dark`    | `#004a82` | Hover, accents sombres   |
| `aircalin-coral`   | `#ff6b4a` | Accent, badge départ     |
| `aircalin-light`   | `#e6f2fa` | Fond clair, highlights   |
| `aircalin-gray`    | `#f5f7fa` | Fond de page             |

### Utilities CSS custom
- `container-app` : `mx-auto max-w-4xl px-4`
- `focus-ring` : focus outline bleu avec offset
- `animate-fade-in` : fade-in 0.3s avec translateY

### Statuts de vol — couleurs badges

| Statut     | FR        | Classes Tailwind              |
| ---------- | --------- | ----------------------------- |
| Scheduled  | Prévu     | `bg-blue-100 text-blue-800`   |
| Expected   | Attendu   | `bg-blue-100 text-blue-800`   |
| Departed   | Parti     | `bg-green-100 text-green-800` |
| EnRoute    | En vol    | `bg-sky-100 text-sky-800`     |
| Landed     | Atterri   | `bg-emerald-100 text-emerald-800` |
| Cancelled  | Annulé    | `bg-red-100 text-red-800`     |
| Delayed    | Retardé   | `bg-amber-100 text-amber-800` |
| Unknown    | Inconnu   | `bg-gray-100 text-gray-800`   |

---

## 9. Utilitaires (`utils/formatters.ts`)

| Fonction              | Entrée              | Sortie              | Exemple                          |
| --------------------- | ------------------- | ------------------- | -------------------------------- |
| `formatTime`          | ISO string          | `HH:MM`             | `"2025-01-15T08:30+11:00"` → `"08:30"` |
| `formatDate`          | `YYYY-MM-DD`        | Date longue FR      | `"2025-01-15"` → `"Mer. 15 janvier 2025"` |
| `formatDateShort`     | `YYYY-MM-DD`        | Date courte FR      | `"2025-01-15"` → `"15 janv."`   |
| `formatFlightStatus`  | `FlightStatus`      | Label FR            | `"Scheduled"` → `"Prévu"`       |
| `getStatusClasses`    | `FlightStatus`      | Classes Tailwind    | `"Cancelled"` → `"bg-red-100 text-red-800"` |
| `formatFlightNumber`  | `string`            | Sans espaces        | `"SB 140"` → `"SB140"`          |
| `getAirportCity`      | Code IATA           | Nom de ville        | `"SYD"` → `"Sydney"`            |

**Timezone** : Toutes les heures sont affichées en `Pacific/Noumea` (UTC+11).

**Dictionnaire aéroports** : NOU, SYD, BNE, MEL, AKL, NAN, VLI, WLS, PPT, SIN, NRT, TYO, KIX, CDG, BKK, ICN, HKG. Fallback : retourne le code IATA brut.

---

## 10. Variables d'environnement

```env
VITE_RAPIDAPI_KEY=<clé RapidAPI>
VITE_RAPIDAPI_HOST=aerodatabox.p.rapidapi.com
```

Accessibles via `import.meta.env.VITE_*`.

---

## 11. Commandes

```bash
npm run dev       # Dev server (localhost:5173)
npm run build     # TypeScript check + build production → dist/
npm run preview   # Servir le build localement
npm run lint      # ESLint
```

---

## 12. État actuel et anomalies connues

### Fonctionnel
- Sélection de date avec navigation J-1/J+1
- Récupération des vols via API (2 requêtes/jour pour contourner la limite 12h)
- Filtrage par direction (tous/départs/arrivées)
- Affichage des cartes de vol avec toutes les infos
- Gestion des états : chargement, erreur (avec retry), aucun résultat
- Cache intelligent TanStack Query
- Persistance du filtre actif dans localStorage
- Design responsive mobile-first
- Thème Aircalin (bleu océan + coral)

### Anomalies / Écarts par rapport au CLAUDE.md

1. **Pas de filtrage Aircalin** : `useFlights.ts` retourne TOUS les vols de l'aéroport, pas seulement ceux d'Aircalin (SB). Le CLAUDE.md spécifie `airline.iata === 'SB'`.

2. **Titre HTML** : `index.html` a `<title>temp-app</title>` au lieu de quelque chose comme "Vols Aircalin — Nouméa".

3. **lang HTML** : `<html lang="en">` devrait être `<html lang="fr">`.

4. **Filtre par aéroport** : Le store a `selectedAirport` mais aucun composant ne l'utilise. Le dropdown destination n'est pas implémenté.

5. **README** : Contient le template Vite par défaut, pas la documentation projet.

6. **Favicon** : Utilise `vite.svg`, pas de favicon Aircalin.

---

## 13. Fonctionnalités non implémentées

### Prévues dans le CLAUDE.md
- [ ] Filtre dropdown par destination/origine (composant + intégration store)
- [ ] Mode sombre

### Bonus listés
- [ ] Export PDF/CSV de la liste des vols
- [ ] PWA (installable sur mobile)
- [ ] Notifications de retard/annulation
- [ ] Historique des recherches récentes
- [ ] React 19 Suspense avec `use()`

---

## 14. Déploiement

### Infrastructure cible
- **VPS** : Debian 12 avec Docker + Traefik v3.6 (voir `DEPLOY-CREDENTIALS.local` pour IP/SSH)
- **Reverse proxy** : Traefik (réseau Docker `web`, Let's Encrypt)
- **DNS** : Cloudflare (proxy activé)
- **CI/CD** : GitHub Actions → GHCR → SSH deploy
- **Repo** : `chervince/vols-nc`

### Déploiement (déjà en place)
- Dockerfile multi-stage : node build → nginx (proxy API + fichiers statiques)
- GitHub Actions : build → push GHCR → SSH deploy
- docker-compose sur le VPS avec labels Traefik
- Clé API injectée au runtime via `RAPIDAPI_KEY` (env var dans docker-compose)
- GitHub Secrets : `SSH_PRIVATE_KEY`, `VITE_RAPIDAPI_KEY`, `VPS_HOST`, `VPS_USER`, `VPS_PORT`

### Labels Traefik attendus
```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.vols-nc.rule=Host(`vols.neith-consulting.com`)
  - traefik.http.routers.vols-nc.entrypoints=websecure
  - traefik.http.routers.vols-nc.tls.certresolver=letsencrypt
  - traefik.http.services.vols-nc.loadbalancer.server.port=80
```

---

## 15. Conventions de code

- **Imports** : Alias `@/` pour `src/`, barrel exports via `index.ts`
- **Composants** : Named exports (pas de default), fichier par composant
- **Hooks** : Préfixe `use`, un fichier par hook
- **Store** : Un fichier par store, utilise `persist()` pour ce qui doit survivre au reload
- **Types** : Fichiers dédiés dans `types/`, interfaces exportées
- **CSS** : Tailwind utility classes inline, thème custom dans `index.css` via `@theme`
- **API** : fetch natif (pas d'Axios), erreurs wrappées dans `ApiError`
- **Langue** : Interface 100% français, code en anglais
- **Formatage** : Locale `fr-FR`, timezone `Pacific/Noumea`
