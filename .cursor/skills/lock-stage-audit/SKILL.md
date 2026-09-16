---
name: lock-stage-audit
description: >-
  After every ANISH // RUNTIME milestone lock, run a full cumulative check from
  M0 through the newly locked stage in detail. Use when the owner locks a
  milestone, says lock, or asks to verify/regress all stages so far.
---

# Lock Stage Audit (Cumulative)

## Hard rule (owner mandate)

**After every lock stage, do a full check from the first stage checking all the stages in detail.**

Do not only smoke-test the milestone just locked. Re-verify **M0 → … → locked M#** as one regression surface. Report findings before proposing the next milestone.

## When to run

Trigger immediately when the owner:

- locks a milestone (`Lock M…`, `yes` to lock, or equivalent);
- asks whether everything so far still looks good after a lock;
- asks for an edge-case / full check across completed stages.

Do **not** start the next milestone’s implementation until this audit is reported (unless the owner explicitly overrides).

## Procedure

1. Read `docs/planning/milestones.md` and list every milestone with status **Locked** (include the one just locked).
2. For **each** locked milestone from the first (M0) upward, run the stage checklist below in order.
3. Also run a **cross-cutting** edge-case pass (truth, recruiter path, CI, regressions from later work breaking earlier contracts).
4. Produce a **Lock audit report** (template below). Severity: CRITICAL → HIGH → MEDIUM → LOW/deferred.
5. If CRITICAL/HIGH defects exist: propose fixes (approval-gated if scope expands); do not treat the lock as “clean.”
6. If clean or only deferred gaps: confirm lock hygiene, then use `approval-gate` to propose the next milestone.

## Per-stage checklist (cumulative)

### M0 — Repository Foundation

- [ ] Tooling scripts run: `validate:scope`, format/lint/typecheck/test/build as applicable
- [ ] CI contract still coherent (`package.json` `ci` vs `.github/workflows/ci.yml` — note gaps)
- [ ] Scope validator still blocks early WOW paths; required foundation files present
- [ ] Security header baseline intact; no accidental secret files
- [ ] ADR 0001 / planning docs still accurate enough for agents

### M1 — Canonical Truth + Evidence Graph

- [ ] `validate:evidence` passes; corpus stats sane
- [ ] Schema integrity: referential links, exclusions (obsolete email, conflicting profiles)
- [ ] Evidence states not silently upgraded anywhere in UI/copy
- [ ] GitHub-backed sources still fingerprinted where claimed; no invented nodes to “hit a count”
- [ ] Loader + tests for graph still green

### M2 — Utility Portfolio

- [ ] Recruiter routes live: `/` `/work` `/work/[slug]` `/experience` `/about` `/cv` `/contact`
- [ ] Nav always exposes Work · Experience · About · CV · Contact (no lab/AI gate)
- [ ] Invalid slug → 404; custom 404 usable
- [ ] `/llms.txt` reflects graph truth
- [ ] Evidence badges/cards/project pages rehydrate from graph only
- [ ] Print/CV path does not hide essential content via over-broad CSS
- [ ] Empty / missing-data edge cases don’t crash pages
- [ ] `pnpm test:status` green; `docs/testing/TEST-STATUS.md` current
- [ ] SHA-pinned project repo links (or explicit unpinned label)

### M3 — Visual System

- [ ] Editorial Lab tokens present (`surface` / `on-surface` / evidence-state pairs)
- [ ] Instrument Sans + IBM Plex Mono loaded
- [ ] Evidence badges keep text labels; legend available on Work/Experience
- [ ] reduced-motion / forced-colors / print / focus-visible baselines
- [ ] No cyberpunk/neon/purple SaaS drift; light paper/ink first
- [ ] Visual contract tests green; Active Instrument limited to hooks (no lab UI)

### M3.5 — Public Evidence Manifest

- [ ] Generated `/evidence.json` is derived projection only (repo graph remains authoritative)
- [ ] Schema/version marker present; public profile/projects/nodes/edges/metrics/sources only
- [ ] Source fingerprints preserved; no private/proprietary leakage
- [ ] Build/validation scripts; `/llms.txt` discovery reference updated
- [ ] Tests cover projection shape + exclusion hygiene

### M4 — Landing Compilation + Home Runtime

- [ ] Idle `/` remains readable: identity, positioning, View work / CV / Contact without RUN
- [ ] RUN ANISH + journey presets (20 SEC / 2 MIN default / EXPLORE)
- [ ] Compilation steps: identity → capabilities → evidence → projects (no fake terminal/particles)
- [ ] Skip + Escape during compile; reduced-motion settles immediately
- [ ] Settled state: system-ready, graph-backed counts, capabilities, flagships, reset
- [ ] Capability constellation stacks semantically on small viewports
- [ ] Unit + e2e coverage for run/skip/reset/reduced-motion

### M5 — Deterministic MLOps Core

- [ ] Seeded RNG + histograms present under `src/lib/mlops/`
- [ ] PSI / KS algorithms align with pinned evidence sources (`drift.py` / `stats.py`)
- [ ] Missingness + range-quality checks; monitor state machine; alert cooldown
- [ ] Drift / missing / range scenarios reproducible by seed
- [ ] `PORTFOLIO_EXTENSION` boundary notice + Source Trace IDs; no lab UI routes yet
- [ ] Unit tests cover happy path, empty/invalid input, determinism, severity bands

### M6 — MLOps Live Lab

- [ ] `/labs/mlops` (or equivalent) exposes reference/current + PSI/KS/missingness/range
- [ ] SHIFT DATA / INJECT MISSING / RESET recompute real M5 metrics
- [ ] Detector-disagreement lens + accessible histogram table
- [ ] Boundary banner + Source Trace; no fake Grafana/telemetry
- [ ] Recruiter nav unchanged; lab optional from project evidence
- [ ] Unit + e2e coverage for controls and honesty

### M7 — Break the System + Watch Anish Debug

- [ ] BREAK THE SYSTEM applies controlled +0.50 shift and enters incident
- [ ] Event trace labels runtime_lab / code_verified / interpretation / simulated_notify
- [ ] Watch Anish Debug shows deterministic investigation steps
- [ ] RECOVER returns to healthy baseline; no real Slack/email
- [ ] Tests cover break/recover/determinism

### M8 — Source Trace Mode

- [ ] SourceTraceProvider + reusable trigger + evidence drawer present
- [ ] Drawer lists type / repo / path / immutable commit SHA when GitHub-backed
- [ ] Escape / Close / backdrop dismiss; on-page list anchor when provided
- [ ] Viewport connector line is PE-only — hidden on mobile and prefers-reduced-motion
- [ ] Project pages expose Trace source for nodes with sources; lab Trace PSI / Trace KS
- [ ] Lab fingerprints match Evidence Graph (`psiLabSourceTrace` / `ksLabSourceTrace`)
- [ ] Panel is authoritative; no invented paths; tests cover resolve reject + drawer open/close

### M9 — Reversible Architecture

- [ ] Five causal stages: System Boundary → Lifecycle → Observability → Detection → Governance
- [ ] Explicit “Architecture reasoning reconstruction” label (not fake v0→v1 history)
- [ ] Previous / Next + scrubber; cumulative map text-first
- [ ] Reality labels: PORTFOLIO_SIMULATION vs PUBLIC_CODE_VERIFIED
- [ ] Source Trace on stage claims; graph-backed sources only
- [ ] Mounted on MLOps work page; lab links to `#reversible-architecture`
- [ ] Recruiter nav ungated; no Grafana / invented telemetry copy
- [ ] Tests for stage model, UI nav/Trace, mount/non-mount

### M10 — Project Autopsy

- [ ] Six lenses: STORY · RUN · X-RAY · DECISIONS · FAILURES · EVIDENCE
- [ ] Default STORY (recruiter-readable without lab/AI)
- [ ] Keep-mounted panels so RUN lab / X-RAY scrubber state survive lens switches
- [ ] FAILURES empty via `ev.boundary.failure-museum-empty` (NOT_DEMONSTRATED)
- [ ] DECISIONS graph-backed with Source Trace; no invented post-mortems
- [ ] MLOps-only Autopsy mount; non-flagship pages unchanged
- [ ] Lab links to `#project-autopsy`; dedicated `/labs/mlops` remains
- [ ] Tests: lens model, keep-mounted RUN, FAILURES honesty, page mount/absence

### M11 — Project X-Ray

- [ ] Responsibility layers with isolate + component select + related + Source Trace
- [ ] MLOps layers graph-backed only (Boundary / Observability / Detection / Governance)
- [ ] No invented Redis/MLflow / fake production service maps
- [ ] Semantic layer list authoritative; dimming is PE
- [ ] M9 Reversible Architecture remains under X-RAY as causal reconstruction
- [ ] Mounted via Autopsy X-RAY lens; tests cover isolate/select/Trace + anti-invention

### M12 — Steward_AI Agent Lab

- [ ] `/labs/steward` + Autopsy RUN on `/work/steward-ai`
- [ ] Four scenarios: baseline · remove renal · allergy conflict · invalid tool input
- [ ] Tool states complete/warning/blocked/error; treatment advice withheld
- [ ] FHIR Task dry-run preview only on baseline; synthetic context only
- [ ] PORTFOLIO_EXTENSION + Trace to MCP/README SHA pins; no live FHIR/Gemini/MCP
- [ ] ADR 0014; unit + page + e2e coverage

### M13 — PDF Malware Explainability Lab

- [ ] `/labs/malware` + Autopsy RUN on `/work/explainable-pdf-malware-detection`
- [ ] Static feature toggles; deterministic study-signal math (pinned weights)
- [ ] Study signal ≠ security verdict; no file upload; no malware execution
- [ ] SHAP detail remains `LIMITED_EVIDENCE`; lab boundary `PORTFOLIO_EXTENSION`
- [ ] Source Trace to pinned public report SHA
- [ ] ADR 0015; unit + page + e2e coverage with fail-first exact values

### M14 — Failure Museum Evidence Gate

- [ ] `/failures` route + Autopsy FAILURES share `FailureMuseum` UI
- [ ] Strict exhibit schema + publication gate (SHA-pinned / public artifact URL)
- [ ] Canonical exhibit dataset empty (`CANONICAL_FAILURE_EXHIBITS = []`)
- [ ] Future exhibit renderer covered by fixture tests; 0 published exhibits
- [ ] Recruiter primary nav unchanged; museum optional
- [ ] ADR 0016; unit + page + e2e coverage

### M15 — Deterministic Evidence Search

- [ ] ASK RUNTIME header control + ⌘/Ctrl+K dialog (diagnostic, not chat)
- [ ] Ranking: exact title → alias → prefix → keyword → bounded typo
- [ ] Index built from Evidence Graph only; weak states not upgraded
- [ ] Gap notice on miss; Escape / focus trap
- [ ] ADR 0017; unit + e2e coverage

### M16 — Semantic Evidence Retrieval

- [ ] Derived semantic documents + content hashes for search entities
- [ ] Local TF-IDF vectors; deterministic-first retrieval (&lt;2 hits triggers semantic)
- [ ] Stale/unknown rows discarded; provider fail → deterministic-only
- [ ] ASK RUNTIME “Semantic relevance (not proof)” labeling
- [ ] ADR 0018; unit + e2e coverage

### M17 — Signal Orchestrator

- [ ] Allowlisted tools only: search_evidence / fetch_evidence / fetch_project / fetch_sources / compare_evidence
- [ ] Request-local exposed-ID session; unexposed fetches rejected
- [ ] Explicit INTERPRET WITH SIGNAL in ASK RUNTIME (search works without it)
- [ ] Gap notice when no canonical evidence; states never upgraded
- [ ] `POST /api/signal/interpret` tool-orchestrated; no ui_plan yet
- [ ] ADR 0019; unit + API + e2e coverage

### M18 — Adaptive Evidence Composer

- [ ] Strict ui_plan schema; allowlisted component types only
- [ ] Planner passes IDs + layout/emphasis — no factual copy
- [ ] Full fallback on invalid plan / failed rehydration (no partial generative UI)
- [ ] SignalComposedView rehydrates from Evidence Graph
- [ ] ADR 0020; unit + ASK RUNTIME + e2e coverage

### M19 — Signal Recompile

- [ ] In-memory session trace; distinct items only (repeats cannot fake interest)
- [ ] Heuristic: ≥4 distinct · ≥60% lean · clear winner · ≥2 supporting items
- [ ] Explicit RECOMPILE / NOT NOW / WHY? — never auto-recompile
- [ ] Consent reorders Home/Work presentation only; RESET restores; evidence unchanged
- [ ] ADR 0021; unit + banner + e2e coverage

### M20 — Fork Anish

- [ ] JD sanitized before matching; sensitive criteria lines stripped; input size bounded
- [ ] Deterministic requirement extraction; classification VERIFIED / PROFESSIONAL / LIMITED / NOT_DEMONSTRATED
- [ ] Semantic-only matches cannot reach VERIFIED; gaps rendered, not hidden
- [ ] No fit score, hiring recommendation, or candidate ranking language anywhere
- [ ] JD and branch not persisted; integrity manifest shows 0 claim/state changes
- [ ] `/fork` additive; primary recruiter nav unchanged
- [ ] ADR 0022; unit + component + page + e2e coverage

### M21 — Interview My Work

- [ ] Questions authored in the catalogue and bound to canonical node ids; unbound templates dropped
- [ ] Only canonical session items count; free-text queries land in `ignoredInputs`
- [ ] Distinct items only; repeats cannot inflate the set
- [ ] Hard cap of 3; archetype + topic diversity; deterministic for the same trail
- [ ] Every question shows lead, one follow-up, WHY (triggers, source counts, fairness), supporting evidence
- [ ] ANSWER KEY notice always rendered; no model answer / candidate score / hiring score / culture-fit
- [ ] Honest empty states for no trail and non-catalogued trail
- [ ] ADR 0023; unit + component + page + e2e coverage

### M22 — Under the Surface + Runtime Trace

- [ ] Five layers in handoff order: INTERFACE · ORCHESTRATION · TRUTH · SESSION · RUNTIME
- [ ] Every subsystem has a reality label; labs/incident are PORTFOLIO_SIMULATION, never REAL_RUNTIME
- [ ] Hosted LLM is OPTIONAL_PROVIDER; graph validation is BUILD_TIME_SYSTEM
- [ ] Every declared subsystem path exists on disk (test-enforced, so the map cannot drift)
- [ ] Runtime trace schema is strict: query / JD / prompt / reasoning / IP / secret rejected, not filtered
- [ ] History bounded; in-memory only; rejections counted and surfaced
- [ ] NOT MEASURED / NOT COLLECTED / UNAVAILABLE used instead of fabricated numbers; measured 0 ≠ unmeasured
- [ ] `/surface` additive (footer), recruiter nav unchanged
- [ ] ADR 0024; unit + component + page + e2e coverage

### M23 — Ending Signal

- [ ] Reads only the M19 trail and the M22 trace — no third tracking system
- [ ] Only canonical refs become nodes; raw query refs discarded, never rendered
- [ ] Density thresholds explicit and tested on both sides; a shallow session stays shallow
- [ ] Thread shown only when the deterministic heuristic detects a lean
- [ ] `CHALLENGE_COMPLETED` recorded only after real completion (incident recovered; non-baseline scenario run through)
- [ ] WHY THIS SIGNAL? names all seven exclusions; manifest publishes the four hard zeros
- [ ] Conventional close: email, CV, LinkedIn, GitHub from the canonical profile
- [ ] `/ending` additive (footer); recruiter nav unchanged
- [ ] ADR 0025; unit + component + page + e2e coverage

### M24 — Production Hardening

- [ ] Security headers served in production: CSP, `X-Content-Type-Options`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy, COOP/CORP; HSTS only for an https origin
- [ ] Production CSP carries no `unsafe-eval`, no `ws:`, and no third-party host
- [ ] Signal API bounded: same-origin (Host / `Sec-Fetch-Site`, not `request.url`), JSON only, byte ceiling on a stream with no declared length, control characters rejected, query length capped
- [ ] Rate limit is keyless and refuses before reading the body; 429 carries `Retry-After`
- [ ] Every rejection is a named reason, and degrading to deterministic search still works
- [ ] Fault boundaries: route, labs, and global — each keeps the recruiter path reachable and shows a digest, never a stack trace
- [ ] Bundle budgets enforced per route from prerendered HTML; server-only modules (zod) verified absent from client chunks
- [ ] Axe serious+critical clean on every public route and the 404; reflow at 320px, skip link, sticky-header focus, 24px targets, forced colours, reduced motion
- [ ] Recruiter path works with JavaScript disabled, and the h1 / nav / mailto are present in the raw server HTML
- [ ] Indexing policy: robots, sitemap, per-page canonicals, title template; session-shaped pages noindex in both metadata and header; every page on disk is classified
- [ ] No fabricated production origin while `NEXT_PUBLIC_SITE_URL` is unset
- [ ] 404 returns a real 404 (including an unknown project slug) with full nav; print keeps the CV and drops chrome
- [ ] `/evidence.json` and `/llms.txt` reachable with the right content types
- [ ] CI installs frozen and runs e2e against `next start`
- [ ] ADR 0026; unit + API + security + SEO + metadata + error-boundary + production e2e coverage

### M25 — Evidence Freeze

- [ ] `pnpm freeze:check` passes and runs inside `pnpm ci` and GitHub Actions
- [ ] Claim projection still covers identity, education, experience, impact metrics, projects, nodes, sources, exclusions, and corpus counts
- [ ] Manifest status is honest (`OWNER_CONFIRMED` only after the owner confirmed the facts no validator can check)
- [ ] A changed, removed, added, or strengthened claim fails the build with the claim named
- [ ] Strengthening requires a change-control entry naming the exact transition plus at least one new source; a reason alone is refused
- [ ] Weakening is permitted but still recorded
- [ ] `docs/evidence/CLAIM-LEDGER.md` regenerated, not hand-edited, and marks owner's-word-only claims as such
- [ ] Every GitHub-backed source still carries a commit pin; unpinned sources are only owner/résumé/portfolio-runtime
- [ ] No evidence state has strengthened against what the milestone reports documented
- [ ] Generated freeze output is Prettier-clean, so re-freezing cannot break `format:check`
- [ ] ADR 0027; freeze unit coverage including every rejection path

### M26+ (when locked)

For each later locked milestone, add checks from that milestone’s report + handoff contract.

Extend this skill’s checklist when a new milestone is locked for the first time (append a subsection; don’t delete older checks).

## Cross-cutting edge cases (every lock audit)

- [ ] Later milestone did not break earlier recruiter utility
- [ ] No WOW/Signal/labs paths present before their unlock (scope validator + filesystem)
- [ ] Schema/validators catch regressions (unique slugs, required fingerprints, etc.) — note gaps
- [ ] UI links that imply proof match provenance (e.g. SHA-pinned evidence vs default-branch repo links)
- [ ] Boundary / `NOT_DEMONSTRATED` / `PORTFOLIO_EXTENSION` / `LIMITED_EVIDENCE` still honest and not hidden where the locked UI should surface them
- [ ] README / milestones table / public packaging match locked status (`public-presence`)
- [ ] **Test suite matches introduced behavior** — every locked stage’s new routes/contracts/UI have corresponding unit and/or e2e coverage; no “feature without tests”; stale assertions updated when contracts changed
- [ ] **Edge matrix covered or explicitly deferred** — empty/invalid/exclusion/weak-state/provenance/recruiter/a11y edges for locked surfaces; silent gaps = audit fail
- [ ] Unit tests + relevant e2e actually run green; call out if e2e not in local `pnpm ci`
- [ ] Privacy: session-only; no profiling added by accident
- [ ] Mobile + keyboard + skip-link where chrome exists

## Report template

```markdown
## Lock audit: through M#

**Trigger:** Owner locked M#
**Stages re-checked:** M0 … M#

### CRITICAL
- …

### HIGH
- …

### MEDIUM
- …

### LOW / deferred
- …

### Solid
- …

### Commands run
- …

**Lock hygiene:** Clean | Fix-then-confirm | Blocked on CRITICAL
**Next:** Propose next milestone only if hygiene is Clean or owner accepts known gaps.
```

## Relationship to other skills

- `milestone-ship` — definition of done for the milestone just finished; this skill runs **on/after lock** cumulatively.
- `approval-gate` — next milestone proposal only after lock audit is reported.
- `evidence-integrity` / `recruiter-path` / `lab-determinism` / `wow-craft` — invoke while auditing matching surfaces.
