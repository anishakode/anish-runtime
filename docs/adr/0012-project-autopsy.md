# ADR 0012 — Project Autopsy as flagship inspection grammar

## Status

Accepted (M10)

## Context

Flagship pages need a stable inspection system (handoff lenses) rather than a single long narrative. M8/M9 already provide Source Trace and Reversible Architecture. Runtime Lab state must not be wiped merely by switching inspection perspectives.

## Decision

- Six lenses: STORY · RUN · X-RAY · DECISIONS · FAILURES · EVIDENCE
- Default lens STORY (recruiter-readable without lab/AI)
- Keep all lens panels mounted (`hidden` when inactive) so RUN (`MlopsLab`) and X-RAY scrubber state survive switches
- MLOps-only mount for V1; other flagships wait for graph-backed content
- FAILURES stays empty via `ev.boundary.failure-museum-empty` (NOT_DEMONSTRATED)
- DECISIONS are graph-sourced claims with Source Trace — not invented post-mortems
- Dedicated `/labs/mlops` remains available; Autopsy RUN is the state-preserving path

## Consequences

- Establishes interaction grammar for later Signal / Fork surfaces
- X-RAY reuses M9; deeper layer isolation deferred to M11
