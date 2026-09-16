## Lock audit: through M11

**Trigger:** Owner — “ext” / next (Lock M11)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GitHub Actions still runs it.
2. **Public live URL / packaging** still deferred (discoverability, not WOW).
3. **Autopsy / X-Ray MLOps-only** — Steward/Malware depth waits for M12+.

### LOW / deferred

- Steward Agent Lab (M12) · Malware lab · Signal / Fork / Ending Signal
- CSP hardening → M24

### Solid

**M0–M7** — foundation through Break/Debug lab.  
**M8–M9** — Source Trace + Reversible Architecture.  
**M10** — Project Autopsy lenses.  
**M11** — Project X-Ray responsibility layers (isolate/select/related/Trace); no invented infra; M9 causal panel retained; ADR 0013.

### Cross-cutting

- Scope validator still blocks Signal/Fork early paths.
- Weak states and empty Failure Museum remain honest.
- Recruiter nav ungated; STORY default intact.
- **142 unit tests** green.

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK
- `pnpm format:check` · lint · typecheck → OK
- `pnpm test:status` → **142 passed / 0 failed**
- `pnpm build` → OK (`pnpm run ci` full green)

**Lock hygiene:** Clean

**Next:** Propose M12 — Steward_AI Agent Lab (handoff order). Optional: Signal-first if uniqueness leap preferred.
