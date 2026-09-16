# ANISH // RUNTIME

**An executable professional identity.**

This repository is a from-scratch rebuild guided by `ANISH_RUNTIME_MASTER_HANDOFF.md` and `AGENTS.md`.

## Current milestone

**Next:** M25 — Evidence Freeze (awaiting approval)

Locked: M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 ·
M14 · M15 · M16 · M17 · M18 · M19 · M20 · M21 · M22 · M23 · M24.

M24 closes the V1 feature arc: security headers and CSP, API request bounds, fault
boundaries, bundle budgets, an accessibility audit, and the indexing policy. Status per
milestone lives in `docs/planning/milestones.md`.

## Prerequisites

- Node.js 22+
- pnpm 12.3.4+ (`corepack enable` recommended)

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:status
pnpm test:e2e
pnpm test:e2e:prod   # e2e against a production build — the only run that asserts CSP,
                     # security headers, and the noindex policy
pnpm validate:scope
pnpm validate:evidence
pnpm check:bundle    # gzip first-load JS per route; fails on regression
pnpm run ci          # scope · evidence · format · lint · typecheck · unit · build · bundle
pnpm run ci:full     # the above plus production e2e
```

## Agent contract

See `AGENTS.md` and `.cursor/skills/`. All milestones are owner approval-gated.
