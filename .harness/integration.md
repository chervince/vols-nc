# Integration — the seam with the process layer

> Harness-owned (refreshed by `--update`). The harness judges work; it does not
> produce it. Whatever produces it — a brief/spec/story method, a skill pack, an
> issue tracker, your own habits — is the **process layer**, and it is not
> shipped here on purpose (harness ADR-0010). This file is the seam between the
> two.

## Why this file exists

A process layer does not arrive quietly. It comes with opinions about the very
artifacts the harness owns: where decisions are recorded, what a review is, when
work is done. Left unarbitrated, the repo ends up with two ADR logs, two review
protocols and two definitions of "finished" — and a fresh agent reading the repo
has no way to tell which one binds. At that point the harness is not the
standard; it is one opinion out of two, which is the same as none.

So the seam is stated once, here, instead of being re-litigated per project.

## What the harness does not yield

Whatever the process layer's own documentation says, in a repo that installed
the harness:

1. **One decision log, per repository.** ADRs live in `decisions/`, in the
   template of `decisions/README.md` — the one that names the criterion that
   decided (Coherence / Scalability / Modularity / Elegance) and what was traded
   away. A process layer that files ADRs elsewhere (`docs/adr/`, per-context
   folders) is redirected here, not accommodated: two logs split the project's
   memory, and a criterion-less ADR drops exactly the Tier-1 traceability the
   log exists for.

   The rule binds the *repository*, not the installation, and the log is
   anchored at the repository root. A repo holding several stacks gets several
   gates — different tools, different CI — and still one memory: where a
   subproject's `decisions/` is a link to the root's log, that is the rule being
   kept, not bent. The installer wires it (harness ADR-0015), and `just doctor`
   compares where the link lands against the repository root — resolving
   somewhere is not the same as resolving to the log.
2. **One review of record.** `review.md` issues the verdict. Another review tool
   may run alongside and *feed* it — a smell pass, a security pass, a second
   axis — and its output enters as findings at whichever stage it belongs to. It
   does not replace the protocol, does not set the verdict, and does not run
   before stage 0 is green.
3. **One definition of done.** A green `just gate` (see the non-negotiables in
   `HARNESS.md`). A process layer's "done", "complete" or "ready to merge" is a
   claim about scope; it is never a claim about the floor. If its steps never
   run the gate, the gate binds anyway.
4. **Its configuration is code.** A process layer's config files fall under G1
   like everything else: one that declares an issue tracker the project does not
   use, or a layout that does not exist, is a lie sitting in the repo. Fix the
   config or fix the repo — leaving both is not an option.

These four are not negotiated per project. Everything else is.

## What the project declares

The harness does not know which process layer you use, and does not care — right
up to the moment an agent needs to find the spec. So the project records it
once, as an ADR in `decisions/`, covering:

- **the process layer** — which method or skill pack, at which version or
  source;
- **where the work is specified** — issue tracker, story folder, spec files;
  whichever it is, it must be the one actually used, not the one intended;
- **where review records are filed** — the shape is fixed by `review.md`, the
  filing is yours;
- **the adaptations** — every place the process layer's defaults were bent to
  the four rules above: paths rewritten, a review step demoted to a feeding
  pass, a "done" step taught to call `just gate`.

An ADR is the right home because it is already how this repo records a standing
choice: once written, it *is* the coherence later work must fit. Filing the
project's method anywhere else would put it outside the memory that governs it.

## Keeping the seam honest

A process layer is a dependency, and it drifts: its defaults change under you,
and an upgrade can quietly reintroduce a second ADR log. Re-read the four rules
whenever you upgrade one or adopt another, and supersede the declaration ADR
when the answer changes. A seam nobody re-checks is a seam that has already come
apart.
