# Vols Nouméa - La Tontouta

Glossaire du langage du projet : l'application affiche tous les vols commerciaux
au départ et à l'arrivée de l'aéroport de Nouméa - La Tontouta pour une date
donnée. Ce fichier définit **les mots** ; `CLAUDE.md` décrit comment le système
marche, et `.harness/decisions/` porte les décisions (ADR).

## Language

### Périmètre

**Vol commercial** :
L'unité de périmètre de l'application : un vol de ligne, toutes compagnies
confondues. Le fret et l'aviation privée en sont exclus (voir ADR-0003).
_Avoid_: vol (seul, ambigu).

**Aircalin (identité produit)** :
Le nom et l'identité visuelle du produit — **pas** un filtre par transporteur.
L'application montre tous les vols commerciaux, pas seulement ceux d'Aircalin
(voir ADR-0003).
_Avoid_: « les vols Aircalin » pour désigner le périmètre.

**Nouméa - La Tontouta (NOU)** :
L'aéroport suivi par l'application, unique point de référence de tous les vols.
_Avoid_: Magenta (l'aéroport domestique historique, hors périmètre depuis ADR-0004).

**Vol masqué** :
Une entrée du tableau non exploitable comme vol commercial (compagnie « ZZ »,
numéro sans chiffre) ; écartée du périmètre.

### Source et données

**CCI Nouvelle-Calédonie (CCI-NC)** :
L'exploitant de l'aéroport et la source unique des données : son tableau de vols
officiel, sans clé API (voir ADR-0004).
_Avoid_: AeroDataBox (ancienne source, abandonnée).

**Statut de vol** :
L'état d'un vol (prévu, parti, atterri, annulé, retardé, attendu, inconnu),
normalisé à partir du texte libre de la colonne « Observations » de la CCI.
_Avoid_: état.

**Vol opérant** :
Dans un partage de code (« SB140 / QF8692 »), le vol effectivement assuré — le
premier numéro. C'est celui que l'application retient.
_Avoid_: codeshare, vol partagé (pour désigner le vol retenu).

### Temps et géométrie du vol

**Sens (départ / arrivée)** :
Le point de vue depuis Nouméa : tout vol est soit un départ de NOU, soit une
arrivée à NOU.

**Côté Nouméa / côté distant** :
Les deux extrémités d'un vol. La source ne donne qu'une seule heure par vol et
par sens : le côté Nouméa porte l'heure connue, le côté distant n'en a pas
(l'heure affichée est alors « — »).

**Jour (fuseau Nouméa)** :
Le jour d'un vol est le jour calendaire à Nouméa (UTC+11), jamais l'UTC — un vol
du petit matin à Nouméa appartient au bon jour local, pas à la veille UTC.
_Avoid_: jour UTC.
