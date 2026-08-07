# Adversarial review — the protocol

How a change is judged before it merges. Run it on every non-trivial diff (a
story, a PR). This file is harness-owned (refreshed by `--update`); it is to
review what `gates.sh` is to the gate: the same protocol everywhere, executable
by any fresh reviewer.

The order is the point: each stage is cheaper than the next and can end the
review early. Do not skip stages, do not reorder them.

## Who runs it — never the author

An author re-reads what they *meant*; a reviewer reads what the code *says*.
That gap is the entire product of this file, so independence is a rule here,
not a preference:

**The reviewer is not the author of the diff.** A fresh agent, a session with
no memory of writing the code, or a second person all qualify. In an agent
pipeline this costs one action — so "nobody else was available" is not a
reason, it is the thing to fix.

### The invocation

Give the fresh reviewer exactly this:

- **the protocol** — this file;
- **the standard** — `HARNESS.md`, `integration.md`, and `decisions/`, next to
  it;
- **the diff** — `git diff <base>...HEAD` (three-dot, against the merge-base),
  and the repo to read around it;
- **the spec** — the story, ticket, or issue that motivated the change; failing
  that, the commit message body, and say which one it was.

Withhold the author's reasoning: the "here is why I did it this way", the
defence of a contested choice, the assurance that an edge case is handled. Each
of those replaces a finding with a conclusion. If the reasoning matters it
belongs in the code, a test, or an ADR — where the reviewer finds it unaided,
which is precisely the test.

### What that buys, and what it does not

A fresh agent is not an independent mind: same training, neighbouring blind
spots, wrong with the same confidence as the author. What it has is the one
thing stage 1 needs — **no memory of the intent**. It cannot read a missing
check as present because it remembers meaning to write it. That is the whole
claim; do not stretch it into "independently validated".

### If the author reviews anyway

Then say so in the record's first line, and treat the result as what it is: an
author's claim, not a review's finding. The verdict is still APPROVE or FIX —
there is no third one — but a self-issued APPROVE has not been reviewed, and
writing "reviewed" over it is the kind of lie stage 1 exists to catch.

## Stage 0 — Mechanical floor (no judgment spent)

Run `just gate`. Red ⇒ **stop**: return the failure to the author; there is
nothing to review yet. Never spend judgment on what a sensor catches for free
— unformatted, untyped, or untested code is not reviewable work. (If the
environment itself seems broken, `just doctor` first.)

## Stage 1 — Truthfulness (G1, the review-enforced half)

The code must not lie. Hunt specifically for:

- names, docstrings, or types that promise something the behaviour does not do;
- swallowed errors, silent fallbacks, dead branches pretending to be live;
- assumptions not verified in code (a missing test, type, or assertion);
- tests that assert nothing, or mock away the very thing they claim to test.

Any finding here blocks. Truthfulness is Tier 0: it is never averaged against
anything.

## Stage 2 — Conformance to the spec

Judge against whatever motivated the change (story, spec, brief):

- does it do everything the spec asks — and nothing beyond it (scope creep)?
- are the spec's edge cases exercised by tests, not just narrated as handled?
- if the implementation deviates from the spec, is the deviation stated and
  justified, or silent?

No spec? Then the commit message body is the spec — judge against it, and flag
the absence itself.

## Stage 3 — Tier 1 interrogation (lexicographic)

Walk the four criteria IN ORDER — the questions live in `HARNESS.md`:

1. **Coherence** — for each significant choice, name the existing pattern or
   ADR it follows, or the one it breaks. A break without a superseding ADR
   blocks.
2. **Scalability** — name the growth dimension that hurts first; is the
   choice reversible at 10×?
3. **Modularity** — can the new parts be understood, tested, replaced in
   isolation?
4. **Elegance** — only now: what could be removed with nothing lost?

For every conflict the author resolved, check that the HIGHER criterion won.
"Cleaner" never beats "consistent"; "faster at scale" never beats a
convention that an ADR has not changed first.

## Stage 4 — Decision debt

List the judgment calls in this diff that a future reader would ask "why?"
about. Each one either points to an ADR or gets one written before merge.

## Verdict

- **APPROVE** — stages 0–4 clean; nits allowed, listed as nits.
- **FIX** — one or more blocking findings; the author fixes, and the SAME
  protocol re-runs from stage 0.

There is no third verdict. "Approve with reservations" is a FIX that lost its
nerve.

Every finding names its stage and, for stage 3, its criterion ("Stage 3 —
Coherence: …"). Nobody argues with stage 0. Stages 1–4 are argued with
evidence, and the review's own claims obey G1: no finding without pointing at
code.

## The record

A review leaves a written trace; otherwise "it was reviewed" is precisely the
unverifiable claim G1 forbids. The shape is fixed:

- **who reviewed, and whether they wrote the code** — first line;
- **what was judged** — the diff range, and which spec it was judged against;
- **the findings** — each naming its stage, its criterion for stage 3, and the
  code it points at;
- **the verdict** — APPROVE or FIX.

A FIX round appends its re-review to the same record instead of replacing it:
what was found and then fixed is part of the diff's history, not noise to
clear away.

Where the record is filed is the project's call, declared with the rest of its
method (`integration.md`). The harness fixes the shape, not the filing.
