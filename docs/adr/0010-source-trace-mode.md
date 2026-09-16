# ADR 0010 — Source Trace Mode (panel authoritative)

## Status

Accepted (M8)

## Context

Claims and lab metrics need direct provenance inspection without inventing paths or treating SVG connectors as proof. The Evidence Graph already holds type/repo/path/SHA; M5–M7 lab surfaces already cite drift.py / stats.py.

## Decision

- `SourceTraceProvider` + reusable trigger + drawer as the interaction surface
- Resolve traces from graph-backed `TraceSourceView` (server) or lab helpers that must match graph fingerprints
- Drawer lists exact sources with immutable commit SHA when present; Escape / backdrop / Close dismiss
- Viewport connector line is progressive enhancement only — hidden on mobile and `prefers-reduced-motion`
- On-page source list remains available; drawer can jump to a list anchor

## Consequences

- Provenance inspection is interactive without gimmick dependency on the line
- M9 architecture stages can reuse the same trigger/drawer contract
