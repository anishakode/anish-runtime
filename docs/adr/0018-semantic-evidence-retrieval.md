# ADR 0018 — Semantic evidence retrieval as local fallback

## Status

Accepted (M16)

## Context

Handoff M16 requires semantic broadening when deterministic ASK RUNTIME results are insufficient, without making vectors authoritative. OpenAI/pgvector are optional in the constitution; recruiter path must work without external AI keys.

## Decision

- Derive semantic documents from the same search index (canonical id + embedding text + content hash)
- Local TF-IDF cosine vectors in-process (`local-tfidf`) — no browser API keys, no visitor query DB
- Orchestration: deterministic first; semantic only when hit count &lt; 2; provider failure → deterministic-only fallback
- Validate hits against live content hashes; unknown/stale rows discarded
- UI labels semantic results “Semantic relevance (not proof)” — evidence states pass through unchanged
- Defer hosted embeddings/pgvector; Signal remains M17+

## Consequences

- Natural-language intent can surface graph entities without inventing proof
- Vector index stays disposable; repository Evidence Graph remains truth
- External embedding providers can replace `local-tfidf` later behind the same hash gate
