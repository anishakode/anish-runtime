## Milestone report: M19 — Signal Recompile

**Scope approved:** Owner — “Yes go with it” (lock M18 + proceed M19)

**Implemented:**

- In-memory session trace (distinct item ids); path visits + Signal evidence feed
- Deterministic heuristic: ≥4 distinct interactions, ≥60% leading share, clear winner, ≥2 supporting items
- Consent UI: SIGNAL DETECTED / SESSION ONLY · RECOMPILE · NOT NOW · WHY?
- On consent: reorder Home flagships/capabilities + Work tier lists; RESET restores general view
- Never auto-recompiles; never mutates evidence states or nav; no persistent profile
- ADR 0021; scope validator requires session modules

**Tests added/updated:**

- `src/lib/session/session.test.ts` — distinct collapse, thresholds, lean detect, reorder
- `src/components/session/recompile-banner.test.tsx` — consent / dismiss / WHY / RESET
- `e2e/home.spec.ts` — ML lean → recompile → reset
- Catalog + `pnpm test:status`

**Test status:** 270 passed / 0 failed — see `docs/testing/TEST-STATUS.md`

**Validation run:** `pnpm run ci`

**A11y / mobile / reduced-motion:** Banner is text/button chrome; WHY expands disclosure; no motion dependency

**Truth / privacy notes:** Session-only React memory; WHY lists unused data (no demographics/persistent profile); presentation order only

**Known gaps / deferred:** Fork (M20); Interview; Under the Surface; Ending Signal; server-side session; hosted LLM

**Locked:** 2026-09-15 — owner lock + audit; see `M19-LOCK-AUDIT.md`
