# ADR 0013 — Project X-Ray responsibility layers

## Status

Accepted (M11)

## Context

Autopsy X-RAY previously reused M9 causal reconstruction. Handoff M11 requires layer isolation, component selection, relationship highlighting, evidence-state inspection, and Source Trace — without inventing Redis/MLflow or fake production service maps.

## Decision

- Pure layer model in `src/lib/xray/` mapped only to Evidence Graph sources
- Four MLOps layers: Boundary · Observability · Detection · Governance
- UI: isolate layer, select component, show related labels, Trace via M8 drawer
- Semantic ordered list is authoritative; dimming is progressive enhancement
- Keep M9 `ReversibleArchitecture` as a secondary “Causal reconstruction” panel under X-Ray
- Mount through Autopsy X-RAY lens (keep-mounted)

## Consequences

- Deepens flagship inspection without architecture theatre
- Steward/Malware X-Ray remain deferred until those labs/content exist
