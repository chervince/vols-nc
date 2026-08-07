# Harness — stable, stack-agnostic interface.
# Same recipes in every project. The meaning of each step is defined by the
# adapter in .harness/gates.sh. Never add stack-specific logic here.
# Recipes run under just's default shell (POSIX sh) — no exotic shell is
# required on dev machines or CI runners (harness ADR-0006).

_adapter := ".harness/gates.sh"

# List available recipes.
default:
    @just --list

# Full quality gate. Green is the floor. Red ⇒ the work is not done.
gate:
    sh {{_adapter}} gate

# Auto-fix everything the tools can fix (format + safe lint fixes).
fix:
    sh {{_adapter}} fix

# Format check only.
fmt:
    sh {{_adapter}} fmt

# Lint only (warnings are errors).
lint:
    sh {{_adapter}} lint

# Type check only (strict).
typecheck:
    sh {{_adapter}} typecheck

# Tests + coverage floor.
test:
    sh {{_adapter}} test

# Dependency audit (security advisories; license scanning deferred, harness ADR-0004).
audit:
    sh {{_adapter}} audit

# Wiring check: tools present, configs extend the harness bases, hooks active.
doctor:
    sh {{_adapter}} doctor

# Print the harness version installed in this project.
version:
    @cat .harness/VERSION
