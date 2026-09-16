# Lock audit: through M26

**Trigger:** Owner locked M26 (Launch)
**Stages re-checked:** M0 … M26 — every milestone, in detail
**What is different about this one:** it is the first audit able to check the contracts
against a **real deployed origin** rather than a local build. Two guarantees had never
been exercised before today: HSTS, which is emitted only for an https origin, and the
social card, which needs an absolute URL to mean anything.

**Result:** six real defects found, all fixed and covered by tests that were proven to
fail against the old behaviour. No CRITICAL, no HIGH.

---

## CRITICAL

None.

## HIGH

None.

## MEDIUM — fixed

### 1. Three assertions that could never fail

This is the most serious category, because the project's own rule is that assertions must
be able to fail, and all three guarded the anti-invention behaviour the portfolio depends
on most.

| Where                             | What was wrong                                                                                                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/signal/compose.test.ts`  | The return value of `assertPlanHasNoFactualAuthority` was captured and thrown away with `void result`. The second-layer guard against a plan smuggling a factual `title` had **no assertion at all** — the test passed entirely on the schema's behalf. |
| `src/lib/fork/fork.test.ts`       | "never upgrades semantic-only matches to VERIFIED" wrapped both assertions in `if (result.matchPath === "semantic")`.                                                                                                                                   |
| `src/lib/search/semantic.test.ts` | "appends semantic hits" wrapped its assertions in `if (weak.semantic.length > 0)`.                                                                                                                                                                      |

Fixed by making all three unconditional, after probing the real runtime values to confirm
the behaviour is deterministic: the fork query does take the semantic path and classify as
`LIMITED`, and the weak query does return 8 semantic hits with status `semantic_appended`.
The fork test now also asserts the match path itself, so it fails loudly if the corpus ever
starts matching that phrasing deterministically instead of silently asserting nothing.

**Proof the fix bites:** deleting `"title"` from the forbidden-key list in `ui-plan.ts` now
fails `compose.test.ts` with `expected true to be false`. Before the fix it passed.

### 2. Histogram mis-binned values below the reference floor

`src/lib/mlops/histogram.ts` — in `histogramWithEdges`, a value under `edges[0]` never
matched any bin in the loop and fell through to the `i === binCount - 1` fallback, landing
in the **top** bin. `buildHistogram` clamps the same value to bin 0, so the two binning
paths disagreed, and PSI compares a reference built by one against a current built by the
other.

Measured directly, old versus new, on reference edges `[-3, -1.8, -0.6, 0.6, 1.8, 3]`:

| Values         | Old counts     | New counts     |
| -------------- | -------------- | -------------- |
| `[-99]`        | `[0,0,0,0,1]`  | `[1,0,0,0,0]`  |
| `[-99, 99]`    | `[0,0,0,0,2]`  | `[1,0,0,0,1]`  |
| drifted sample | PSI **4.9680** | PSI **3.3622** |

So the lab did not merely report the wrong magnitude — it reported drift in the wrong
direction. Deterministic and reproducible, so the M5 determinism contract held; the
arithmetic was simply wrong, and nothing tested it.

Rewritten as "first bin this value falls under", which clamps both ways in one pass.
Three new tests cover below-range, above-range, parity with `buildHistogram` over the same
edges, and edge-value placement. Every existing pinned PSI/KS value still passes, which
confirms the shipped scenarios rarely undershoot the reference floor — the bug was real but
latent.

## LOW — fixed

### 3. The ANSWER KEY boundary was not actually always shown

`src/components/interview/interview-my-work.tsx` nested it inside the `{set ? …}` guard, so
before building a question set — and again after clearing one — the page carried no visible
statement that it refuses to manufacture Anish's answers. Moved outside the guard.

This surfaced a genuine disagreement: `src/app/interview/page.test.tsx` asserted the
_opposite_ (`queryByText(/answer key/i)).not.toBeInTheDocument()`). The notice is a refusal,
not a promise, so that test was encoding the weaker behaviour. Replaced with one test
asserting the boundary is present from first paint and another asserting no model answer,
candidate score, fit score, hiring score, culture fit, or ranking language appears.

### 4. A job-description-derived slug reached the session trace

`src/components/fork/fork-anish.tsx` recorded `Forked role/${result.roleSlug}`, and the
Recompile WHY? panel displays recent reasons back to the visitor. Nothing was persisted or
transmitted and the M22 runtime trace stayed counts-only, so no contract bullet strictly
failed — but it was the one place JD-derived text left the Fork component. Now a fixed
string.

New test pastes a JD containing invented words and asserts none reach the trace. Mutation
check caught the old code printing `forked role/senior-zephyr-platform-en…`.

### 5. Evidence states in X-Ray and architecture stages were not bound to the graph

The `evidenceState` on each X-Ray component and the `reality` on each architecture stage
are hand-authored. Every value was honest, but nothing would have failed if one were
upgraded — precisely the silent-upgrade failure mode this project treats as its worst.

Two binding tests added, both verified to hold against the current corpus before being
enforced:

- An X-Ray component may never claim a state stronger than the strongest graph node behind
  its cited sources (ranked with the M25 `EVIDENCE_STRENGTH` table). It may be more
  cautious than its evidence; never bolder.
- A stage may only claim `PUBLIC_CODE_VERIFIED` when **every** node it cites is
  `PUBLIC_CODE_VERIFIED`.

### 6. An undefined CSS variable silently dropped styling

`src/app/globals.css` used `var(--ink)` twice; the ink token is `--on-surface`. An
undefined `var()` does not error — the whole declaration is discarded — so the Source Trace
backdrop tint and drawer shadow had simply been absent. Fixed, and a test now fails on any
custom property referenced but never defined. The allowlist for framework-injected
variables is derived from `layout.tsx` rather than hardcoded, so it cannot drift.

---

## Solid — verified, no action

**Live origin, 44 checks.** All 10 project pages and all 14 public routes return 200. The
excluded email and the conflicting Sricons profile appear on none of the 24 live pages, and
the canonical email is served on `/contact`. No third-party asset host appears anywhere,
which keeps the published zero-tracking claim literally true in production and not just in
the repository.

Six live checks flagged on the first pass and all six were artefacts of a naive probe, worth
recording so the next audit does not re-raise them:

- "fit score" and "hiring recommendation" appear as the site **stating the prohibition**
  ("No fit score. No hiring recommendation. Job text is not stored.") plus the evidence node
  `ev.boundary.no-fit-scores`, itself marked `NOT_DEMONSTRATED`. A substring search has no
  sense of polarity.
- `/surface` reality labels render as display text ("PORTFOLIO SIMULATION"), not the
  underscored enum.
- Landing counts are correct (40 nodes · 10 projects · 23 sources) with markup between the
  digits and the word.
- `evidence.json` names the field `state`, not `evidenceState`. The corpus publishes 3
  `PORTFOLIO_EXTENSION`, 2 `NOT_DEMONSTRATED`, and 1 `LIMITED_EVIDENCE`, all reaching
  rendered pages on `/work`, `/labs/malware`, and `/failures`.

**Provenance.** All 18 GitHub-backed sources carry commit pins; 0 dangling source
references. The only unpinned sources are the owner confirmation, the résumé, and three
portfolio-runtime entries — exactly what M25 permits.

**M0–M13** (detailed pass): scope validator and CI contract coherent; graph schema
integrity including exclusion scanning; recruiter routes and nav ungated and served from a
deliberately graph-free module so they survive fault boundaries; unknown slug 404s; print
CSS hides only chrome; SHA-pinned repo links with an explicit unpinned label; visual tokens,
reduced-motion, forced-colors and focus baselines; manifest is a derived projection with
exclusion assertions; landing readable without RUN, with Skip and Escape; MLOps determinism,
state machine and alert cooldown; incident break/recover with no real Slack or email; Source
Trace fingerprints matching the graph; reversible architecture labelled as reasoning
reconstruction rather than fake version history; autopsy lenses keep-mounted; X-Ray dimming
is progressive enhancement only; Steward withholds treatment advice in every branch and
previews the FHIR Task as a dry run only on baseline; malware lab has no file input and
keeps SHAP at `LIMITED_EVIDENCE`.

**M14–M23** (detailed pass, 61 bullets): Failure Museum still publishes zero exhibits behind
a real gate; ASK RUNTIME ranking order and bounded typo recovery; semantic retrieval
discards stale hashes and degrades to deterministic-only on provider failure; Signal's five
allowlisted tools with per-request exposed-ID sessions rejecting unexposed fetches; composer
falls back wholly, never partially, and the planner passes only ids and layout; Recompile
requires explicit consent and counts distinct items only; Fork sanitises before matching and
semantic matches can never reach VERIFIED; Interview drops unbound templates and caps at
three with archetype diversity; the M22 trace **rejects** rather than filters query, JD,
prompt, reasoning, IP and secret fields, and distinguishes a measured zero from an
unmeasured one; Ending Signal reads only the existing trail and trace, discards raw query
refs, and publishes four hard zeros.

**Privacy sweep.** Zero matches across `src/` for `localStorage`, `sessionStorage`,
`document.cookie`, `indexedDB`, `cookies()`, or `Set-Cookie`. Zero `console.*` calls, so no
query or JD is logged. Zero analytics vendors. The only client network call is same-origin
`POST /api/signal/interpret`.

**Test hygiene.** No `.skip`, `.todo`, `.only`, or `xit` on any unit test body. The single
`test.skip(!isProd, …)` is an environment guard and CI sets `E2E_PROD=1`, so those
assertions do run. The remaining `toBeTruthy()` calls are fixture preconditions followed by
exact assertions.

---

## Deferred, with reasons

- **The human checklist** in `LAUNCH-CHECKLIST.md` — real phone, screen reader, print,
  reading the claims cold. A script should not pretend to make those calls.
- **Six Dependabot PRs**, all showing red because they branched from before the typegen fix,
  not because of any incompatibility. One is a TypeScript major. Post-launch work.
- **Three GitHub Actions on deprecated Node 20** — a warning, not a failure; Dependabot PRs
  1–3 are the fix.
- **Local `pnpm ci` still excludes e2e.** Documented in `TEST-STATUS.md`; CI runs it.

## Commands run

- `pnpm ci` — scope, evidence, freeze (96 claims, `42f8efd8bc5c2aa7`, OWNER_CONFIRMED),
  format, lint, typecheck, unit, build, bundle budget (24 routes, server-only modules absent)
- `pnpm test` — **470 passed** (461 before this audit; +9 from the fixes)
- `pnpm test:e2e:prod` — **142 passed**, chromium desktop + mobile
- `pnpm smoke:live https://anish-runtime.vercel.app` — **38/38**
- Live cumulative probe — 44 checks
- Mutation checks on each new guard, to prove the assertions can fail
- GitHub Actions on `main` — green

**Lock hygiene:** Clean — six defects found, all fixed and tested within the audit.
**Next:** propose the milestone after M26.
