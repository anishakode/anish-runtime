## Lock audit: through M17

**Trigger:** Owner locked M17 (`yes`)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15 · M16 · M17  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e via `pnpm start` / `pnpm test:e2e`.
2. **Public live URL / packaging** still deferred.
3. **Hosted LLM planner** deferred — M17 ships deterministic tool orchestration by design.
4. **Hosted embeddings / pgvector** deferred — M16 local TF-IDF still in force.

### LOW / deferred

- Adaptive Evidence Composer / `ui_plan` (M18)
- Signal Recompile · Fork · Interview · Ending Signal
- CSP → M24

### Solid

**M0** — Scope/CI/tooling; Fork + Ending Signal still forbidden in validator.  
**M1** — Evidence graph validate OK (10 projects / 40 nodes / 23 sources); exclusions intact.  
**M2** — Recruiter nav Work · Experience · About · CV · Contact ungated.  
**M3 / M3.5** — Editorial Lab + `/evidence.json` derived projection.  
**M4** — Home runtime / RUN ANISH contracts covered in unit + e2e suites.  
**M5–M7** — MLOps core + live lab + BREAK/RECOVER.  
**M8–M11** — Source Trace · Reversible Architecture · Autopsy · X-Ray.  
**M12–M13** — Steward + Malware labs; PORTFOLIO_EXTENSION / LIMITED_EVIDENCE honesty.  
**M14** — Empty Failure Museum gate.  
**M15–M16** — ASK RUNTIME deterministic + semantic “not proof”.  
**M17** — Allowlisted Signal tools; exposed-ID session; INTERPRET WITH SIGNAL; gap notice; ADR 0019; `POST /api/signal/interpret`; 248 unit tests at lock.

### Cross-cutting

- Later Signal work did not gate recruiter routes; ASK RUNTIME remains optional.
- No `ui_plan` / composer / Fork / Ending Signal paths present.
- Weak evidence states still pass through search + Signal cards unchanged.
- Footer + milestones table updated to locked through M17.
- Test suite matches introduced Signal behavior (unit + API + ASK RUNTIME + e2e assertions).

### Commands run

- `pnpm run ci` → OK (248 unit tests + build; `/api/signal/interpret` dynamic route present)
- Scope validator → OK (Signal required; Fork/Ending blocked)

**Lock hygiene:** Clean

**Next:** Propose M18 — Adaptive Evidence Composer (approval-gated).
