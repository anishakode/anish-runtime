## Milestone report: M6 — MLOps Live Lab

**Scope approved:** Owner — “Next” (Approve M6)

**M5 status:** Locked

**Implemented:**

- `/labs/mlops` Runtime Lab page + `MlopsLab` client UI
- `lab-session` helpers: create / SHIFT (+0.50) / INJECT MISSING / RESET
- Live PSI, KS D, missingness, range quality from M5 core
- Detector-disagreement lens; accessible histogram table
- `PORTFOLIO_EXTENSION` boundary + Source Trace to pinned sources
- Link from MLOps project page; `/llms.txt` discovery; scope unlock for `src/components/labs`
- ADR 0008

**Tests added/updated:**

- `lab-session.test.ts` — determinism, shift/missing/reset, table rows, rejections
- `mlops-lab.test.tsx` — honesty, controls, table, shift/reset UX
- `labs/mlops/page.test.tsx` — optional framing + recruiter note
- Project page link assertion; e2e lab smoke

**Test status:** **102 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · test:status · format · lint · typecheck · build — OK (`/labs/mlops` in route table)

**A11y / mobile / reduced-motion:** histogram is a real `<table>`; controls are buttons; no motion-required UX

**Truth / privacy notes:** No Grafana/telemetry theatre; session-only lab state; Source Trace SHA-pinned

**Known gaps / deferred:** Break the System cinematic (M7); Steward/Malware labs; Signal

**Ask:** Lock M6? (yes/no)

**Status:** Locked (owner — 2026-09-15)

**Lock audit:** `docs/milestones/M6-LOCK-AUDIT.md` · cumulative through M7: `docs/milestones/M7-LOCK-AUDIT.md`
