# ADR 0008 — MLOps Live Lab as inspectable PORTFOLIO_EXTENSION

## Status

Accepted (M6)

## Context

M5 shipped deterministic math. Handoff M6 requires exposing that core as an inspectable Runtime Lab with SHIFT / INJECT MISSING / RESET, accessible histogram tables, detector-disagreement lens, and evidence/source boundary — without fake Grafana or production telemetry. Recruiter path must not require the lab.

## Decision

- Route: `/labs/mlops` (optional enhancement)
- Client `MlopsLab` driven by pure `lab-session` helpers over M5 metrics
- Always-visible `PORTFOLIO_EXTENSION` boundary + Source Trace to pinned `drift.py` / `stats.py`
- Link from MLOps project page; primary nav stays Work · Experience · About · CV · Contact
- Unlock `src/components/labs` in scope validator; keep Signal/Fork forbidden

## Consequences

- M7 can compose BREAK THE SYSTEM on the same session helpers
- Lab failure does not block recruiter utility routes
