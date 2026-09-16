## Lock audit: through M16

**Trigger:** Owner — “Lock and audit M16 and aprooce M17”  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15 · M16  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e via `pnpm start`.
2. **Public live URL / packaging** still deferred.
3. **Hosted embeddings / pgvector** deferred — M16 uses local TF-IDF by design.

### LOW / deferred

- Signal (M17) · Fork / Ending Signal · CSP → M24

### Solid

**M0–M15** — prior lock audits hold.  
**M16** — Semantic fallback: derived docs + hash gate; deterministic-first; provider-fail fallback; ASK RUNTIME “not proof” labeling; ADR 0018; 228 unit tests at ship.

### Cross-cutting

- Recruiter path ungated; search/semantic optional.
- Weak states still honest through deterministic + semantic hits.
- Scope validator still blocks Signal/Fork until M17 unlock.

### Commands run

- `pnpm run ci` → OK at M16 ship (228 tests + build)
- ASK RUNTIME e2e (incl. semantic) → OK

**Lock hygiene:** Clean

**Next:** M17 — Signal Orchestrator (owner approved in same message).
