# Revue — PR #3 : couche processus arbitrée et harnais 0.5.0

**Reviewer :** un agent frais, qui n'a écrit aucun des commits jugés — y
compris le correctif. Protocole : `.harness/review.md`, deux rondes sur le
même enregistrement.

**Ce qui a été jugé :** la branche `harness/0.5.0` contre `origin/main` —
cinq commits à l'état approuvé : `2af3a39` (pack vendored + lock), `b556e07`
(harnais 0.5.0 + arbitrage ADR), `75d1213` (renumérotation ADR-0006),
`15a5b81` (sync harness-owned), **`1c42759`** (correctif de la ronde 1).

**Spec :** aucune story n'existe pour ce changement — **l'absence est
signalée**, conformément au protocole ; les corps des messages de commit font
spec. (Le tracker déclaré, `docs/stories/`, est né après coup dans cet
arbitrage même.)

## Ronde 1 — FIX (2 constats bloquants)

**F1 *(É1)* — `skills-lock.json` ne verrouillait rien**, sur quatre appuis
vérifiés par exécution : 0/22 sommes correspondant aux fichiers vendored
(lock et fichiers nés désynchronisés dans le même commit) ; **aucun outil ne
le lisait** alors qu'ADR-0006 affirmait « détecterait la divergence comme une
corruption » — la propriété narrée dans un JSON, jamais affirmée par un
capteur ; 22 fichiers couverts sur 66 (et `domain.md` déclarait
`ADR-FORMAT.md` « verrouillé » — une config qui ment) ; aucune référence
amont malgré « versions épinglées ».

**F2 *(É1)* — le Context de l'ADR-0006 énonçait des faits que git dément** :
« depuis juillet 2026 : un pack de 24 skills vendored » — `.agents/` naît le
2026-08-07 dans cette PR même (ce qui date de juillet, c'est la méthode :
stories 14/07, `CONTEXT.md` 17/07) ; « 24 skills » là où il y en a 22 ;
`CONTEXT.md` crédité au pack qu'il précède de trois semaines.

**À décharge, vérifié vrai** : zéro issue GitHub depuis toujours, aucune
skill ne connaît `just gate`, `/implement` se déclare terminé sans gate,
`/code-review` sans verdict, `docs/stories/`/`docs/reviews/` réellement
utilisés, aucun fichier vendored édité, renumérotation complète et sans
référence cassée. L'intégration jugée cohérente avec les quatre règles
d'`integration.md`.

→ Correctifs, bornés aux deux constats : lock **régénéré** (version 2, les
66 fichiers avec sommes SHA-256 recalculées et vérifiées, source nommée,
référence amont dite **non enregistrée** — à épingler à la première
synchronisation, pas fabriquée) ; tous les textes authorés ramenés à ce qui
tient (« tenu par revue, aucun capteur ne recompare ») ; Context réécrit sur
ce que git montre, « 24 » → 22.

*Incident, déclaré par l'auteur :* un premier état du commit correctif est
parti avec le lock seul sous un message qui prétendait déjà les corrections
de textes — le script d'édition avait échoué sur sa première assertion et le
commit est passé quand même. Réparé par amend + force-push dans les minutes ;
l'état jugé en reprise est le commit complet.

## Ronde 2 — **APPROVE**

F1 clos : **66/66 sommes exactes**, comparaison bidirectionnelle recalculée
par le reviewer (qui a aussi consigné et corrigé un bug de son propre script
de comparaison avant de conclure) ; plus aucune occurrence de « verrouillé »,
« épinglé » ou « détecterait » ; la lacune restante dite au lieu d'être
maquillée. F2 clos : chaque date et chaque compte recoupent les preuves de la
ronde 1. Fermeture **par retrait de prétention** plutôt que par machinerie
(−147/+94) — jugée la plus légère des deux offertes, et cohérente avec la
distinction sensor-enforced / review-enforced du contrat.

## Au registre, pour des passes futures

- Le point de sync amont du harnais n'est enregistré nulle part (pas de SHA
  dans `15a5b81`) — le canal de mise à jour du harnais (ADR-0018 amont) est
  la réponse structurelle.
- Épingler la référence amont de `mattpocock/skills` à la première
  synchronisation — consigné dans l'ADR **et** dans le lock.
- La règle de collision de numéros (« le premier commité garde son numéro »)
  ne vit que dans un corps de commit — à promouvoir si ça se reproduit.
- Nits : instruction de template résiduelle (`triage-labels.md:20`) ;
  l'exemple « ADR-0007 » de `domain.md` entrera en collision avec le prochain
  ADR réel ; story-001 n'a pas de ligne `Statut:` ; le trailer
  `Refs: ADR-0005` de `b556e07` déréférence depuis la renumérotation
  (l'historique l'explique).

## Clôture

État approuvé : `1c42759`. Gate et doctor verts aux deux rondes.
