# ADR 0003 — Utility Portfolio before WOW

## Status

Accepted (M2)

## Context

Recruiters need Work / Experience / About / CV / Contact before experimental runtime interaction exists. Shipping Signal, labs, or cinematic landing first would violate progressive enhancement and recruiter usability.

## Decision

Ship a conventional utility shell in M2:

- Permanent nav + footer + page shell
- Evidence badges and project cards driven by the Evidence Graph
- Evidence-first `/work/[slug]` pages
- Browser-printable CV
- `/llms.txt` machine-readable summary
- Custom 404

No WOW features (Signal, labs, RUN ANISH). Visual system remains M3.

## Consequences

- Portfolio is useful immediately from graph truth
- Later milestones enhance presentation/interaction without inventing recruiter routes
- Scope validator requires utility route files and forbids early Signal/labs paths
