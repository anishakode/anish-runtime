## Milestone report: M20 — Fork Anish

**Scope approved:** Owner — “next” (lock M19 + continue to M20)

**Implemented:**

- JD sanitize (sensitive lines stripped) → deterministic requirement extraction → evidence retrieve → classify
- Classifications: VERIFIED · PROFESSIONAL · LIMITED · NOT_DEMONSTRATED
- Semantic-only matches cannot become VERIFIED; gaps stay visible
- Integrity manifest (0 claim/state changes; fit score not generated; no JD/branch persistence)
- `/fork` UI + header FORK ANISH affordance; primary nav unchanged
- ADR 0022; `src/features/fork` remains unused (forbidden fragment removed for ending-signal only)

**Tests added/updated:**

- `src/lib/fork/fork.test.ts`
- `src/components/fork/fork-anish.test.tsx`
- `src/app/fork/page.test.tsx`
- `e2e/home.spec.ts` Fork path
- Catalog + `pnpm test:status`

**Test status:** 280 passed / 0 failed — see `docs/testing/TEST-STATUS.md`

**Validation run:** `pnpm run ci`

**A11y / mobile / reduced-motion:** Form + results lists; keyboard buttons; no motion dependency

**Truth / privacy notes:** No fit/hiring language; JD not persisted; evidence states pass through; honesty line shown

**Known gaps / deferred:** Optional LLM extraction wrapper; Interview (M21); Under the Surface; Ending Signal

**Ask:** Lock M20? (yes/no)

**Owner decision:** Locked — “yes next” (2026-09-16). See `docs/milestones/M20-LOCK-AUDIT.md`.
