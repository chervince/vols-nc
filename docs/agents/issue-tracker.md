# Issue tracker: Local Markdown

Le travail de ce dépôt est spécifié en markdown local, dans `docs/stories/`.
**Il n'y a pas d'issues GitHub** — le dépôt n'en a jamais eu, et une skill qui
irait les chercher ne trouverait rien.

## Conventions

- Une story par fichier : `docs/stories/story-NNN-<slug>.md`, numérotée à partir
  de `001`.
- Le corps porte le brief, la cause si c'est un bug, la **spécification**, et un
  **hors périmètre** explicite. C'est ce que la revue juge à son étage 2.
- L'état de triage est une ligne `Statut:` près du haut du fichier (voir
  `triage-labels.md` pour les valeurs).
- Les échanges s'ajoutent en bas, sous un titre `## Commentaires`.
- La trace de revue de la story vit à côté, dans `docs/reviews/story-NNN-*.md`,
  à la forme que fixe `.harness/review.md`.

`stories/` à la racine est antérieur au harnais (déploiement initial) : ce n'est
pas le tracker, et rien n'y est ajouté.

## When a skill says "publish to the issue tracker"

Créer un fichier sous `docs/stories/`, en prenant le numéro libre suivant.

## When a skill says "fetch the relevant ticket"

Lire le fichier référencé. Le numéro de story ou son chemin est passé
directement.

## Wayfinding operations

Utilisé par `/wayfinder`. La **carte** est un fichier, avec un fichier **enfant**
par ticket.

- **Carte** : `docs/stories/<effort>/map.md` — corps Notes / Decisions-so-far /
  Fog.
- **Ticket enfant** : `docs/stories/<effort>/NN-<slug>.md`, numéroté à partir de
  `01`. Une ligne `Type:` (`research`/`prototype`/`grilling`/`task`) et une ligne
  `Statut:` (`claimed`/`resolved`).
- **Blocage** : une ligne `Bloqué par: NN, NN` près du haut. Un ticket est
  débloqué quand tous les fichiers listés sont `resolved`.
- **Frontière** : parcourir les enfants ouverts, non bloqués, non réclamés ; le
  premier par numéro gagne.
- **Réclamer** : passer `Statut: claimed` et enregistrer avant tout travail.
- **Résoudre** : ajouter la réponse sous `## Réponse`, passer
  `Statut: resolved`, puis ajouter un pointeur de contexte aux
  Decisions-so-far de la carte.
