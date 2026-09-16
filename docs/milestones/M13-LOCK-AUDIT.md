## Lock audit: through M13

**Trigger:** Owner — “yes move on to next one” (Lock M13 + continue to M14)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e via `pnpm start`.
2. **Public live URL / packaging** still deferred.
3. **Malware / Steward X-Ray depth** deferred — intentional lab-first scope.

### LOW / deferred

- Failure Museum route (M14) · Signal / Fork / Ending Signal · CSP → M24

### Solid

**M0–M12** — prior lock audits hold (recruiter path, Evidence Graph, MLOps + Steward labs, Autopsy/X-Ray, Source Trace).  
**M13** — PDF Malware Explainability Lab: static feature reconstruction with pinned study-signal math; `/labs/malware` + Autopsy RUN; LIMITED_EVIDENCE SHAP; no upload/execution; ADR 0015; fail-first unit + e2e coverage (exact 0.50→0.68 pins).

### Cross-cutting

- Scope validator still blocks Signal/Fork early paths; REQUIRED pins M13 entry files.
- Weak states + empty Failure Museum boundary node remain honest.
- Recruiter nav ungated (Work · Experience · About · CV · Contact).
- **185 unit tests** green at M13 lock (`pnpm run ci`); malware/steward e2e smoke OK.

### Commands run

- `pnpm run ci` → OK (scope · evidence · format · lint · typecheck · test:status · build)
- Lab e2e (`PDF Malware` · `Steward Agent` · footer) → OK against `pnpm start`

**Lock hygiene:** Clean

**Next:** M14 — Failure Museum Evidence Gate (owner continued with “move on to next one”).
