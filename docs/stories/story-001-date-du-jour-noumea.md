# Story-001 — La date du jour est fausse le matin

## Brief

Chaque matin jusqu'à ~11 h, l'application s'ouvre sur les vols de la **veille**.
Symptôme utilisateur : il faut cliquer « jour suivant » pour voir les vols du
jour.

## Cause (vérifiée dans le code)

`getTodayDate()` (`src/stores/filters.ts`) calcule la date via
`new Date().toISOString()` — c'est la date **UTC**. Nouméa est en UTC+11 :
avant 11 h locales, l'UTC est encore sur la veille. Le reste du code applique
pourtant soigneusement `Pacific/Noumea` (`src/utils/formatters.ts`) — le
store violait la convention du projet.

## Spécification

- `getTodayDate()` retourne la date AAAA-MM-JJ **dans le fuseau
  Pacific/Noumea**, quels que soient le fuseau et l'heure de la machine.
- `resetFilters()` revient à cette date.
- La navigation jour précédent/suivant reste en arithmétique de dates pure
  (comportement inchangé).
- Cas limites couverts par des tests : matin à Nouméa (UTC encore la veille),
  soir à Nouméa, passage de mois en navigation.
- Le plancher de couverture est relevé au niveau nouvellement mesuré
  (cliquet — ADR-0002).

## Hors périmètre

Le fuseau d'affichage des horaires de l'aéroport distant (`formatTime` force
Pacific/Noumea sur tous les horaires — comportement existant, non modifié).
La sémantique départ/arrivée des temps renvoyés par l'API AeroDataBox
(question ouverte, à traiter dans une story dédiée si besoin).
