# ADR 0016 — Failure Museum evidence gate (empty by design)

## Status

Accepted (M14)

## Context

Handoff M14 requires a Failure Museum that does not fabricate outages or remembered metrics. Strong candidate stories exist historically, but original artifact-grade proof is insufficient. Constitution: **proof outranks narrative quality**.

## Decision

- Strict exhibit schema in `src/lib/failures/` with artifact fingerprints (SHA-pinned GitHub or public report/artifact URL)
- Publication gate rejects incomplete / NOT_DEMONSTRATED / PORTFOLIO_EXTENSION published exhibits
- Canonical exhibit dataset is **empty** (`CANONICAL_FAILURE_EXHIBITS = []`)
- `/failures` + Autopsy FAILURES lens share `FailureMuseum` UI; future exhibit renderer is ready
- Recruiter primary nav unchanged — museum is an optional evidence surface

## Consequences

- Visitors see an honest empty museum and the publication requirements
- Future exhibits can publish only when they clear the gate; no silent story inventing
- Search / Signal remain later milestones
