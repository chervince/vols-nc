# Commit convention

Conventional Commits, **message body in French**, typed scopes. One logical
change per commit. The commit must leave `just gate` green.

## Format

```
<type>(<scope>): <description en français, impératif présent>

[corps optionnel : le pourquoi, pas le comment]

[footer optionnel : refs, BREAKING CHANGE]
```

## Types

| type       | usage                                             |
|------------|---------------------------------------------------|
| `feat`     | nouvelle fonctionnalité                           |
| `fix`      | correction de bug                                 |
| `refactor` | changement interne sans effet fonctionnel         |
| `perf`     | amélioration de performance                       |
| `test`     | ajout ou correction de tests                      |
| `docs`     | documentation seule                               |
| `chore`    | outillage, config, dépendances                    |
| `ci`       | pipeline d'intégration                            |
| `build`    | système de build, packaging                       |

## Scope

Le scope nomme le module ou la frontière touchée (`api`, `auth`, `db`, `ui`,
`gate`, `deps`…). Un scope par commit ; s'il en faut plusieurs, le commit est
probablement trop gros.

## Règles

- Description ≤ 72 caractères, impératif présent : « ajoute », pas « ajouté ».
- Une décision de jugement non-triviale ⇒ ADR référencé dans le footer
  (`Refs: ADR-0007`).
- Rupture d'API ⇒ `BREAKING CHANGE:` en footer.
- Jamais de commit qui laisse `just gate` rouge.

## Exemples

```
feat(auth): ajoute la rotation des tokens de rafraîchissement

Refs: ADR-0007

fix(db): corrige la fuite de connexion sur timeout Postgres

chore(deps): épingle biome à 1.9.4
```
