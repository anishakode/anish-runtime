# ADR 0017 — Deterministic ASK RUNTIME evidence search

## Status

Accepted (M15)

## Context

Handoff M15 requires evidence search before any generative Signal layer. Retrieval must stay diagnostic (not chat) and must never upgrade evidence strength.

## Decision

- Build a flat search index from the canonical Evidence Graph (`buildSearchIndex`)
- Rank: exact title → exact alias → prefix → keyword/token → bounded typo (edit distance ≤1 for tokens length ≥4)
- UI: header **ASK RUNTIME** + ⌘/Ctrl+K dialog; results show honest EvidenceBadge states
- Gap notice when nothing matches — no invented professional facts
- Defer semantic/vector retrieval to M16; Signal remains M17+

## Consequences

- Recruiters can inspect graph entities without AI
- Semantic similarity cannot silently promote LIMITED / NOT_DEMONSTRATED claims
- Index is derived at request/render time from the repo graph (no separate truth store)
