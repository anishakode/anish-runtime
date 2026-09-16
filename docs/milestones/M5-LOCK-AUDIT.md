## Lock audit: through M5

**Trigger:** Owner locked M5 (“Yes go on”)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm ci` still omits Playwright e2e** — GitHub Actions runs `test:e2e`. Local green ≠ browser green.
2. **Boundary / `NOT_DEMONSTRATED` nodes** remain graph + legend + `/evidence.json` only — by design until museum/Fork.

### LOW / deferred

- MLOps Live Lab UI (SHIFT / INJECT / RESET / accessible histogram) → **M6**
- Break the System + Watch Anish Debug → **M7**
- CSP `unsafe-inline` / `unsafe-eval` → **M24**
- Dark-default theme / heavy screenshot VR → deferred
- Signal / Fork / Ending Signal → later milestones (correctly absent)
- KS identical-sample quirk preserved for pinned `stats.py` parity (documented in `ks.ts`)

### Solid

**M0** — Scope validator; no premature `src/components/labs` / Signal paths; tooling/CI baseline.  
**M1** — Graph 10/38/41/21; exclusions; weak states; SHA fingerprints.  
**M2** — Recruiter routes + nav; 404; `/llms.txt`; pinned repos.  
**M3** — Editorial Lab tokens/fonts; legend; a11y motion/contrast/print.  
**M3.5** — `/evidence.json` derived projection; exclusion leak guards.  
**M4** — RUN ANISH; differentiated journeys; Skip/Escape/RM; focus handoff.  
**M5** — `src/lib/mlops/` seeded core; PSI/KS parity with pinned sources; scenarios; `PORTFOLIO_EXTENSION` + Source Trace; **no lab UI yet**.

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK
- `pnpm test:status` → **92 passed / 0 failed**
- `pnpm format:check` → OK
- `pnpm lint` → OK
- `pnpm typecheck` → OK
- `pnpm build` → OK

**Lock hygiene:** Clean

**Next:** Propose M6 — MLOps Live Lab (await owner approval — do not implement until Approve M6).
