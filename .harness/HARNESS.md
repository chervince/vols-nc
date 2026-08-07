# HARNESS — the quality contract

> This file is the single source of truth for how work is judged in this
> repository. Agents MUST load it before planning or writing code. Humans
> validate against it. It is stack-agnostic: the concrete tools live in the
> adapter (`.harness/gates.sh`), but the *rules* below never change between
> projects.

## The one command

There is exactly one way to ask "is this acceptable?":

```
just gate
```

`gate` runs every per-commit sensor gate for this stack (advisories are
cadenced, not run here — see harness ADR-0002). If it is red, the work is not
done — no exceptions, no "I'll fix it later". Green `gate` is the floor, not
the goal.

Never invent per-project commands. If a check is worth running, it belongs in
`gate`. Same interface everywhere; only the adapter underneath differs.

`just doctor` is the gate's companion: it verifies the *wiring* — tools
present at lockfile versions, configs extending the harness bases, git hooks
active — without judging any code. Run it after installing, and whenever the
gate behaves strangely (harness ADR-0009).

---

## The decision model — two tiers

Every decision passes through two tiers, in order. Tier 0 is mechanical and
binary. Tier 1 is judgment, and it is strictly ordered. You never trade a
lower tier against a higher one.

### Tier 0 — Hard gates (binary, non-negotiable)

Nothing proceeds unless BOTH gates are green. These are not weighed against
anything — they are preconditions, never traded against Tier 1. But they are not
all enforced the same way, and pretending they are would itself break G1:

- **Sensor-enforced** — a tool decides, not a person; you do not argue with it.
- **Review-enforced** — no sensor covers it *yet*, so a person (or agent) who
  did not write the code judges it at review, aided by the sensors that
  partially catch it, and records non-trivial calls in an ADR. This is not a
  softer bar — it is a gate you must be able to defend, not a suggestion. The
  harness's standing job is to keep *converting* review-enforced rules into
  sensor-enforced ones as tooling allows.

**G1 — Truthfulness.** The code must not lie.
- It does what it claims (name, docstring, type, and behaviour agree). *Review;
  partially sensed by the type checker and lint.*
- It rests on no assumption that has not been verified. When in doubt, verify it
  in code (a test, a type, an assertion) — do not assume. *Review.*
- No silent failure, no swallowed error, no dead branch pretending to be live.
  *Review; partially sensed by lint (no unreachable/dead code, no unused
  symbols) and by the ban on focused/skipped tests.*
- Dependencies' security advisories are checked, not trusted blindly.
  *Sensor, at the dependency-freshness cadence (harness ADR-0002), not per
  commit. License scanning is deferred (harness ADR-0004) — review-enforced for
  now.*

**G2 — Code quality.** The mechanical floor, entirely sensor-enforced:
- format check passes (no hand-formatting debates)
- linter passes with warnings treated as errors (`--error-on-warnings`)
- frozen lint debt stays capped: suppression markers are counted in tracked
  sources against the project-owned ceiling in `.harness/local.sh`, and an
  unreadable ceiling fails loud. Where a stack has no per-site suppressor,
  `just doctor` says the ratchet is not sensor-held there (harness ADR-0017).
- type checker passes in strict mode
- tests pass and coverage meets the project floor

If a sensor is red, you do not argue with it — you fix the code or, if the rule
itself is wrong for this project, you change it in the **project-owned** config
(`biome.json`, `ruff.toml`, `.harness/local.sh` — never the `*.harness.*`
bases, which `--update` overwrites; see harness ADR-0008) and record the change
in an ADR. You never bypass it locally. The lint ceiling's *direction* lives
here too: it only goes down, and raising it is exactly such a rule change —
a project-owned edit plus its ADR. No sensor reads the ADR log, so the
direction is review-enforced, like every G1 call (harness ADR-0017).

### Tier 1 — Judgment order (lexicographic)

Among options that ALL pass Tier 0, choose by this order. When two criteria
conflict, the higher one wins outright — you do not average them.

1. **Coherence** — fits the existing architecture, naming, and conventions of
   this repo and of the wider stack. One project should read as if written by
   one mind. A locally clever choice that fractures the whole loses here.
   *Ask:* does an existing pattern, boundary, or ADR already answer this?
   Would the diff read as if the author of the rest of the repo wrote it?
   Does it follow prior ADRs — or supersede them explicitly?
   *Evidence:* point at the pattern followed (file, ADR, stack convention).
2. **Scalability** — holds up as data, load, team size, and feature count grow.
   Prefer the option that does not need to be undone at 10×.
   *Ask:* which dimension hurts first at 10× — data volume, request rate,
   contributors, feature count? Does this lock in a schema, an API, a
   dependency that is expensive to reverse?
   *Evidence:* name the growth dimension and why the option survives it —
   "it scales" without a dimension is narrated confidence, which G1 forbids.
3. **Modularity** — clear boundaries, low coupling, high cohesion; a part can be
   understood, tested, and replaced in isolation.
   *Ask:* can this piece be tested without standing up the world? Could it be
   swapped or deleted behind its interface? Does it leak internals across a
   boundary?
   *Evidence:* the interface it hides behind, and what its tests need to run.
4. **Elegance** — the simplest expression that is still coherent, scalable, and
   modular. Elegance is last on purpose: it never justifies breaking the three
   above, but among equals, the clearer and lighter option wins.
   *Ask:* is there anything left to remove? Would a newcomer understand it
   without a tour guide?
   *Evidence:* fewer concepts, fewer lines, fewer dependencies — at equal
   standing on the three criteria above.

**Tie-break rule.** Walk the list top to bottom. The first criterion that
distinguishes the options decides. If all four are genuinely equal, the choice
is trivial — pick one and move on; do not write an ADR for a coin flip.

**Worked example.** A repo stores per-user settings as typed columns on the
`users` table. A new feature needs ten more settings. Option A: add ten
columns — matches the existing pattern (Coherence ✓) but every future setting
is a migration (Scalability ✗ on the feature-count dimension). Option B: a
key-value `settings` table — survives growth (Scalability ✓) but breaks the
repo's "typed columns, no EAV" convention (Coherence ✗). Coherence outranks
Scalability, so B does **not** win by being "better engineering": either ship
A coherently, or write the ADR that *changes the convention* — after which B
**is** the new coherence everything else must fit. That is how the order and
ADRs work together: you never trade a lower criterion up; you change the
standard on the record, then follow it.

---

## When to write an ADR

A non-trivial Tier-1 decision — anything a future reader would reasonably ask
"why was it done this way?" — is recorded as an ADR in `decisions/`, next to
this file.

Write one when you: choose a library or pattern, introduce a boundary, relax a
gate, adopt a new best practice, or make a trade-off between the four criteria.
Do NOT write one for routine, reversible, or self-evident choices.

An ADR is what reconciles "up to date" with "coherent": a fresh decision, once
recorded, *becomes* the coherence everything else must fit. See
`decisions/README.md`.

---

## Freshness policy

Two kinds of freshness, handled differently — do not confuse them.

- **Knowledge freshness (always-on, cheap).** At the moment of a real
  architectural decision, research the current state of the art, decide, and
  freeze the decision in an ADR. Best practices are pulled *at decision time*,
  not streamed continuously.
- **Dependency freshness (cadenced, expensive).** Versions are pinned and frozen
  for the life of the project. New versions enter only through a deliberate
  review (project kickoff, or a scheduled cadence), and each upgrade that
  changes a decision produces an ADR. Default is stability; novelty is an event
  you choose, never a background drift. Security advisories follow the same
  cadence: `audit` runs as a scheduled CI job, not a per-commit gate, so the
  gate's verdict depends only on the code (see harness ADR-0002).

---

## The process layer

The harness judges work; it does not produce it. Whatever produces it — a
brief/spec/story method, a skill pack, an issue tracker — is the *process
layer*, and it is deliberately not shipped here (harness ADR-0010).

Where the two meet, `integration.md` (next to this file) is the seam. It states
the four things the harness never yields, whatever the process layer's own
documentation says: one decision log, one review of record, one definition of
done, and configuration that does not lie. It also states what the project
declares about its own method — in an ADR, like every other standing choice.
Read it before adopting a process layer, and again before upgrading one.

---

## Non-negotiables for agents

- Run `just gate` before claiming any task is done. Red gate ⇒ not done.
- Never weaken a gate silently. Weaken it only in an ADR + the adapter.
- Truthfulness first: verify assumptions in code, don't narrate confidence.
- Apply the lexicographic order explicitly when options compete; name the
  criterion that decided.
- Record non-trivial judgment calls as ADRs. Keep the trivial ones out.
- Non-trivial diffs pass the adversarial review protocol (`review.md`, next to
  this file) before merge — run by someone other than their author: floor →
  truthfulness → spec → Tier 1 → decision debt.
- A process layer never overrides `integration.md`: one decision log, one review
  of record, one definition of done, no config that lies. Declare the method
  this project uses in an ADR.
- Commits follow `commit-convention.md`.
