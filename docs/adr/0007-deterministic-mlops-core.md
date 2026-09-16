# ADR 0007 — Deterministic MLOps core before lab UI

## Status

Accepted (M5)

## Context

Handoff requires real math (seeded RNG, histograms, PSI, KS, missingness, range quality, state machine, alert cooldown, scenarios) before the inspectable Runtime Lab UI (M6). Public evidence pins `drift.py` / `stats.py` at commit `a2ba6fc…`. Labs must be labeled `PORTFOLIO_EXTENSION` — not production telemetry.

## Decision

Ship M5 as a TypeScript library under `src/lib/mlops/`:

- PSI / classify thresholds aligned with pinned `drift.py`
- KS D / severity aligned with pinned `stats.py` (including source tie-break behavior)
- Seeded Mulberry32 sampling, histograms, quality metrics, monitor state machine, alert cooldown, scenario runners
- Explicit Source Trace IDs + boundary notice constants
- No lab routes or `src/components/labs` UI (deferred to M6)

## Consequences

- M6 can import the same core without reimplementing metrics
- Tests lock algorithm parity and scenario determinism
- Recruiters still use Work / Experience without labs
