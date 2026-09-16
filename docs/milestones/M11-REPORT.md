## Milestone report: M11 — Project X-Ray

**Scope approved:** Owner — “next” (Approve M11)

**Implemented:**

- `src/lib/xray/` layer model + graph-backed MLOps views
- `ProjectXray` UI: isolate / select / related / Trace
- Wired into Autopsy X-RAY with M9 causal panel below
- ADR 0013

**Tests added/updated:**

- `layers.test.ts` — layers, drift/stats paths, anti-Redis/MLflow
- `project-xray.test.tsx` — select + Trace + isolate
- `work/[slug]/page.test.tsx` — X-RAY lens surfaces X-Ray + M9

**Test status:** **142 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**Truth notes:** No invented infra; PORTFOLIO_EXTENSION on boundary lab component

**Status:** Locked (owner — 2026-09-15)

**Lock audit:** `docs/milestones/M11-LOCK-AUDIT.md`

**Known gaps / deferred (post gap-fix):**

- Local `pnpm run ci` still omits Playwright browsers (GHA runs e2e)
- Empty-nodes UI branch + invalid-slug unit remain thin (404 covered in e2e)
- Live URL / public packaging; Signal · Fork · Ending Signal; Steward/Malware labs; CSP → M24
- Corner HIGH/MEDIUM items closed in gap-fix (deep-links, aria-hidden, nested Trace, tab keyboard, drawer focus, scope REQUIRED, footer, Autopsy/X-Ray e2e) — see `M11-CORNER-AUDIT.md`
