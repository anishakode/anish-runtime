## Lock audit: through M21

**Trigger:** Owner — “Yes run the cumulative M0–M21 and then start M22”
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15 · M16 · M17 · M18 · M19 · M20 · M21
**Generated:** 2026-09-16

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e on push; M21 e2e was run manually (`--grep "Interview My Work"`, 2 passed).
2. **Public live URL / packaging** deferred (M24–M26).
3. **Hosted LLM / pgvector** deferred by design; Signal, Fork, and Interview all stay local-deterministic.

### LOW / deferred

- Under the Surface + Runtime Trace (M22) · Ending Signal (M23)
- Steward / Malware X-Ray depth · CSP hardening → M24
- Pre-existing dev-only React key warning from `ProjectAutopsy` on project pages (no user-visible effect, not traced yet)

### Solid

**M0** — `validate:scope` green; required foundation files present; forbidden `src/features/ending-signal` absent; `packageManager` pinned to pnpm.

**M1** — `validate:evidence` green: 10 projects, 40 nodes, 45 edges, 23 sources, referential integrity and exclusions enforced by schema.

**M2** — Recruiter routes all build (`/`, `/work`, `/work/[slug]`, `/experience`, `/about`, `/cv`, `/contact`); primary nav asserted present on the two newest feature pages (`/fork`, `/interview`); invalid slug still 404s.

**M3 / M3.5** — Editorial Lab tokens and badge legend unchanged; `/evidence.json` still a derived projection (schema `anish-runtime.evidence.public` v1) and validated in CI.

**M4–M14** — Home runtime, MLOps core and lab, Break/Recover, Source Trace, Reversible Architecture, Autopsy, X-Ray, Steward lab, Malware lab, and the empty Failure Museum all covered by their suites in the 299-test run; no regressions from M15–M21 work.

**M15–M18** — ASK RUNTIME deterministic-first search, semantic fallback labelling, Signal allowlist and exposed-ID gate, and the ui_plan full-fallback contract all green.

**M19** — Session trace remains in memory, distinct-item only, consent-gated. M21 reads the same trail rather than adding a second tracking system.

**M20** — Fork integrity manifest holds; every textual occurrence of “fit score”, “hiring recommendation”, “culture fit”, “candidate score”, and “model answer” across `src/` is a denial or a test asserting absence — verified by grep.

**M21** — Interview catalogue is authored and graph-bound; unbound templates drop; free-text inputs are collected as ignored and cannot generate questions; set capped at 3 with archetype and topic diversity; determinism asserted against exact question ids; LIMITED_EVIDENCE and PORTFOLIO_EXTENSION states asserted to survive selection; ANSWER KEY boundary always rendered; ADR 0023.

### Cross-cutting

- No later milestone gates recruiter utility: `/fork` and `/interview` are additive header affordances, primary nav untouched.
- Interview adds no persistence and no new tracking surface — it consumes the M19 trail.
- Weak evidence states are never upgraded by Signal, Fork, or Interview; each has a test asserting pass-through.
- `/llms.txt` lists `/fork` and `/interview` with their honesty caveats.
- Footer + milestones table → locked through M21.
- **Repo hygiene defect found and fixed during this cycle:** `format:check` was failing on all 249 files because the working copy is CRLF and Prettier defaults to LF. Fixed with `endOfLine: "auto"` and a `.gitattributes` normalising to LF; content was byte-identical apart from line endings. Without this, CI was red for reasons unrelated to any milestone.

### Commands run

- `node scripts/validate-scope.mjs` → Scope validation OK
- `pnpm run ci` → green (scope · evidence · format · lint · typecheck · 299 tests / 56 files · build, 27 routes)
- `pnpm exec playwright test --grep "Interview My Work"` → 2 passed (desktop + mobile)
- Forbidden-path probe (`src/features/ending-signal`, `src/features/fork`) → absent
- Anti-claim grep across `src/` → only denials and absence assertions

**Lock hygiene:** Clean

**Next:** M22 — Under the Surface + Runtime Trace (owner continued with “then start M22”).
