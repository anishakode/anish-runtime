# ADR 0021 — Signal Recompile (consent-based session adaptation)

## Status

Accepted (M19)

## Context

Handoff M19 requires consent-based personalization from deterministic session evidence. Categories are AI ENGINEERING, ML ENGINEERING, and SOFTWARE + CLOUD. Recompile may change presentation relevance only — never evidence states, claims, or persistent profiles.

## Decision

- In-memory session trace (React context); distinct item ids only — repeated clicks cannot fake interest
- Heuristic: ≥4 distinct interactions, ≥60% leading share, clear winner, ≥2 supporting items
- Explicit UI: SIGNAL DETECTED / SESSION ONLY with RECOMPILE · NOT NOW · WHY? — never auto-recompile
- On consent: reorder Home flagships/capabilities and Work tier lists; RESET restores general view
- Path visits (projects, labs, Experience, CV) and Signal evidence ids feed the trace
- No OpenAI call; no server-side visitor profile; no deletion of projects or nav changes

## Consequences

- Session arc for M20–M23 has a real interaction ledger
- Recruiter path remains ungated without Recompile
- WHY explains counts/shares and what data was not used
