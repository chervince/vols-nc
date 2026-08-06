# ADR-0005 — Déploiement suspendu : le pipeline s'arrête à l'image

- **Status:** Accepted
- **Date:** 2026-08-06
- **Deciders:** Vincent

## Context

Le projet a été retiré du VPS pour une durée indéterminée : `/opt/vols-nc`
n'existe plus sur l'hôte. Vérifié, pas supposé — le workflow `Build & Deploy`
échoue à chaque push sur `main` avec `cd: /opt/vols-nc: No such file or
directory`, après avoir pourtant construit et poussé l'image sur GHCR avec
succès.

Le dépôt affirmait donc quatre choses fausses : le workflow prétendait
déployer, `CLAUDE.md` et `README.md` annonçaient une URL en ligne et un CI/CD
automatisé, et la story 001 décrivait au présent une application accessible.

Le coût réel n'est pas cosmétique. Un `Build & Deploy` rouge à chaque push est
un capteur mort : la même mécanique que celle qu'ADR-0002 refuse pour le
plancher de couverture — un capteur rouge en permanence ne capte plus rien, et
masque le prochain échec qui, lui, comptera.

## Options considered

1. **Désactiver le workflow entier.** Simple, mais jette le build Docker avec
   l'eau du bain : ce build est un capteur vivant et vert, seul juge du
   `Dockerfile` et de la chaîne de production.
2. **Garder l'étape SSH derrière un `if: vars.DEPLOY_ENABLED == 'true'`.**
   Restauration sans commit, mais le fichier continue de décrire un
   déploiement inexistant et postule un retour du VPS que « durée
   indéterminée » ne garantit pas.
3. **Retirer l'étape `Deploy to VPS`, garder build + push GHCR**, et renommer
   le workflow (`deploy.yml` → `build.yml`) pour que son nom dise ce qu'il
   fait.

## Decision

Option 3. Le pipeline s'arrête à l'image publiée sur GHCR. La documentation
passe au présent réel ; la story 001 est datée, pas réécrite.

## Rationale (lexicographic)

**Véracité (G1)** tranche avant tout Tier 1 : un workflow nommé `deploy` qui ne
déploie pas, et une doc qui annonce une URL morte, sont des mensonges du dépôt
— le nom, la doc et le comportement doivent s'accorder. C'est aussi ce qui
écarte l'option 2 : un `if:` toujours faux laisse le fichier décrire un
déploiement qui n'existe pas.

**Cohérence** départage ensuite les options 1 et 3 : le harnais garde ses
capteurs vivants et les répare plutôt que de les éteindre. Le build Docker
reste vert et utile ; seule la partie morte part.

Ce qui est troqué : la restauration coûte un revert au lieu d'une bascule de
variable. Coût accepté — l'historique git conserve l'étape intégralement, et
elle est citée ci-dessous.

## Consequences

- Positive : plus aucun échec CI permanent ; le build Docker redevient un
  signal qu'on peut croire ; le dépôt décrit son état réel.
- Négative / coût accepté : plus de déploiement automatique. Le retour du VPS
  demandera un commit de restauration, pas un simple réglage.
- Le DNS Cloudflare pointe toujours vers l'ancien hôte — hors périmètre du
  dépôt, à traiter côté infrastructure.
- Les secrets GitHub `VPS_HOST`, `VPS_USER`, `VPS_PORT` et `SSH_PRIVATE_KEY`
  deviennent inutilisés. Ils sont laissés en place pour la restauration.

## Restauration

L'étape retirée est intacte dans l'historique :

```sh
git show c3d854f:.github/workflows/deploy.yml
```

Il faut aussi recréer `/opt/vols-nc/docker-compose.yml` sur l'hôte, avec les
labels Traefik listés dans `stories/001-deploiement-complet.md`.
