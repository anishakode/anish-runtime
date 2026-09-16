# ADR 0005 — Public Evidence Manifest is derived

## Status

Accepted (M3.5)

## Context

Machine clients and AI tools need a stable public JSON view of evidence. The repository Evidence Graph must remain the only authoritative store. Publishing raw graph fragments without a projection contract risks leaking exclusions or implying the API is source of truth.

## Decision

Ship `/evidence.json` as a **derived** Public Evidence Manifest:

- Schema id `anish-runtime.evidence.public` + `schemaVersion`
- Explicit authority string: repository graph wins
- Profile, education, experience, projects, nodes, edges, metrics, sources
- SHA-256 source fingerprints over type/repo/path/commitSha/url
- Build-time validation via `pnpm validate:evidence` (graph + manifest)
- `/llms.txt` discovers `/evidence.json`

Never include excluded emails/profile tokens in the projection.

## Consequences

- External tools can rely on a versioned JSON contract
- Authors continue to edit `content/evidence/*` only
- Validation must fail closed on exclusion leaks or divergent counts
