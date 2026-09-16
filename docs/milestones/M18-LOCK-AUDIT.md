## Lock audit: through M18

**Trigger:** Owner — “Yes go with it” (lock M18 + proceed M19)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15 · M16 · M17 · M18  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e via `pnpm test:e2e`.
2. **Public live URL / packaging** still deferred (M24–M26).
3. **Hosted LLM planner / pgvector** deferred — deterministic compose + local TF-IDF by design.

### LOW / deferred

- Signal Recompile (M19) · Fork · Interview · Under the Surface · Ending Signal
- Steward / Malware X-Ray depth
- CSP → M24

### Solid

**M0–M17** — prior lock audits hold; recruiter path ungated; labs honest; Signal tool-orchestrated.  
**M18** — Constrained `ui_plan`; graph rehydration; full fallback (no partial generative UI); `SignalComposedView` in ASK RUNTIME; ADR 0020; 260 unit tests at ship.

### Cross-cutting

- Composer does not gate Work / Experience / About / CV / Contact.
- Fork / Ending Signal paths still forbidden in scope validator.
- Weak states pass through composed blocks unchanged.
- Footer + milestones table → locked through M18.

### Commands run

- `pnpm run ci` → re-verified at M18 lock hygiene
- Scope validator → OK

**Lock hygiene:** Clean

**Next:** M19 — Signal Recompile (owner approved in same message).
