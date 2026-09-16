# ADR 0002 — Evidence Graph as Canonical Truth

## Status

Accepted (M1) — pending owner lock

## Context

UI, AI, and labs must not invent professional facts. M0 only shipped a skeleton. M1 establishes the authoritative Evidence Graph before utility routes (M2) or WOW features.

## Decision

- Canonical corpus lives under `content/evidence/` as versioned JSON fragments
- Zod schema + loader live under `src/lib/evidence/` with referential integrity checks
- Evidence states are explicit and never silently upgraded
- GitHub flagship sources prefer immutable commit SHAs
- Owner-confirmed Cardstack metrics remain non-public-code
- Portfolio Runtime Lab is `PORTFOLIO_EXTENSION`
- Exclusions block obsolete email and conflicting profiles

## Consequences

- Later milestones must rehydrate claims from this graph
- `/evidence.json` public projection (M3.5) will be derived, not authored by hand as truth
- Expanding claims requires owner change control and evidence artifacts
