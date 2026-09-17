# ADR 0006 — Landing compilation as progressive enhancement

## Status

Accepted (M4)

## Context

Handoff WOW 1 requires the portfolio to “build itself” via RUN ANISH without becoming terminal-first or particle theatre. Recruiter path must remain readable before interaction. Research confirmed Skip / Escape / `prefers-reduced-motion` → final state, with mobile preferring stacked semantics over constellation geometry.

## Decision

Ship M4 as a client `HomeRuntime` on `/`:

- Idle landing remains graph-backed identity + recruiter CTAs
- Journey presets: 20 SEC / 2 MIN (default) — settled layout differs by preset
  (flagship count, constellation, primary CTA) while remaining graph-backed.
  A third EXPLORE preset was shipped at M4 but was identical to 2 MIN in settled
  layout; removed in ADR 0030 so the picker only offers a real choice.
- Compilation: four semantic steps (identity → capabilities → evidence → projects)
- Settled runtime: system-ready, CSS capability constellation (stacked on small viewports), canonical counts, flagship links, CV/contact, reset
- Native radio journey controls; Skip button + Escape during compile; reduced motion settles immediately; focus handoff to ready heading
- Capabilities and counts derived only from the Evidence Graph

No fake terminal. No particle/WebGL spectacle. No labs/Signal.

## Consequences

- Home becomes the first signature WOW without gating utility routes
- Later labs can link from settled flagships without changing M4 contracts
- Motion and keyboard contracts are tested; e2e covers skip/reset
