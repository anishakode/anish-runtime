## Milestone report: M9 — Reversible Architecture

**Scope approved:** Owner — “Lets go next and see if we want anything to be included to improve the project”

**Improvements included (M9-native):**

1. Reality labels per stage (portfolio simulation vs public code verified)
2. Source Trace on stages including detection + governance (audit/policy), not only PSI/KS
3. Text-first cumulative map (authoritative); scrubber + Previous/Next

**Deferred (not in M9):** Steward/Malware architecture, Project Autopsy lenses, Signal, missingness-file Trace without graph sources

**Implemented:**

- `src/lib/architecture/stages.ts` + `build-views.ts`
- `ReversibleArchitecture` client UI
- Mounted on MLOps work page; lab link to `#reversible-architecture`
- ADR 0011

**Tests added/updated:**

- `stages.test.ts` — order, clamp, cumulative reveal, graph source wiring, anti-Grafana
- `reversible-architecture.test.tsx` — nav, Trace drawer, map text
- `work/[slug]/page.test.tsx` — mount / non-mount
- `labs/mlops/page.test.tsx` — architecture link

**Test status:** **128 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**Truth / privacy notes:** No fake history; PORTFOLIO_EXTENSION on boundary; no invented telemetry

**Status:** Locked (owner — 2026-09-15)

**Lock audit:** `docs/milestones/M9-LOCK-AUDIT.md`
