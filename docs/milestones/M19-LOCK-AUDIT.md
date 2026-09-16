## Lock audit: through M19

**Trigger:** Owner — “next” (lock M19 + continue)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15 · M16 · M17 · M18 · M19  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e.
2. **Public live URL / packaging** deferred (M24–M26).
3. **Hosted LLM / pgvector** deferred by design.

### LOW / deferred

- Fork Anish (M20) · Interview · Under the Surface · Ending Signal
- Steward / Malware X-Ray depth · CSP → M24

### Solid

**M0–M18** — prior audits hold; recruiter path ungated; Signal + compose honest.  
**M19** — Distinct-item session trace; consent Recompile; presentation-only reorder; RESET; ADR 0021; 270 unit tests at ship.

### Cross-cutting

- Recompile does not gate Work / Experience / About / CV / Contact.
- Ending Signal still forbidden; Fork unlocked for M20 under `src/lib/fork` / app route (not `src/features/fork`).
- Weak states unchanged by session reorder.
- Footer + milestones → locked through M19.

### Commands run

- `pnpm run ci` → OK at M19 ship
- Scope validator → OK

**Lock hygiene:** Clean

**Next:** M20 — Fork Anish (owner continued with “next”).
