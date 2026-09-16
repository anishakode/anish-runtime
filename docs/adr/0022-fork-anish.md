# ADR 0022 — Fork Anish (temporary evidence branch)

## Status

Accepted (M20)

## Context

Handoff M20 maps a pasted JD to a temporary role-specific evidence branch. The system must show what can and cannot be demonstrated without fit scores, culture scores, hiring advice, or evidence mutation. LLMs may extract requirements only; classification is software-owned.

## Decision

- Deterministic sanitize → extract → retrieve → classify pipeline (no LLM required for M20)
- Strip sensitive JD lines (salary, demographics, visa, etc.) before extraction
- Classifications: VERIFIED · PROFESSIONAL · LIMITED · NOT_DEMONSTRATED
- Semantic-only matches cannot become VERIFIED
- Integrity manifest hard-codes: claims/states changed = 0; fit score = not generated; no JD/branch persistence
- UI at `/fork` with header affordance; primary recruiter nav unchanged
- Keep `src/features/fork` unused; implementation lives under `src/lib/fork` + `src/app/fork`

## Consequences

- Recruiters can paste a role and see honest gaps
- Gaps remain visible; unsupported requirements are first-class
- Optional structured-model extraction can wrap the same classify step later
