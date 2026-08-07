#!/bin/sh
# Node adapter for the harness. Translates the agnostic steps into concrete
# tooling. Package manager is auto-detected (pnpm > npm) from the lockfile.
# This file is stack-specific; the interface it implements (justfile) is not.
set -u

# Project-owned overrides (survive --update): the lint ratchet ceiling.
# Changing it is ADR-worthy. See harness ADR-0017 and .harness/local.sh.
lint_ceiling=''
# shellcheck source=/dev/null
[ -f .harness/local.sh ] && . .harness/local.sh

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
# pass, without ever writing (see harness ADR-0001). --error-on-warnings: a warning
# fails the gate (contract G2).
step_check() {
    run biome ci --error-on-warnings .
}

# Where biome reads, and so where a suppression marker can live. One list,
# used by the gate step and the doctor alike — kept BY HAND: biome does not
# export it, so extending it when biome learns a language is part of this
# file's upkeep (harness ADR-0017). `biome-ignore-all` is a substring match:
# a file-level blanket counts as one marker hiding many.
count_lint_markers() {
    git grep -o -e biome-ignore -- '*.ts' '*.tsx' '*.js' '*.jsx' \
        '*.mjs' '*.cjs' '*.mts' '*.cts' '*.jsonc' '*.css' \
        '*.vue' '*.svelte' '*.astro' 2>/dev/null |
        wc -l | tr -d ' '
}

# The ceiling's whole domain is "non-negative integer": anything else would
# make the -gt tests silently false on error — a disarmed ratchet reading as
# green. Unreadable is loud, the same rule as "no git repository".
ceiling_invalid() {
    case "${lint_ceiling:-0}" in
        *[!0-9]*) return 0 ;;
        *) return 1 ;;
    esac
}

# Lint ratchet (harness ADR-0017): frozen debt is visible as `biome-ignore`
# markers in tracked sources, counted and capped by the project-owned ceiling.
# The count may only shrink; raising the ceiling is an ADR, never silent.
# Markers are counted, not silenced violations: a file-level ignore-all is one
# marker hiding many — reviews treat it as its own smell.
step_ratchet() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        echo "✗ lint ratchet: cannot count suppression markers outside a git repository" >&2
        return 1
    fi
    n=$(count_lint_markers)
    echo "→ lint ratchet: $n biome-ignore marker(s), ceiling ${lint_ceiling:-unset}" >&2
    if ceiling_invalid; then
        echo "✗ lint ratchet: lint_ceiling='$lint_ceiling' is not a non-negative integer." >&2
        echo "  Fix .harness/local.sh — an unreadable ceiling is a disarmed ratchet." >&2
        return 1
    fi
    if [ -z "${lint_ceiling:-}" ]; then
        [ "$n" -eq 0 ] && return 0
        echo "✗ $n suppression marker(s) but no recorded ceiling. Freeze the debt on the" >&2
        echo "  record: set lint_ceiling=$n in .harness/local.sh, with its ADR." >&2
        return 1
    fi
    if [ "$n" -gt "$lint_ceiling" ]; then
        echo "✗ lint ratchet broken: $n marker(s) > ceiling $lint_ceiling. Remove suppressions," >&2
        echo "  or raise the ceiling in .harness/local.sh with an ADR — never silently." >&2
        return 1
    fi
    if [ "$n" -lt "$lint_ceiling" ]; then
        echo "• ratchet can tighten: lower lint_ceiling to $n in .harness/local.sh" >&2
    fi
    return 0
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
# freshness cadence (scheduled CI job), not per commit. See harness ADR-0002.
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
# Update channel (harness ADR-0018): drift is measured against the LOCAL copy
# of the harness repo recorded at install time — never the network. The copy's
# freshness is a human gesture (git pull in the harness repo), not doctor's.
# Three honest states: up to date, behind (with THE command), and unknown said
# as such — a stale or unreachable source can vouch for nothing.
check_source() {
    if [ ! -f .harness/source ]; then
        dr_fail "no harness source recorded (pre-0.7.0 install) — drift unknown" "re-run install.sh --update from your harness repo to record it"
        return
    fi
    hs_src=$(cat .harness/source)
    if [ ! -f "$hs_src/VERSION" ]; then
        dr_fail "harness source unreachable ($hs_src) — drift unknown" "fix the path in .harness/source, or re-run install.sh --update from your harness repo"
        return
    fi
    hs_here=$(cat .harness/VERSION 2>/dev/null)
    hs_there=$(cat "$hs_src/VERSION")
    for hs_v in "$hs_here" "$hs_there"; do
        case "$hs_v" in
            '' | *[!0-9.]* | .* | *. | *..*)
                dr_fail "unreadable harness version ('$hs_here' here, '$hs_there' at source) — drift unknown" "restore the VERSION files"
                return
                ;;
        esac
    done
    hs_cmp=$(awk -v a="$hs_here" -v b="$hs_there" 'BEGIN {
        n = split(a, x, "."); m = split(b, y, ".");
        k = (n > m ? n : m);
        for (i = 1; i <= k; i++) {
            xa = (i <= n ? x[i] : 0) + 0; yb = (i <= m ? y[i] : 0) + 0;
            if (xa < yb) { print "behind"; exit }
            if (xa > yb) { print "ahead"; exit }
        }
        print "equal"
    }')
    case "$hs_cmp" in
        equal) dr_ok "harness up to date ($hs_here — source: $hs_src)" ;;
        behind) dr_fail "harness behind: $hs_here here, $hs_there at source" "sh \"$hs_src/install.sh\" . --update" ;;
        ahead) dr_fail "harness source copy is stale ($hs_there, this project: $hs_here) — drift unknown" "refresh the copy: git -C \"$hs_src\" pull" ;;
        *) dr_fail "version comparison failed — drift unknown" "check that awk is available on PATH" ;;
    esac
}
# One decision log per repository (integration.md, rule 1): `decisions/` is the
# log itself at the repository root, or a link to it. The link's target is
# compared to that root — claiming "the repository's log" on the strength of
# "it resolves somewhere" would be the doctor itself narrating confidence.
check_decision_log() {
    if [ ! -e .harness/decisions ] && [ ! -L .harness/decisions ]; then
        dr_fail "no decision log at .harness/decisions" "re-run install.sh"
    elif [ -L .harness/decisions ] && [ ! -e .harness/decisions ]; then
        dr_fail "the decision log link does not resolve" "re-run install.sh"
    elif [ ! -d .harness/decisions ]; then
        dr_fail ".harness/decisions is not a directory" "delete it and re-run install.sh"
    elif [ -L .harness/decisions ]; then
        dl_root=$(git rev-parse --show-toplevel 2>/dev/null)
        dl_here=$(CDPATH='' cd -- .harness/decisions && pwd -P)
        if [ -z "$dl_root" ]; then
            dr_fail "cannot verify the decision log link (not in a git repository)" "run doctor from the checkout"
        elif [ "$dl_here" = "$dl_root/.harness/decisions" ]; then
            dr_ok "decision log links to this repository's single log"
        else
            dr_fail "decision log links outside this repository's log" "it points at $dl_here"
        fi
    else
        # A real directory here, in a repo whose root keeps its own log, is the
        # split that rule 1 forbids and the installer reports — a sensor that
        # blessed it would see less than the installer does.
        dl_root=$(git rev-parse --show-toplevel 2>/dev/null)
        dl_here=$(CDPATH='' cd -- .harness/decisions && pwd -P)
        if [ -n "$dl_root" ] && [ "$dl_here" != "$dl_root/.harness/decisions" ] &&
            [ -d "$dl_root/.harness/decisions" ] && [ ! -L "$dl_root/.harness/decisions" ]; then
            dr_fail "this project keeps its own decision log while the repository's is at $dl_root" "move the ADRs there, then re-run install.sh --update"
        else
            dr_ok "decision log present"
        fi
    fi
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
# mutating. Not part of `gate`: environment verdict, not code verdict (harness ADR-0009).
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
    if git rev-parse --git-dir >/dev/null 2>&1; then
        rn=$(count_lint_markers)
        if ceiling_invalid; then
            dr_fail "lint ratchet disarmed: lint_ceiling='$lint_ceiling' is not a non-negative integer" "fix .harness/local.sh"
        elif [ -z "${lint_ceiling:-}" ] && [ "$rn" -gt 0 ]; then
            dr_fail "lint ratchet: $rn marker(s), no ceiling recorded" "set lint_ceiling=$rn in .harness/local.sh, with its ADR"
        elif [ -n "${lint_ceiling:-}" ] && [ "$rn" -gt "$lint_ceiling" ]; then
            dr_fail "lint ratchet broken: $rn marker(s) > ceiling $lint_ceiling" "remove suppressions, or raise the ceiling via ADR"
        else
            dr_ok "lint ratchet sensor-held ($rn marker(s) / ceiling ${lint_ceiling:-0})"
        fi
    else
        dr_fail "lint ratchet: markers not countable (no git repository)" "run doctor from the checkout"
    fi
    echo "  • type ratchet: not sensor-held — strict flags are project-owned (tsconfig), an ADR changes them"
    check_source
    check_decision_log
    check_hooks
    dr_summary
}

case "${1:-}" in
    gate)
        # Order matters: cheapest, most localizing failures first.
        # Audit excluded (harness ADR-0002): cadenced, not blocking -> deterministic gate.
        step_check && step_ratchet && step_typecheck && step_test
        ;;
    fmt) step_fmt ;;
    lint) step_lint ;;
    typecheck) step_typecheck ;;
    test) step_test ;;
    audit) step_audit ;;
    fix) step_fix ;;
    ratchet) step_ratchet ;;
    doctor) step_doctor ;;
    drift)
        dr_fails=0
        check_source
        [ "$dr_fails" -eq 0 ]
        ;;
    *)
        echo "unknown step: ${1:-}" >&2
        exit 2
        ;;
esac
