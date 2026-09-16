# ADR 0020 — Adaptive Evidence Composer (constrained ui_plan)

## Status

Accepted (M18)

## Context

Handoff M18 requires Signal answers to become interface: a constrained `ui_plan` where the planner chooses only approved component types and IDs. Factual titles, evidence states, links, and metrics must be rehydrated from the Evidence Graph. Invalid plans must not partially render.

## Decision

- Define a strict Zod `ui_plan` schema (version 1) with allowlisted blocks only
- Planner fields are limited to type + IDs + layout/emphasis — no factual copy
- Deterministic `planUiFromEvidence` builds plans from tool-exposed evidence (no freeform LLM required for M18)
- `composeFromPlan` validates then rehydrates; any failure → full text fallback (`composeStatus: fallback`)
- ASK RUNTIME renders `SignalComposedView` from rehydrated blocks only
- Defer hosted LLM UI planner; same schema can wrap a model later

## Consequences

- “The UI is the AI response” without giving the model factual authority
- Invalid / unknown IDs never produce a half-composed generative UI
- Component catalog can grow only via schema + rehydrator + tests
