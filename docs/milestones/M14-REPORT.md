## Milestone report: M14 — Failure Museum Evidence Gate

**Scope approved:** Owner — “yes move on to next one” (Lock M13 + Approve M14)

**Implemented:**

- M13 locked + cumulative audit (`M13-LOCK-AUDIT.md`); footer → M13
- `src/lib/failures/` — strict exhibit schema, publication gate, empty canonical dataset, museum projection
- `FailureMuseum` UI + `/failures` route; Autopsy FAILURES lens shares the museum
- Future exhibit renderer ready (fixture-covered); **0 published exhibits** by design
- ADR 0016; validate-scope REQUIRED pins; `/llms.txt` discovers `/failures`

**Tests added/updated:**

- `schema.test.ts` — reject incomplete / unpinned / bad metric cites; accept complete fixture
- `gate.test.ts` — canonical length 0; gate rejects fabrications; museum publishedCount 0
- `failure-museum.test.tsx` / `failures/page.test.tsx` — empty UI + renderer path
- Autopsy FAILURES → `/failures`; e2e empty museum; footer lock → M13

**Test status:** **201 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**Truth / privacy notes:** Empty museum preferred over fabricated stories; no invented outage theatre; recruiter nav unchanged

**Known gaps / deferred:** Real exhibits when artifact-grade proof exists; Search (M15); Signal (M17+)

**Locked:** 2026-09-15 — owner hard-look + lock; see `M14-LOCK-AUDIT.md`
