#!/bin/sh
# Node adapter for the harness. Translates the agnostic steps into concrete
# tooling. Package manager is auto-detected (pnpm > npm) from the lockfile.
# This file is stack-specific; the interface it implements (justfile) is not.
set -u

pm() {
    if [ -f pnpm-lock.yaml ]; then
        echo pnpm
    else
        echo npm
    fi
}

pmx() {
    if [ "$(pm)" = pnpm ]; then
        pnpm exec -- "$@"
    else
        # Off a TTY npm exec assumes --yes and silently installs the LATEST
        # version of a missing tool — the gate would then judge with an
        # unpinned binary. --no makes a missing tool a loud failure instead.
        npm exec --no -- "$@"
    fi
}

run() {
    echo "→ $*" >&2
    pmx "$@"
}

# Truthful formatting: check only, never mutate during a gate.
step_fmt() {
    run biome format .
}

# Warnings are errors via --error-on-warnings (Biome does not fail on a
# warning otherwise). Lint rules only — import organization is NOT covered
# by `biome lint`; `step_check` (biome ci) enforces it.
step_lint() {
    run biome lint --error-on-warnings .
}

# Authoritative gate check: format + lint + import organization in a single
# pass, without ever writing (see ADR-0001). --error-on-warnings: a warning
# fails the gate (contract G2).
step_check() {
    run biome ci --error-on-warnings .
}

# Strict types. tsc as the source of truth, no emit.
step_typecheck() {
    run tsc --noEmit -p tsconfig.json
}

# Tests + coverage floor (thresholds live in vitest.config.ts).
step_test() {
    run vitest run --coverage
}

# Dependency truthfulness. Not in the blocking gate: runs at the dependency
# freshness cadence (scheduled CI job), not per commit. See ADR-0002.
step_audit() {
    if [ "$(pm)" = pnpm ]; then
        pnpm audit --audit-level=high
    else
        npm audit --audit-level=high
    fi
}

# The only mutating step. Never part of `gate`.
step_fix() {
    run biome check --write .
}

dr_ok() {
    echo "  ✓ $1"
}
dr_fail() {
    echo "  ✗ $1"
    [ -n "${2:-}" ] && echo "    → $2"
    dr_fails=$((dr_fails + 1))
}
check_hooks() {
    hooks=$(git rev-parse --git-path hooks 2>/dev/null)
    if [ -n "$hooks" ] && [ -f "$hooks/pre-push" ] && grep -q lefthook "$hooks/pre-push"; then
        dr_ok "lefthook hooks active (pre-push mirrors the gate)"
    else
        dr_fail "lefthook hooks not installed" "npx lefthook install"
    fi
}
dr_summary() {
    if [ "$dr_fails" -eq 0 ]; then
        echo "✓ doctor: wiring complete"
    else
        echo "✗ doctor: $dr_fails issue(s) — the gate may judge less than the contract claims"
        return 1
    fi
}

# Wiring check: are the manual next steps actually done? Verifies without
# mutating. Not part of `gate`: environment verdict, not code verdict (ADR-0009).
step_doctor() {
    dr_fails=0
    echo "doctor (node) — harness $(cat .harness/VERSION 2>/dev/null || echo '?')"
    for t in biome tsc vitest; do
        if pmx "$t" --version >/dev/null 2>&1; then
            dr_ok "$t resolvable via $(pm) (pinned by the lockfile)"
        else
            dr_fail "$t not resolvable" "$(pm) add -D @biomejs/biome@2.5.3 typescript vitest @vitest/coverage-v8"
        fi
    done
    if [ -f biome.json ] && grep -qF biome.harness.json biome.json; then
        dr_ok "biome.json extends biome.harness.json"
    else
        dr_fail "biome.json does not extend biome.harness.json" 'add "extends": ["./biome.harness.json"]'
    fi
    if [ -f tsconfig.json ] && grep -qF tsconfig.harness.json tsconfig.json; then
        dr_ok "tsconfig.json extends tsconfig.harness.json"
    else
        dr_fail "tsconfig.json does not extend tsconfig.harness.json" 'add "extends": "./tsconfig.harness.json"'
    fi
    vt=''
    for f in vitest.config.ts vitest.config.mts vitest.config.js vitest.config.mjs vite.config.ts; do
        if [ -f "$f" ]; then
            vt=$f
            break
        fi
    done
    if [ -n "$vt" ] && { grep -qF vitest.config.harness "$vt" || grep -q thresholds "$vt"; }; then
        dr_ok "vitest config carries the coverage thresholds ($vt)"
    else
        dr_fail "no vitest config with coverage thresholds" "merge vitest.config.harness.ts into your vitest config"
    fi
    check_hooks
    dr_summary
}

case "${1:-}" in
    gate)
        # Order matters: cheapest, most localizing failures first.
        # Audit excluded (ADR-0002): cadenced, not blocking -> deterministic gate.
        step_check && step_typecheck && step_test
        ;;
    fmt) step_fmt ;;
    lint) step_lint ;;
    typecheck) step_typecheck ;;
    test) step_test ;;
    audit) step_audit ;;
    fix) step_fix ;;
    doctor) step_doctor ;;
    *)
        echo "unknown step: ${1:-}" >&2
        exit 2
        ;;
esac
