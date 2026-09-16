## Milestone report: M16 — Semantic Evidence Retrieval

**Scope approved:** Owner — “lets go next” (Lock M15 + Approve M16)

**Implemented:**

- M15 locked + cumulative audit (`M15-LOCK-AUDIT.md`); footer → M15
- Derived semantic documents + content hashes for every search entity
- Local TF-IDF vector index (`local-tfidf`) — no browser API keys
- `retrieveEvidence`: deterministic first; semantic when &lt;2 hits; provider fail → fallback
- Stale/unknown vector rows discarded via hash gate
- ASK RUNTIME UI section “Semantic relevance (not proof)”
- ADR 0018; validate-scope pins

**Tests added/updated:**

- `semantic.test.ts` — docs, hits, stale discard, provider fail, orchestration
- `ask-runtime.test.tsx` — semantic section path
- e2e ASK RUNTIME natural-language → semantic label

**Test status:** **228 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**Truth / privacy notes:** Semantic = relevance not proof; no visitor query DB; no browser secrets

**Known gaps / deferred:** Hosted embeddings/pgvector; Signal (M17+)

**Locked:** 2026-09-15 — owner lock + audit; see `M16-LOCK-AUDIT.md`
