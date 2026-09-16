# ADR 0019 — Signal Orchestrator (tool-backed, optional)

## Status

Accepted (M17)

## Context

Handoff M17 introduces one bounded AI interpretation layer. Signal must be explicit, optional, and read-only. It may call only allowlisted portfolio evidence tools and must never invent or upgrade evidence. Multi-agent architectures and freeform chat are out of scope. Adaptive UI plans belong to M18.

## Decision

- Ship a deterministic **tool orchestrator** first: `search_evidence` → `fetch_evidence` / `fetch_project` / `fetch_sources` → optional `compare_evidence`
- Request-local `SignalToolSession` gates later tools to IDs exposed by earlier tool output
- Explicit UI action **INTERPRET WITH SIGNAL** inside ASK RUNTIME (search remains usable without Signal)
- Server route `POST /api/signal/interpret` keeps Evidence Graph access server-side; no browser secrets
- Structured output: intent, answer, evidence IDs/cards, gap notice, tool trace, boundary notice — **no `ui_plan` yet**
- Gap path returns a fixed notice rather than improvising professional facts
- Defer hosted LLM planner; tool-orchestrated assembly is the M17 contract (optional LLM may wrap tools later behind the same allowlist)

## Consequences

- Visitors can opt into interpretation without gating recruiter routes
- Truth stays in software; Signal cannot browse the web, run shell, or mutate the graph
- M18 can add constrained `ui_plan` on the same tool session without rewriting evidence authority
