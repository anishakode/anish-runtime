## Lock audit: through M20

**Trigger:** Owner — “yes next” (lock M20 + continue)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15 · M16 · M17 · M18 · M19 · M20  
**Generated:** 2026-09-16

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e on push.
2. **Public live URL / packaging** deferred (M24–M26).
3. **Hosted LLM / pgvector** deferred by design; Signal + Fork extraction stay local-deterministic.

### LOW / deferred

- Interview My Work (M21) · Under the Surface · Ending Signal
- Steward / Malware X-Ray depth · CSP hardening → M24

### Solid

**M0–M19** — prior audits hold. Recruiter path (Work / Experience / About / CV / Contact) still reachable with JS-only features off; Evidence Graph remains the single truth owner; Signal never upgrades evidence state; Recompile is consent-gated and presentation-only.

**M20** — JD sanitize strips sensitive criteria before any matching; extraction is deterministic; classification maps to VERIFIED · PROFESSIONAL · LIMITED · NOT_DEMONSTRATED with semantic-only hits capped below VERIFIED; gaps render as first-class output; no fit score, no hiring language, no JD persistence; integrity manifest shows 0 claim/state changes; ADR 0022; `/fork` is an additive affordance, primary nav unchanged.

### Cross-cutting

- Fork does not gate or reorder canonical routes; it builds a temporary branch only.
- `src/features/fork` stays forbidden (scope validator); Fork ships under `src/lib/fork` + `src/app/fork`.
- Weak evidence states pass through Fork unchanged — no upgrade path exists in `classify.ts`.
- Footer + milestones → locked through M20.

### Commands run

- `pnpm run ci` → OK at M20 ship
- Scope validator → OK

**Lock hygiene:** Clean

**Next:** M21 — Interview My Work (owner continued with “yes next”).
