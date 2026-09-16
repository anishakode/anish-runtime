## Milestone report: M4 — Landing Compilation + Home Runtime

**Scope approved:** Owner — “Yeah lets go next” (Approve M4); fix-now then lock — “Do the fix and then lock it”

**M3.5 status:** Locked

**Implemented:**

- `HomeRuntime` on `/` — idle → compiling → ready
- Journey presets with **differentiated settled layouts** (`settledJourneyPlan`):
  - 20 SEC — one flagship, no constellation, CV primary
  - 2 MIN — all flagships + constellation, View work primary
  - EXPLORE — constellation + Browse all work primary
- Native radio journey controls; Skip / Escape; reduced-motion immediate settle
- Focus management: Skip on compile → ready heading on settle → RUN on reset
- Graph-backed counts/capabilities/flagships only
- ADR 0006; research brief; `format.ts` client-safe badge labels

**Fix-now (pre-lock):**

- Radiogroup a11y (native radios)
- Focus after Skip/Escape/settle/reset
- Journey settled differentiation (closes “label-only” MEDIUM)
- E2e cases for Escape, reduced-motion, 20 SEC, weak-state project pages
- Empty-tier UI unit test (`TierSection`)
- Project page weak-state unit tests
- Footer stage label → M4

**Tests added/updated:**

- `runtime-model.test.ts` — settled journey plans
- `home-runtime.test.tsx` — focus + 20 SEC / EXPLORE differentiation
- `work/page.test.tsx` — empty tier
- `work/[slug]/page.test.tsx` — PORTFOLIO EXTENSION / LIMITED EVIDENCE
- `e2e/home.spec.ts` — Escape, RM, 20 SEC, weak states

**Test status:** **66 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · test:status · format · lint · typecheck · build — OK  
**Local e2e note:** Playwright Chromium binary missing in this agent environment; GitHub Actions still runs `test:e2e`. Unit coverage mirrors Escape/RM/journey edges.

**A11y / mobile / reduced-motion:** native radios; focus handoff; live region; RM bypass; constellation stacks below `md`

**Truth / privacy notes:** Graph-only facts; session UI state; no profiling

**Known gaps / deferred:** Boundary `NOT_DEMONSTRATED` UI; local `pnpm ci` omits e2e; CSP M24; labs/Signal M5+

**Status:** Locked (owner — 2026-09-15)

**Lock audit:** `docs/milestones/M4-LOCK-AUDIT.md`
