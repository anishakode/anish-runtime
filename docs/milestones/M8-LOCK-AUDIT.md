## Lock audit: through M8

**Trigger:** Owner — “Lets go on” (Lock M8)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GitHub Actions still runs it; Chromium may be absent in agent environments.
2. **Boundary `NOT_DEMONSTRATED` nodes** still graph/legend/JSON only (not a dedicated project-page callout beyond badges).

### LOW / deferred

- Missingness/range Source Trace triggers beyond PSI/KS → M9 architecture stages can deepen
- Steward / Malware labs, Signal, Fork → later milestones
- CSP hardening → M24
- Continuous drawer↔trigger line remeasure under rapid scroll is PE-only

### Solid

**M0** — tooling, scope validator, CI contract coherent (`pnpm run ci`).  
**M1** — Evidence Graph validates; exclusions + SHA fingerprints intact.  
**M2** — Recruiter routes `/` `/work` `/work/[slug]` `/experience` `/about` `/cv` `/contact`; nav ungated; lab optional.  
**M3** — Editorial Lab tokens/fonts; badge text labels; reduced-motion/print baselines.  
**M3.5** — `/evidence.json` derived projection only.  
**M4** — Idle home readable; RUN ANISH + skip/escape/reduced-motion.  
**M5** — Deterministic PSI/KS core + PORTFOLIO_EXTENSION boundary.  
**M6** — `/labs/mlops` SHIFT/INJECT/RESET + honesty; no fabricated Grafana.  
**M7** — BREAK / Watch Anish Debug / RECOVER; simulated notify only.  
**M8** — SourceTraceProvider + drawer + triggers on project evidence and lab PSI/KS; Escape close; line PE-only; lab SHA parity with graph; ADR 0010.

### Cross-cutting

- Scope validator still blocks Signal/Fork/Ending early paths; mlops lab allowlisted.
- Weak states (`PORTFOLIO_EXTENSION`, `LIMITED_EVIDENCE`) still surface on project pages.
- Test catalog includes M8 resolve + drawer suites; **115 unit tests** green.
- README / milestones table updated to Locked through M8.

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK
- `pnpm format:check` · lint · typecheck → OK
- `pnpm test:status` → **115 passed / 0 failed**
- `pnpm build` → OK  
  (`pnpm run ci` full green)

**Lock hygiene:** Clean

**Next:** Propose M9 — Reversible Architecture (await Approve M9).
