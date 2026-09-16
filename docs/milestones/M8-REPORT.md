## Milestone report: M8 — Source Trace Mode

**Scope approved:** Owner — “Go on next” (Approve M8 after M7 lock)

**Implemented:**

- `resolveSourceTrace` / lab PSI·KS helpers (`src/lib/evidence/source-trace.ts`)
- `SourceTraceProvider`, trigger, drawer, decorative viewport line
- Project evidence section with Trace source on nodes that have sources
- Lab **Trace PSI** / **Trace KS** wired into `/labs/mlops`
- Escape / Close / backdrop dismiss; mobile + reduced-motion hide the line
- ADR 0010

**Tests added/updated:**

- `source-trace.test.ts` — resolve + reject empty/unknown; lab fingerprints match graph
- `source-trace-drawer.test.tsx` — open panel with SHA, Escape/Close
- `work/[slug]/page.test.tsx` — Trace source triggers on project page
- `mlops-lab.test.tsx` — Trace PSI drawer path + commit

**Test status:** **115 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**Truth / privacy notes:** No invented paths; panel authoritative; line decorative only

**Status:** Locked (owner — 2026-09-15)

**Lock audit:** `docs/milestones/M8-LOCK-AUDIT.md`
