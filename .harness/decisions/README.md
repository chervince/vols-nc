# Architecture Decision Records

This directory is the memory of the project's judgment calls. It is the hinge
that reconciles "up to date" with "coherent": a decision, once researched and
recorded here, *becomes* the coherence that all later work must fit.

## What gets an ADR

A non-trivial Tier-1 decision (see `../HARNESS.md`): choosing a library or
pattern, drawing a module boundary, relaxing a hard gate, adopting a new best
practice, or resolving a conflict between the four criteria.

What does NOT: routine, reversible, or self-evident choices. If a future reader
would not ask "why?", skip the ADR.

## Workflow

1. Copy `0000-template.md` to `NNNN-short-kebab-title.md` (next free number).
2. State the context, the decision, and — crucially — the criterion that
   decided it (Coherence / Scalability / Modularity / Elegance) and what was
   traded off.
3. Status starts `Proposed`; becomes `Accepted` on validation. A superseding
   ADR flips the old one to `Superseded by ADR-NNNN`.
4. Reference the ADR in the commit footer (`Refs: ADR-NNNN`).

ADRs are append-only history. You never rewrite an accepted ADR; you supersede
it with a new one.

## Cadenced review (dependency freshness)

Knowledge freshness is always-on: research at decision time. Dependency
freshness is cadenced: versions stay pinned and are reviewed deliberately, not
continuously.

Run a review at project kickoff and on a chosen cadence (e.g. monthly). For each
candidate upgrade, decide keep-or-bump; every bump that changes a decision gets
its own ADR. Between reviews, versions are frozen — stability is the default,
novelty is a chosen event.
