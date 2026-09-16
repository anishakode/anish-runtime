## Lock audit: through M14

**Trigger:** Owner — “is everything okay have a hard look and lock”  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None remaining._ (Fixed during this audit before lock.)

1. **E2E strict-mode flakes on recruiter home/work** — footer text duplicated positioning string; Autopsy also titled “MLOps Governance…”; `radio.check()` blocked by chip label; CV primary CTA collided with nav CV. **Fixed** in `e2e/home.spec.ts` (exact text, level-1 heading, label click, `#main` CV scope). Verified green desktop + mobile.

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e via `pnpm start`.
2. **Public live URL / packaging** still deferred.
3. **Autopsy FAILURES** always projects `publishedCount: 0` from the empty-museum bundle contract — correct for M14; revisit when real exhibits publish.

### LOW / deferred

- Search (M15) · Semantic retrieval (M16) · Signal / Fork / Ending Signal · CSP → M24
- Real Failure Museum exhibits when artifact-grade proof exists

### Solid

**M0–M13** — prior lock audits hold (recruiter path, Evidence Graph, three Runtime Labs, Autopsy/X-Ray, Source Trace, Malware pinned math).  
**M14** — Failure Museum evidence gate: empty canonical set; schema rejects incomplete/unpinned/fabricated publishes; `/failures` + Autopsy FAILURES; future renderer fixture-covered; ADR 0016; client Autopsy does not import `node:fs` (presentational museum + server/page loader).

### Cross-cutting

- Scope validator still blocks Signal/Fork; REQUIRED pins M14 entry files.
- Weak states + empty museum honesty intact (`NOT_DEMONSTRATED`, `PORTFOLIO_EXTENSION`, `LIMITED_EVIDENCE`).
- Recruiter nav ungated (Work · Experience · About · CV · Contact) — Failures is optional.
- **201 unit tests** green (`pnpm run ci`); e2e smoke for home/utility/20 SEC/labs/failures/footer green after audit fixes.

### Commands run

- `pnpm run ci` → OK (scope · evidence · format · lint · typecheck · test:status · build)
- Playwright targeted smoke (identity · utility · 20 SEC · Failure Museum · footer · labs) → OK after e2e hardening

**Lock hygiene:** Clean

**Next:** Propose M15 — Deterministic Evidence Search (approval-gated; do not start until Approve M15).
