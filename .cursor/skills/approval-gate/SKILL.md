---
name: approval-gate
description: >-
  Enforces owner approval-gated milestone workflow for ANISH // RUNTIME.
  Use when starting milestones, features, scaffolding, refactors, or when the
  user says build, implement, proceed, or start from scratch. Always propose
  and wait for explicit approval before writing product code.
---

# Approval Gate

## Workflow (mandatory)

```text
Research → Proposal → Owner Approval → Implementation → Validation → Report → Owner Lock → Next
```

Do **not** skip to implementation. Do **not** self-declare a milestone complete.

**Approval phrases that unlock work:** `Approve M…`, `Approve with changes`, or an explicit “create/approve” for a named artifact (e.g. skills).  
**M0 exception:** foundation tooling only — no portfolio WOW features.

## Before any major work

1. Read `ANISH_RUNTIME_MASTER_HANDOFF.md` relevant sections + `AGENTS.md`.
2. Inspect existing code/contracts if any exist.
3. Research edge cases; reject gimmicks (see `wow-craft`, `research-first`).
4. Write a **scoped proposal**: in scope, out of scope, success criteria, risks.
5. Ask for explicit approval (`Approve M…` / `Approve with changes`).
6. Only then implement.

## After implementation

1. Update tests in the same change for every new or changed behavior (unit and/or e2e). Stale or missing coverage is a ship blocker.
2. Validate (typecheck, lint, tests, a11y/mobile/reduced-motion as relevant).
3. Produce a short implementation + verification report (include **Tests added/updated**).
4. Ask the owner to **lock** the milestone.
5. On lock: run `lock-stage-audit` (full cumulative check from M0 through the locked stage in detail). Report before proposing next.
6. Stop. Do not start the next milestone without a new approval **and** a completed lock audit (unless owner explicitly overrides).

## Locked milestones

Do not reopen casually. Only for: genuine defects, authorised integration, evidence changes, security/a11y corrections — preserve the original contract.

After each lock, the cumulative audit may surface defects in earlier stages; fix those as authorised corrections without rewriting the locked product contract.

## Proposal template

```markdown
## Proposal: [M# / feature name]
**Goal:** …
**In scope:** …
**Out of scope:** …
**Success criteria:** …
**Tests planned (new/updated):** …
**Truth / privacy / a11y impact:** …
**Risks:** …
Reply: Approve | Approve with changes | Reject
```
