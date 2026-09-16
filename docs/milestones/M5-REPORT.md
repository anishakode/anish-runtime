## Milestone report: M5 — Deterministic MLOps Core

**Scope approved:** Owner — “lets go next” (Approve M5)

**M4 status:** Locked

**Implemented:**

- `src/lib/mlops/` — seeded RNG, histograms, PSI, KS, missingness, range quality, monitor state machine, alert cooldown, scenarios
- Algorithm parity with pinned `drift.py` / `stats.py` @ `a2ba6fc…`
- Honesty constants: `PORTFOLIO_EXTENSION` + boundary notice + Source Trace IDs
- ADR 0007; research brief `docs/planning/M5-RESEARCH-BRIEF.md`
- No lab UI routes (M6)

**Tests added/updated:**

- `seed.test.ts` — reproducibility / rejection
- `metrics.test.ts` — PSI/KS/histogram edges + source parity
- `scenarios.test.ts` — quality, state machine, cooldown, scenarios, graph Source Trace

**Test status:** **92 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · test:status · format · lint · typecheck · build — OK

**A11y / mobile / reduced-motion:** N/A (library-only milestone)

**Truth / privacy notes:** Metrics labeled PORTFOLIO_EXTENSION; no fake Grafana/telemetry; no network notify

**Known gaps / deferred:** Live lab UI (M6); Break the System flow (M7); Steward/Malware labs later

**Status:** Locked (owner — 2026-09-15)

**Lock audit:** `docs/milestones/M5-LOCK-AUDIT.md`
