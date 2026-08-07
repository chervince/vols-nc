# shellcheck shell=sh
# Project-owned overrides for the harness gate — this file survives
# `install.sh --update`. Changing a floor or a ceiling is a judgment call:
# record it in an ADR (see .harness/HARNESS.md).

# Lint ratchet ceiling (harness ADR-0017): the number of `biome-ignore`
# markers the gate tolerates in tracked sources. Freeze existing debt once at
# adoption — `npx biome lint --suppress --reason="baseline adoption" .` —
# then record the measured count here, with its ADR. The count may only
# shrink: lower this when the gate says it can tighten; raising it is an ADR,
# never a silent edit. Unset = zero markers tolerated.
# lint_ceiling=0
