## Lock audit: through M10

**Trigger:** Owner — “next” (Lock M10)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GitHub Actions still runs it.
2. **Public live URL / packaging** — uniqueness is built; discoverability still needs a shipped URL (public-presence), not a new WOW feature.
3. **Autopsy is MLOps-only** — Steward/Malware still classic project pages (intentional V1 scope).

### LOW / deferred

- M11 layer isolation X-Ray depth (Autopsy X-RAY currently reuses M9 reconstruction)
- Signal composed UI / Fork / Ending Signal — later rare WOW arc
- Steward / Malware labs + Autopsy expansion
- Missingness Trace without graph source file
- CSP hardening → M24

### Solid

**M0–M4** — foundation, evidence, recruiter utility, visual system, public manifest, RUN ANISH.  
**M5–M7** — deterministic MLOps core, live lab, BREAK/RECOVER + labeled debug.  
**M8–M9** — Source Trace + Reversible Architecture.  
**M10** — Project Autopsy lenses on MLOps; keep-mounted RUN/X-RAY; empty FAILURES; graph DECISIONS; ADR 0012; recruiter STORY default.

### Cross-cutting

- Scope validator still blocks Signal/Fork early paths.
- Weak states still surface; no fabricated Failure Museum exhibits.
- Recruiter nav ungated.
- **136 unit tests** green.

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK
- `pnpm format:check` · lint · typecheck → OK
- `pnpm test:status` → **136 passed / 0 failed**
- `pnpm build` → OK (`pnpm run ci` full green)

**Lock hygiene:** Clean

**Next:** Propose M11 — Project X-Ray (depth). Optional owner reorder toward Signal if uniqueness leap is preferred over layer isolation.
