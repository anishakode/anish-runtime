# ADR 0001 — Repository Foundation

## Status

Accepted (M0) — pending owner lock

## Context

ANISH // RUNTIME requires a serious engineering baseline before any portfolio WOW features. The handoff forbids shipping product interaction before foundation (tooling, tests, CI, evidence skeleton, agent contract).

## Decision

- Next.js App Router + React + TypeScript (strict)
- pnpm as sole package manager (`packageManager` field)
- Tailwind CSS v4 + PostCSS for design tokens later
- ESLint (next) + Prettier
- Vitest + React Testing Library for unit/component tests
- Playwright desktop + mobile matrix scaffold + axe-core smoke
- Security headers + CSP baseline in `next.config.ts`
- Zod-validated evidence graph **skeleton** only (full corpus = M1)
- ADR folder + planning notes + scope validator
- Minimal identity placeholder page (no RUN ANISH / labs / Signal)

## Consequences

- Product features must arrive via approval-gated milestones
- Scope validator fails CI if early WOW paths appear prematurely
- Visual system (Instrument Sans, full Editorial Lab) deferred to M3
