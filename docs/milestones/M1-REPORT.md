## Milestone report: M1 — Canonical Truth + Evidence Graph

**Scope approved:** Proceed with best path (full honest corpus from handoff + GitHub fingerprints)

**M0 status:** Treated locked when moving to M1

**Implemented:**

- Expanded Zod Evidence Graph schema (profile, education, experience, projects, nodes, edges, sources, exclusions + referential integrity)
- Canonical corpus fragments under `content/evidence/`
- Loader `src/lib/evidence/load-graph.ts`
- GitHub immutable SHAs for flagship/supporting/archive repos (verified via GitHub API)
- Home page rehydrates identity from the graph (still no utility routes / WOW)
- ADR 0002
- Tests for states, exclusions, fingerprints, scale

**Corpus stats (validated):**

- Projects: 10 (3 flagship · 3 supporting · 4 archive)
- Nodes: 38
- Edges: 41
- Sources: 21
- Education: 2 · Experience: 1

**Truth notes:**

- Cardstack metrics = `OWNER_CONFIRMED_PROFESSIONAL`
- MLOps Runtime Lab = `PORTFOLIO_EXTENSION`
- Malware SHAP detail = `LIMITED_EVIDENCE`
- Failure Museum / fit scores = `NOT_DEMONSTRATED` boundary nodes
- Obsolete email + Sricons exclusion preserved

**Validation:** `validate:evidence`, typecheck, tests (7), build — run during M1

**Out of scope (correct):** M2 routes, M3 visual system, labs/Signal

**Ask:** Lock M1? (yes/no)
