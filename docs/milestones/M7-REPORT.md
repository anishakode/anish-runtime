## Milestone report: M7 — Break the System + Watch Anish Debug

**Scope approved:** Owner — “Yes please make sure we are doing a great unique work” (lock M6 path + signature M7)

**Implemented:**

- `breakTheSystem` / `recoverIncident` / deterministic debug steps (`src/lib/mlops/incident.ts`)
- Lab UI: **BREAK THE SYSTEM**, **RECOVER**, labeled event trace, Watch Anish Debug
- Simulated notify only — no external sends
- Home ready-state link into the Runtime Lab for MLOps
- ADR 0009

**Also:** M6 lock packaging (milestones/README/audit) in the same ship window

**Tests added/updated:**

- `incident.test.ts` — break/recover/determinism/no external URLs
- `mlops-lab.test.tsx` — BREAK → debug/trace → RECOVER
- e2e lab flow uses BREAK/RECOVER

**Test status:** **105 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · test:status · format · lint · typecheck · build — OK

**Truth / privacy notes:** Simulated notify only; no external messages; PORTFOLIO_EXTENSION preserved

**Status:** Locked (owner — 2026-09-15)

**Lock audit:** `docs/milestones/M7-LOCK-AUDIT.md`
