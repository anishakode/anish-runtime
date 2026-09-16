## Lock audit: through M9

**Trigger:** Owner — “next” (Lock M9)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GitHub Actions still runs it.
2. **`NOT_DEMONSTRATED` nodes** still primarily graph/legend/JSON (badge path exists; no dedicated museum UI yet).

### LOW / deferred

- Project Autopsy lenses → **M10**
- X-Ray layer isolation → M11
- Steward / Malware labs + their architecture reconstructions → later
- Missingness Trace without a dedicated graph source file → deferred (truth)
- CSP hardening → M24

### Solid

**M0–M4** — foundation, evidence, recruiter utility, visual system, public manifest, RUN ANISH.  
**M5–M7** — deterministic MLOps core, live lab, BREAK/RECOVER + labeled debug.  
**M8** — Source Trace drawer + SHA fingerprints on work + lab.  
**M9** — Reversible Architecture on MLOps work page: five causal stages, scrubber, cumulative text map, reality labels, stage Source Trace; lab deep-link; ADR 0011; no fake history / no Grafana theatre.

### Cross-cutting

- Scope validator still blocks Signal/Fork early paths; mlops lab allowlisted.
- Weak states still surface (`PORTFOLIO_EXTENSION`, `LIMITED_EVIDENCE`).
- Recruiter nav unchanged (Work · Experience · About · CV · Contact).
- **128 unit tests** green; format hygiene refreshed for lock CI.

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK
- `pnpm format:check` · lint · typecheck → OK
- `pnpm test:status` → **128 passed / 0 failed**
- `pnpm build` → OK (`pnpm run ci` full green)

**Lock hygiene:** Clean

**Next:** Propose M10 — Project Autopsy (await Approve M10).
