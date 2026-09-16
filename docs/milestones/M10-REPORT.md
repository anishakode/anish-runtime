## Milestone report: M10 — Project Autopsy

**Scope approved:** Owner — “Lets go” (Approve M10)

**Implemented:**

- Autopsy lens model (`src/lib/autopsy/`)
- `ProjectAutopsy` keep-mounted lens chrome
- MLOps mount: STORY / RUN (lab) / X-RAY (M9) / DECISIONS / FAILURES (empty) / EVIDENCE
- Lab page links to `#project-autopsy`
- ADR 0012

**Tests added/updated:**

- `lenses.test.ts` — lens ids, MLOps bundle, empty FAILURES
- `project-autopsy.test.tsx` — keep-mounted RUN state, FAILURES honesty, DECISIONS Trace
- `work/[slug]/page.test.tsx` — lens mounts; non-MLOps absence
- `labs/mlops/page.test.tsx` — Autopsy deep link
- `e2e/home.spec.ts` — Autopsy RUN tab for PORTFOLIO_EXTENSION

**Test status:** **136 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**Truth notes:** No fabricated failures; decisions graph-backed; PORTFOLIO_EXTENSION preserved on RUN

**Status:** Locked (owner — 2026-09-15)

**Lock audit:** `docs/milestones/M10-LOCK-AUDIT.md`
