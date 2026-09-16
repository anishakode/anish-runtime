# ADR 0014 — Steward Agent Lab as deterministic tool inspection

## Status

Accepted (M12)

## Context

Steward_AI is a public hackathon/research prototype with MCP tools, FHIR demo data, and explicit not-clinical framing. Handoff M12 requires an inspectable deterministic agent lab without live FHIR, Gemini, MCP, or treatment advice.

## Decision

- Pure scenario model in `src/lib/steward/` with four scenarios: baseline, remove renal context, allergy conflict, invalid tool input
- Tool states: complete · warning · blocked · error
- Synthetic FHIR-shaped context only; recommendation path blocked; FHIR Task as dry-run preview on baseline only
- UI: `/labs/steward` + Autopsy RUN on `/work/steward-ai`
- Honesty: `PORTFOLIO_EXTENSION` + safety Trace to README / MCP server SHA pins
- Defer Steward X-Ray / Reversible Architecture

## Consequences

- Second flagship Runtime Lab without clinical overclaim
- Malware lab remains M13; Signal remains M17+
