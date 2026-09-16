## Lock audit: through M15

**Trigger:** Owner — “lets go next” (Lock M15 + continue to M16)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e via `pnpm start`.
2. **Public live URL / packaging** still deferred.

### LOW / deferred

- Semantic retrieval (M16) · Signal / Fork / Ending Signal · CSP → M24

### Solid

**M0–M14** — prior lock audits hold.  
**M15** — ASK RUNTIME deterministic search: graph index, ranked retrieval, honest badges, gap notice, ⌘/Ctrl+K; ADR 0017; 218 unit tests at ship.

### Cross-cutting

- Scope validator blocks Signal/Fork; REQUIRED pins M15 search entry files.
- Recruiter nav ungated; ASK RUNTIME is optional enhancement.
- Weak evidence states remain visible through search hits.

### Commands run

- `pnpm run ci` → OK at M15 ship (218 tests + build)
- ASK RUNTIME e2e smoke → OK

**Lock hygiene:** Clean

**Next:** M16 — Semantic Evidence Retrieval (owner continued with “lets go next”).
