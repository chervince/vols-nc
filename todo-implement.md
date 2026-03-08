# Plan d'implémentation - Aircalin Flight Tracker

## Phase 1 : Initialisation du projet ✅

### 1.1 Création du projet Vite
- [x] Créer le projet avec `npm create vite@latest`
- [x] Configurer TypeScript strict mode
- [x] Configurer `vite.config.ts`

### 1.2 Installation des dépendances
- [x] React 19.2 + React DOM 19.2
- [x] TanStack Query 5.90 + DevTools
- [x] Zustand 5.0.9
- [x] Tailwind CSS 4.1 (plugin Vite)
- [x] TypeScript 5.9.3

### 1.3 Configuration de base
- [x] Configurer Tailwind CSS 4 dans `index.css` avec `@theme` Aircalin
- [x] Créer `.env.example` avec les variables RapidAPI
- [x] Configurer `.gitignore`
- [x] Configurer `tsconfig.json` avec paths aliases (`@/`)
- [x] Configurer `main.tsx` avec QueryClientProvider

---

## Phase 2 : Structure et types ✅

### 2.1 Types TypeScript
- [x] Créer `src/types/flight.ts` avec toutes les interfaces
  - Airport, FlightTime, Airline, Aircraft
  - Flight, FlightsResponse, DisplayFlight
  - FlightDirection, FlightFilter, FlightStatus

### 2.2 Structure des dossiers
- [x] Créer l'arborescence :
  ```
  src/
  ├── api/
  ├── components/
  ├── hooks/
  ├── stores/
  ├── types/
  └── utils/
  ```

---

## Phase 3 : Couche données ✅

### 3.1 Client API
- [x] Créer `src/api/flights.ts`
  - Fonction `fetchFlights(date: string)`
  - Gestion des headers RapidAPI
  - Gestion des erreurs HTTP (404, 429, 401/403)
  - Classe `ApiError` personnalisée

### 3.2 Store Zustand
- [x] Créer `src/stores/filters.ts`
  - State : selectedDate, flightFilter, selectedAirport
  - Actions : setSelectedDate, setFlightFilter, setSelectedAirport
  - Actions : goToPreviousDay, goToNextDay, resetFilters
  - Middleware persist pour localStorage (filtre uniquement)

### 3.3 Hook TanStack Query
- [x] Créer `src/hooks/useFlights.ts`
  - Configuration queryKey avec date
  - Option `select` pour filtrer vols Aircalin (SB)
  - Filtrage par type (départs/arrivées) et aéroport
  - Extraction des aéroports disponibles pour le dropdown

### 3.4 Configuration QueryClient
- [x] Modifier `src/main.tsx` (fait en Phase 1)
  - Créer QueryClient avec options par défaut
  - Ajouter QueryClientProvider
  - Ajouter ReactQueryDevtools (dev only)

---

## Phase 4 : Utilitaires ✅

### 4.1 Formatters
- [x] Créer `src/utils/formatters.ts`
  - `formatTime(isoString)` → "08:30" (timezone Pacific/Noumea)
  - `formatDate(dateString)` → "Mer. 15 janvier 2025"
  - `formatDateShort(dateString)` → "15 janv."
  - `formatFlightStatus(status)` → traduction FR
  - `getStatusClasses(status)` → classes Tailwind pour badge
  - `formatFlightNumber(number)` → supprime les espaces
  - `getAirportCity(iata)` → nom de ville

---

## Phase 5 : Composants UI ✅

### 5.1 Layout
- [x] Créer `src/components/Header.tsx`
  - Logo stylisé avec icône avion
  - Titre et sous-titre de l'application

### 5.2 Sélection de date
- [x] Créer `src/components/DatePicker.tsx`
  - Input date natif (overlay invisible)
  - Boutons "Jour précédent" / "Jour suivant"
  - Affichage date formatée
  - Intégration avec store Zustand

### 5.3 Filtres
- [x] Créer `src/components/FilterBar.tsx`
  - Toggle : Tous / Départs / Arrivées
  - Dropdown destinations/origines (dynamique)
  - Intégration avec store Zustand

### 5.4 Liste des vols
- [x] Créer `src/components/LoadingSpinner.tsx`
  - Animation de chargement aux couleurs Aircalin

- [x] Créer `src/components/FlightCard.tsx`
  - Numéro de vol avec badge direction (départ/arrivée)
  - Villes départ/arrivée avec codes IATA
  - Horaires locaux formatés
  - Statut avec badge coloré
  - Type d'avion, terminal, porte, immatriculation

- [x] Créer `src/components/FlightList.tsx`
  - Gestion état loading (spinner)
  - Gestion état error (message + retry)
  - Gestion état empty (aucun vol)
  - Compteur de résultats
  - Mapping des FlightCard

### 5.5 États vides et erreurs
- [x] Créer `src/components/EmptyState.tsx`
  - Message "Aucun vol Aircalin"
  - Icône avion stylisée

- [x] Créer `src/components/ErrorState.tsx`
  - Message d'erreur explicite
  - Bouton "Réessayer"

---

## Phase 6 : Assemblage ✅

### 6.1 App principal
- [x] Assembler `src/App.tsx`
  - Layout responsive avec Header
  - DatePicker + FilterBar (responsive flex)
  - FlightList avec gestion des états
  - Footer avec crédit AeroDataBox
  - Connexion store Zustand ↔ useFlights

### 6.2 Styles globaux
- [x] Finaliser `src/index.css`
  - Variables CSS Aircalin (@theme)
  - Styles de base (body, html, font-family)
  - Utility container-app
  - Utility focus-ring (accessibilité)
  - Animation fade-in

---

## Phase 7 : Tests et polish

### 7.1 Tests manuels
- [ ] Tester navigation de date
- [ ] Tester filtres (type + destination)
- [ ] Tester états : loading, error, empty, success
- [ ] Tester responsive (mobile, tablet, desktop)
- [ ] Tester cache TanStack Query (onglet focus)

### 7.2 Polish UI
- [ ] Animations de transition (filtres, cards)
- [ ] Hover states sur les cards
- [ ] Focus states accessibilité
- [ ] Skeleton loaders (optionnel)

### 7.3 Performance
- [ ] Vérifier bundle size
- [ ] Vérifier Lighthouse score
- [ ] Lazy loading si nécessaire

---

## Phase 8 : Documentation et déploiement

### 8.1 Documentation
- [ ] Créer `README.md` complet
  - Instructions d'installation
  - Configuration API RapidAPI
  - Commandes disponibles
  - Structure du projet
  - Screenshots

### 8.2 Préparation déploiement
- [ ] Vérifier build production (`npm run build`)
- [ ] Tester preview (`npm run preview`)
- [ ] Configurer pour Vercel/Netlify (si nécessaire)

---

## Bonus (optionnel)

### B.1 Mode sombre
- [ ] Ajouter toggle dark mode
- [ ] Variables CSS dark theme
- [ ] Persister préférence dans Zustand

### B.2 PWA
- [ ] Configurer vite-plugin-pwa
- [ ] Créer manifest.json
- [ ] Ajouter icônes app

### B.3 Export données
- [ ] Bouton export CSV
- [ ] Bouton export PDF (avec jspdf)

### B.4 React 19 Suspense
- [ ] Refactorer avec `use()` hook
- [ ] Ajouter Suspense boundaries
- [ ] Error boundaries avec `useActionState`

---

## Ordre d'exécution recommandé

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
   ↓         ↓         ↓         ↓         ↓         ↓         ↓         ↓
 ~30min    ~20min    ~45min    ~15min    ~90min    ~30min    ~45min    ~30min
```

**Temps total estimé : ~5h de développement**

---

## Notes techniques

### Commandes d'initialisation
```bash
# Création projet
npm create vite@latest aircalin-tracker -- --template react-ts

# Installation dépendances
npm install react@19 react-dom@19 @tanstack/react-query zustand
npm install -D @tanstack/react-query-devtools tailwindcss@4 @tailwindcss/vite typescript@5.9
```

### Variables d'environnement requises
```env
VITE_RAPIDAPI_KEY=xxx
VITE_RAPIDAPI_HOST=aerodatabox.p.rapidapi.com
```

### Couleurs Aircalin
- Bleu principal : `#0066b3`
- Bleu foncé : `#004a82`
- Corail/accent : `#ff6b4a`
- Bleu clair (bg) : `#e6f2fa`
