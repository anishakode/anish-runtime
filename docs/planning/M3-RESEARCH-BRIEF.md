# Research brief — M3 Visual System

**Question:** Keep the locked M3 proposal as-is, or adjust scope/approach before approval?

**Date:** 2026-09-14

## Sources

- Canonical: `ANISH_RUNTIME_MASTER_HANDOFF.md` §6 Visual Identity (Digital Research Laboratory / Editorial Lab / Active Instrument; Instrument Sans + IBM Plex Mono)
- [Instrument Sans — Google Fonts](https://fonts.google.com/specimen/Instrument+Sans)
- [Instrument Sans — GitHub (Instrument)](https://github.com/Instrument/instrument-sans)
- [How to Create an Accessible Design System in 60 Days (Code and Theory / ETS)](https://medium.com/code-and-theory/how-to-create-an-accessible-design-system-in-60-days-42a02e536900) — semantic tokens, contrast pairings, fluid type, reduced-motion
- [Calcite Design System — Accessibility](https://developers.arcgis.com/calcite-design-system/foundations/accessibility/) — forced-colors, reduced-motion, color≠only cue
- [PatternFly high-contrast handbook](https://github.com/patternfly/patternfly-org/blob/5b0af8a937db90956b4212f185d35914e66f572a/packages/documentation-site/patternfly-docs/content/foundations-and-styles/styles/theming/high-contrast-handbook.md) — `prefers-contrast` / `forced-colors` token patterns
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) — screenshot baselines are OS/browser-sensitive
- Market signal: cyberpunk/neon/terminal portfolios remain common costume (Dribbble/X/templates) — already forbidden by RUNTIME constitution

## Patterns found

1. **Tokens before themes** — semantic pairs (`surface` / `on-surface`, `outline`, state tokens) with contrast tested as pairs, not isolated hex values.
2. **Typography as system** — purpose-named styles (heading/body/mono), not HTML-tag-tied; fluid/`rem`-friendly sizing.
3. **A11y is part of the visual system** — reduced-motion, forced-colors, visible focus, never status-by-color-alone.
4. **Editorial / research / instrument aesthetics beat “dev portfolio clichés”** for a proof-first product (aligns with handoff).
5. **Pixel visual regression is fragile across OS** — CI (Linux) baselines ≠ Windows local; contract tests + limited CI screenshots are safer than heavy golden-image suites early.

## Anti-patterns to reject

- Neon cyberpunk, terminal-first, purple SaaS gradients, glow stacks
- Dark-mode-default “AI product” look (handoff Editorial Lab = paper/ink/graphite)
- Full Active Instrument lab chrome before labs exist (premature WOW costume)
- Badge colours without text labels / forced-colors borders
- Promising exhaustive cross-OS screenshot parity in M3

## RUNTIME-native options

| Option                                      | Pros                                                    | Cons                                                                          |
| ------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| A. Ship M3 proposal unchanged               | Matches handoff list                                    | “Active Instrument primitives” can over-build; VR contract easy to over-scope |
| B. M3 with scoped adjustments (recommended) | Same aesthetic; clearer boundaries; stronger a11y/tests | Slightly tighter wording vs handoff bullet list                               |
| C. Skip M3 / fold into M4                   | Faster to cinematic                                     | Utility shell stays system-font generic; M4 becomes noisier                   |

## Recommendation

**Option B — go ahead with M3, with small proposal changes (not a different milestone).**

Direction is already correct and constitution-locked. Current CSS is a stub (4 tokens + system fonts) — M3 is necessary before landing/labs.

### Adjustments to bake into approval

1. **Editorial Lab first** — apply full visual system to utility routes. Active Instrument = **token + primitive hooks only** (mono labels, stateful borders), not lab UIs.
2. **Semantic token architecture** — surface/ink/muted/stroke + evidence-state tokens with WCAG AA contrast checks in unit tests.
3. **Fonts** — Instrument Sans + IBM Plex Mono via `next/font` (confirmed available).
4. **Evidence badges** — keep text labels; add forced-colors/visible borders; optional short state legend on Work/Experience.
5. **Visual-regression contract** — primarily CSS/token contract tests + 1–2 Playwright screenshots on **CI Linux only**; do not block M3 on local Windows pixel parity.
6. **Stay light-first paper/ink** — no dark-default theme in M3.
7. **Out of scope remains** — M3.5 `/evidence.json`, M4 RUN ANISH, labs/Signal.

## Needs owner approval before

Implementing any M3 product/visual code. Reply to revised proposal below.
