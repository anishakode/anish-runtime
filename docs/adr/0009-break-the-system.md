# ADR 0009 — Break the System as labeled deterministic incident

## Status

Accepted (M7)

## Context

Signature WOW 3–4 require a controlled MLOps incident and visible engineering investigation — not a fake outage theatre. M5/M6 already provide real PSI/KS and lab controls. Notifications must stay simulated.

## Decision

- Pure `incident.ts`: BREAK → +0.50 shift → detect → audit → simulated alert → incident → RECOVER
- Event trace and Watch Anish Debug steps carry provenance labels: `runtime_lab` | `code_verified` | `interpretation` | `simulated_notify`
- Compose into `/labs/mlops` (same surface as M6) so recruiters still never need the lab
- Home settled runtime links MLOps flagship into the lab

## Consequences

- Unique proof-by-interaction without cloning terminal/cyberpunk skins
- M8 Source Trace Mode can deepen the evidence drawer later
