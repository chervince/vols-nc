# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Le tracker de ce dépôt est en markdown local (`docs/agents/issue-tracker.md`) :
il n'y a pas de labels GitHub. Un rôle s'écrit sur une ligne `Statut:` près du
haut du fichier de story — `Statut: ready-for-agent`. « Appliquer un label »
veut dire éditer cette ligne.

Edit the right-hand column to match whatever vocabulary you actually use.
