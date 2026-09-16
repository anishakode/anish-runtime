## Milestone report: M18 — Adaptive Evidence Composer

**Scope approved:** Owner — `Approve` (M18 proposal)

**Implemented:**

- Strict `ui_plan` schema (allowlisted component types; IDs + layout/emphasis only)
- Deterministic `planUiFromEvidence` + `composeFromPlan` / rehydration from Evidence Graph
- Full fallback on invalid plan or failed rehydration (no partial generative UI)
- `SignalComposedView` in ASK RUNTIME after INTERPRET WITH SIGNAL
- ADR 0020; scope validator requires compose + ui-plan modules

**Tests added/updated:**

- `src/lib/signal/compose.test.ts` — schema reject/accept, unknown id fallback, ArchitectureStrip bound, LIMITED_EVIDENCE, gap compose
- `src/components/search/ask-runtime.test.tsx` — composed UI + fallback notice
- `src/lib/signal/signal.test.ts` — composeStatus on happy path
- `e2e/home.spec.ts` — composed evidence UI
- Catalog + `pnpm test:status`

**Test status:** 260 passed / 0 failed — see `docs/testing/TEST-STATUS.md`

**Validation run:** `pnpm run ci`

**A11y / mobile / reduced-motion:** Composer renders inside existing ASK RUNTIME dialog (focus trap / Escape unchanged); stack/grid layout; links keyboard-reachable

**Truth / privacy notes:** Planner never supplies titles/states/metrics; software rehydrates; GapNotice copy is system-owned; session-only; no visitor profiling

**Known gaps / deferred:** Hosted LLM UI planner wrapping the same schema; Signal Recompile (M19); richer ArchitectureStrip interaction beyond stage list

**Locked:** 2026-09-15 — owner lock + audit; see `M18-LOCK-AUDIT.md`
