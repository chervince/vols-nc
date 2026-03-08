# Story 001 — Déploiement complet sur VPS

> **Priorité** : Haute
> **Statut** : Terminé
> **Date** : 2026-03-08

## Objectif

Rendre l'application accessible publiquement sur `https://vols.neith-consulting.com` via le VPS existant avec Traefik.

## Prérequis vérifiés

- [x] Build production fonctionne (`npm run build` OK)
- [x] VPS opérationnel (Debian 12, Traefik v3.6)
- [x] Réseau Docker `web` existant
- [x] Domaine `neith-consulting.com` géré via Cloudflare

## Tâches

### Phase 1 — Corrections pré-déploiement

- [x] 1.1 Corriger `index.html` : titre → "Vols Aircalin — Nouméa", lang → "fr"
- [x] 1.2 Ajouter `nginx.conf` pour SPA routing (fallback index.html)

### Phase 2 — Conteneurisation

- [x] 2.1 Créer le `Dockerfile` multi-stage (node build → nginx serve)
- [x] 2.2 Créer `.dockerignore`
- [x] 2.3 Tester le build Docker localement

### Phase 3 — Dépôt GitHub

- [x] 3.1 Initialiser git
- [x] 3.2 Créer le repo sur GitHub
- [x] 3.3 Premier commit + push

### Phase 4 — CI/CD

- [x] 4.1 Créer `.github/workflows/deploy.yml` (build → GHCR → SSH deploy)
- [x] 4.2 Ajouter les secrets `SSH_PRIVATE_KEY` et `VITE_RAPIDAPI_KEY` sur le repo GitHub

### Phase 5 — Infrastructure

- [x] 5.1 Créer le record DNS A sur Cloudflare (proxied)
- [x] 5.2 Créer `/opt/vols-nc/docker-compose.yml` sur le VPS avec labels Traefik
- [x] ~~5.3 Créer `/opt/vols-nc/.env` sur le VPS~~ — Non nécessaire, les clés API sont injectées au build time via GitHub Secrets

### Phase 6 — Déploiement & validation

- [x] 6.1 Deploy initial manuel + pipeline CI/CD validé (run 22813617455, tous steps green)
- [x] 6.2 `https://vols.neith-consulting.com` accessible (HTTP 200)
- [x] 6.3 TLS via Cloudflare (proxy orange) + Traefik certresolver

## Critères de validation

- L'application est accessible sur `https://vols.neith-consulting.com`
- Le certificat TLS est valide
- Les vols s'affichent correctement (API fonctionnelle)
- Le CI/CD redéploie automatiquement à chaque push sur `main`

## Détails techniques

### Dockerfile strategy
- Stage 1 : `node:22-alpine` → `npm ci` + `npm run build` → produit `dist/`
- Stage 2 : `nginx:alpine` → copie `dist/` + `nginx.conf` → sert sur port 80

### Traefik labels
```yaml
traefik.enable=true
traefik.http.routers.vols-nc.rule=Host(`vols.neith-consulting.com`)
traefik.http.routers.vols-nc.entrypoints=websecure
traefik.http.routers.vols-nc.tls.certresolver=letsencrypt
traefik.http.services.vols-nc.loadbalancer.server.port=80
```

### Variables d'environnement
Les clés API sont injectées au **build time** (Vite les intègre dans le bundle via `import.meta.env`).
Elles doivent être passées comme `--build-arg` dans le Dockerfile ou via le `.env` dans le CI.
