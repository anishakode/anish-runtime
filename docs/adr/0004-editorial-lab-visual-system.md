# ADR 0004 — Editorial Lab visual system before cinematic behavior

## Status

Accepted (M3)

## Context

M2 shipped a recruiter-useful utility shell with a stub visual layer (few CSS variables + system fonts). Handoff requires a Digital Research Laboratory identity — Editorial Lab for conventional pages — before RUN ANISH / labs. Market research confirmed: semantic tokens, contrast pairs, forced-colors/reduced-motion, and anti-cyberpunk direction. Full Active Instrument chrome before labs would be costume.

## Decision

Ship M3 as Editorial Lab applied to existing utility routes:

- Semantic tokens (`surface` / `on-surface` / evidence-state pairs)
- Instrument Sans + IBM Plex Mono via `next/font`
- Badge text labels + evidence legend (colour never sole cue)
- Print, reduced-motion, prefers-contrast, forced-colors, visible focus
- Active Instrument = mono/`instrument-label` hooks only
- Visual contract tests (token presence + WCAG AA contrast math); limited screenshot VR deferred to CI discretion

Light paper/ink first. No dark-default theme. No labs/Signal/M4.

## Consequences

- Utility routes gain coherent brand without new product features
- Later Active Instrument UIs can reuse tokens
- Contrast pairs must stay in sync between `globals.css` and `src/lib/visual/tokens.ts`
