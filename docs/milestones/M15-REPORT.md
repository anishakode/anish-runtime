## Milestone report: M15 — Deterministic Evidence Search

**Scope approved:** Owner — “yes lets go next” (Approve M15 after M14 lock)

**Implemented:**

- `src/lib/search/` — graph index + ranking (exact → alias → prefix → keyword → typo)
- Header **ASK RUNTIME** + ⌘/Ctrl+K diagnostic dialog (not chat)
- Honest EvidenceBadge on hits; gap notice on miss; no evidence-state upgrades
- ADR 0017; validate-scope pins; `/llms.txt` discovery note

**Tests added/updated:**

- `rank.test.ts` — ranking tiers, typo bounds, empty/unknown, LIMITED/NOT_DEMONSTRATED
- `ask-runtime.test.tsx` — dialog, hits, gap, Escape, Ctrl+K
- e2e ASK RUNTIME smoke

**Test status:** **218 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**Truth / privacy notes:** Search is diagnostic only; session-only UI state; no query persistence

**Known gaps / deferred:** Semantic retrieval (M16); Signal (M17+)

**Locked:** 2026-09-15 — owner “lets go next”; see `M15-LOCK-AUDIT.md`
