# ADR 0011 — Reversible Architecture as reasoning reconstruction

## Status

Accepted (M9)

## Context

Visitors need causal architecture inspection for MLOps Governance without inventing a fake v0→v1 timeline or production infra diagrams. M8 already provides Source Trace. Handoff M9 requires five stages, scrubber, cumulative map, mobile text, and honesty labels.

## Decision

- Pure stage model in `src/lib/architecture/` mapped only to existing Evidence Graph node/source ids
- UI: Previous/Next + range scrubber + text-first cumulative map (visual accent is PE)
- Reality labels: `PORTFOLIO_SIMULATION` vs `PUBLIC_CODE_VERIFIED` per stage
- Reuse M8 Source Trace drawer for stage claims (including audit/policy/drift sources)
- Mount under Autopsy **X-RAY** on `/work/mlops-governance-dashboard` (keep-mounted with Project X-Ray)
- Lab deep links: `#project-xray` or `#reversible-architecture` open the X-RAY lens so the causal panel is visible
- Explicit product copy: “Architecture reasoning reconstruction”

## Consequences

- Architecture depth without Autopsy lenses (M10) or Signal
- Monitoring stage stays repo-sourced — no invented Grafana
