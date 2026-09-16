# Lock audit: through M27

**Trigger:** Owner locked M27 (Proof Trail Integrity)
**Stages re-checked:** M0 … M27 — every milestone, in detail
**What is different about this one:** the previous audit could only check the site. M27
published claims to four repositories outside this one, so this is the first audit with
a surface that this repository's CI cannot reach. The question it has to answer is
whether anything Anish now says on GitHub contradicts the frozen corpus.

**Result:** two HIGH defects found — both inside fixes the previous audit reported as
landed — plus a fourth softened assertion and eight smaller ones. All fixed and
mutation-proved except one truth question the owner has since decided, and one heuristic
rule now recorded as unenforced rather than claimed as tested.

The pattern worth naming: the two HIGH findings were _partial_ fixes from M26. One test
was rewritten so it could fail but still could not detect the case it named; one line had
its reason string made safe while the claim it recorded stayed false. Re-auditing the
previous audit's own fixes is now the highest-yield part of this process.

---

## HIGH — fixed

### The X-Ray binding test could not fail

This is the uncomfortable one: the M26 audit found that X-Ray component states were not
bound to the graph, a test was added, and the fix was reported as landed. The test was
present but **vacuous**, which is worse than a known gap — it advertised a guarantee it
did not provide.

The test compared each component against the **strongest** graph node touching any of
its sources. `cmp.mlops.runtime-lab` is the honesty boundary at `PORTFOLIO_EXTENSION`,
and it cites `src.mlops.repo`, which also backs `ev.mlops.project` and
`ev.mlops.monitoring`, both `PUBLIC_CODE_VERIFIED`. So the ceiling was the top of the
scale and upgrading the browser lab to code-verified still passed — the exact
silent upgrade the test existed to prevent. The other six components were already at the
ceiling, so the assertion had nothing to catch anywhere.

Inverting to the weakest backing node does not work either: `ev.mlops.runtime-lab` cites
`src.mlops.repo` too, so `cmp.mlops.repo-surface` would be wrongly capped at
`PORTFOLIO_EXTENSION`. **Source overlap cannot answer this question** — one source
legitimately backs both a verified claim and a simulation boundary.

Fixed by making the mapping explicit, the way M9's architecture stages already do: each
component declares the `nodeId` it represents, and the test asserts **exact equality**
with that node's state. Two further tests stop the obvious ways around it — the boundary
component is pinned to `PORTFOLIO_EXTENSION` by name, and a component's declared node
must share at least one source with it, so a component cannot be pointed at a
conveniently-stated but unrelated node.

**Proof it bites:** upgrading `cmp.mlops.runtime-lab` to `PUBLIC_CODE_VERIFIED` now fails
two tests with `cmp.mlops.runtime-lab claims PUBLIC_CODE_VERIFIED but ev.mlops.runtime-lab
is PORTFOLIO_EXTENSION`. Under the old test it passed.

## MEDIUM — one fixed, one needs a decision

### Decision states were unpinned (fixed)

`dec.mlops.lab-boundary` carried a hand-authored `PORTFOLIO_EXTENSION` straight into a
badge with no test reading it — while the Steward and malware bundles both pinned theirs.
All three MLOps decision states are now pinned exactly.

Worth recording a wrong turn: I first wrote a blanket "no decision may claim
`PUBLIC_CODE_VERIFIED`" rule, which immediately failed on `dec.mlops.dual-detectors`.
That claim is honest — both detectors really are in the pinned source files — so the
blanket rule was wrong, not the data. Exact pinning of all three is the correct guard.

### The printed CV drops evidence qualifiers — reviewed, owner accepted

`src/app/cv/page.tsx:94-96` wraps the role `EvidenceBadge` in `no-print`, while the impact
metrics themselves print. A printed CV therefore reads "Approximately 30% fewer API
integration defects" with no `OWNER_CONFIRMED_PROFESSIONAL` label and without the source
note `/experience` shows.

**Owner decision: leave as is.** A CV is a conventional document and the site carries the
qualifiers. Recording it here as a known, deliberate position rather than an oversight,
with the reasoning that supports it:

- All three Cardstack metrics are self-hedged in the corpus itself — "**Approximately**
  30% fewer API integration defects", "**Approximately** 40% faster incident
  investigation", "Zero audit failures across six release cycles". The printed text is
  not stated as a measured, audited figure.
- `/experience` renders the full source note ("Professional impact confirmed by Anish.
  Proprietary employer source code is not public."), and the CV page links back to the
  live origin.
- `/evidence.json` publishes the `OWNER_CONFIRMED_PROFESSIONAL` state, so the machine-
  readable claim carries the qualifier even when the PDF does not.

Revisit if the CV is ever circulated as the primary artefact rather than a companion to
the site.

## LOW — all fixed

- **Stale footer.** Every page, including live, read `locked through M26`. Now M27, with
  the e2e assertion updated in the same change.
- **`expect.any(Number)` on seeded data.** `lab-session.test.ts` asserted the histogram
  row shape rather than its values, so it would have survived the M26 histogram bug. Now
  pins all ten bins exactly and checks both totals sum to the sample count.
- **The M9 scrubber was never moved.** The test clicked the range input, which changes
  nothing; the stage change it then asserted came from two `Next` clicks. Now uses
  `fireEvent.change` in both directions, and a second test covers the cumulative map
  including that unrevealed stages stay disabled. Mutation-proved: stubbing `onChange`
  fails it.
- **`stewardSafetyLabSourceTrace` had no parity test** — the only lab trace without one.
  Now pinned against the graph by SHA, path, and URL.
- **Soft bound on an exact count.** `counts.error` in the Steward invalid-input scenario
  is exactly 2, not "at least 1".

---

## M14 → M23, re-checked in detail — two further defects, both fixed

The three M26 fixes to softened assertions all held and now assert unconditionally. Two
new defects surfaced, neither of which would ever have appeared as a test failure.

### HIGH — Fork manufactured an interaction, on the page that publishes zero fabrication

`ForkAnish` recorded `session.recordItem("route:experience", …)` on every fork. The
previous audit had corrected the _reason string_ on that line so it no longer echoed the
pasted job description, and stopped there — the reason was made safe, but the item itself
was never true. `route:experience` is a canonical item, so pasting a JD fabricated a
visit to a route the visitor never opened, with three consequences inside locked
contracts:

1. **It could turn on the M19 Recompile banner by itself.** Three real visits sit below
   `MIN_MEANINGFUL_INTERACTIONS`; the injected item made four, and `SOFTWARE_CLOUD`
   carried a category share the visitor never expressed.
2. **It rendered on `/ending` as a journey node** labelled "Experience" linking
   `/experience`, counting toward `canonicalNodesRepresented` and the density
   classification.
3. **It contradicted the manifest on that same page,** which publishes
   `fabricatedInteractions: 0`.

**Fixed by deleting the call, not by relabelling it.** Forking is not a visit to a route
and reveals no topic interest, so no session item is honest here — and the fork was
already recorded through the channel that _is_ true, the `FORK_BRANCH` runtime action,
which is untouched. The component no longer consumes the session context at all. Two
tests now hold it: the session trail is exactly empty after a fork, and `route:experience`
/ `route:cv` never appear. The earlier JD-leak assertion is folded into the first, since
an empty trail cannot leak.

### CRITICAL (test integrity) — a fourth softened assertion, in a fourth file

`ask-runtime.test.tsx` wrapped the M16 semantic check in `if (semantic) … else …`, where
the `else` branch asserted the gap notice. The query is deterministic — retrieval returns
0 deterministic and 8 semantic hits — so the `else` branch was dead code acting as an
escape hatch: had semantic retrieval regressed to zero hits, the gap notice would have
rendered, the `else` would have asserted it, and a test named for the semantic section
would have reported green with that section gone. Now asserts the heading and the
"similarity never upgrades proof" line unconditionally, and asserts the gap notice is
_absent_. This is the same defect class as the three found at M26, which is what prompted
the drift guard below.

### MEDIUM — vacuous loops over possibly-empty arrays

Three tests guarding M17's two central contracts looped without first asserting the array
was non-empty, so an orchestrator that stopped calling tools or returning evidence would
have passed the very tests written to prevent it: `signal.test.ts` on the tool allowlist
and on inventing evidence IDs, and `interview.test.ts` on repeat collapsing. All three now
assert a non-empty array first. `signal.test.ts` also replaced a `toBeTruthy()` with the
exact top-hit ID — which immediately proved its worth by failing, since the real top hit
is `node:ev.exp.cardstack`, not the ID assumed when writing it.

### MEDIUM — the footer marker drifted twice, so it is now derived rather than trusted

The `locked through Mnn` marker had already lagged a lock at M24 and lagged again here,
and `README.md` was still on M26 at the time of this audit. Worse, the e2e assertion pins
the string, so editing it to match a stale value converts the check into an _enforcer_ of
the drift. New `src/components/site-chrome.test.tsx` binds all three — footer, e2e
assertion, and README line — to the highest `Locked` row in
`docs/planning/milestones.md`. Mutation-proved: reverting the footer to M26 fails with
"footer says M26 but the milestones table records M27 as locked".

### LOW — fixed, and one rule documented as unenforced

- **The M22 map pointed the unconfigured LLM provider at the composer's file.** Honest in
  its label and detail, but the path belonged to a different subsystem, and an existence
  check cannot tell a real path from a plausible stand-in. `path` is now `string | null`,
  the provider carries `null`, and the UI prints "no code in this deployment". Three
  tests: existing paths still exist, only an `OPTIONAL_PROVIDER` may be pathless, and no
  two subsystems share a path — which is how the stand-in was detectable at all.
- **The exact 60% Recompile boundary was untested.** Covered now at 3 of 5 distinct
  items, where `share < MIN_LEADING_SHARE` must be false.
- **`MIN_DISTINCT_SUPPORTING` (≥2 supporting items) is unreachable and stays that way.**
  Past the interaction gate there are ≥4 distinct items across three categories, so by
  pigeonhole the leading bucket already holds 2. Kept as defensive code with a comment
  saying so, since it would start enforcing if either constant moved — but it is
  documentation today, not a gate, and is recorded as such rather than counted as a
  tested rule.

### Re-verified as sound, and not to be re-litigated

Signal has no LLM in the request path at all, so "the planner passes IDs only" is
structural rather than merely enforced. Privacy is clean by construction: a repo-wide
search of `src` for `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`,
`sendBeacon`, `gtag`, `analytics`, `posthog`, `plausible` and `console.*` returns one hit
— the comment stating there are no analytics. The runtime trace rejects unknown keys by
allowlist rather than stripping them, and names the rejected field. Both lab challenge
recorders remain gated on real completion. ADRs 0016–0025 are all present.

**Suite after these fixes:** 71 files, **493 tests, 493 passed** (was 486). Typecheck,
lint, and format clean. `freeze:check` still reports 96 claims matching
`42f8efd8bc5c2aa7` (OWNER_CONFIRMED) — none of this touched a published claim, which is
the expected result for test-integrity and honesty fixes.

---

## M24 — M27, verified directly

### Live origin

`pnpm smoke:live https://anish-runtime.vercel.app` — **38/38**. HTTPS with HSTS,
security headers, the production CSP, every public route, a real 404, the recruiter path
in raw server HTML, absolute canonical and card URLs with no `localhost` surviving,
robots and sitemap agreeing with the indexing policy, session-shaped routes still
noindex, machine-readable routes served, and Signal still refusing cross-origin callers.

### Did the M26-audit fixes actually reach production?

Green CI proves the repository is correct. It does not prove the deploy shipped. A
22-check probe against the live origin, all passing:

- The **ANSWER KEY boundary is in the server HTML of `/interview`** with no question set
  built — the exact condition the fix was for, verified on the deployed site rather than
  in a test renderer.
- **`var(--ink)` no longer appears** in any shipped stylesheet.
- `/fork` carries no fit score or hiring recommendation as a claim.
- `/labs/mlops` surfaces PSI and KS with the `PORTFOLIO_EXTENSION` boundary and no
  fabricated Grafana copy.
- All six recruiter routes return 200 with identity present.
- All four `/work/<slug>` pages the new READMEs link to return 200.

Two probe flags were investigated and are false positives, both the same polarity
blind spot the M26 audit documented:

- "no scoring language on `/interview`" fired on the meta description **"No answer key,
  no candidate score."** and on the evidence node titled "No candidate fit scores /
  hiring recommendations", whose aliases are literally `fit score` and `hiring score`.
  Substring search cannot tell a prohibition from a promise.
- "no undefined custom properties" fired on `--tw-leading`, `--tw-ease`,
  `--tw-duration`, and `--default-font-feature-settings`. Every one is used with a
  fallback — `var(--tw-leading, var(--text-2xl--line-height))` — so the declaration is
  valid when unset. The unit test scans authored CSS only, which is the right scope.

### Freeze and provenance

- `pnpm freeze:check` — 96 claims, digest `42f8efd8bc5c2aa7`, `OWNER_CONFIRMED`,
  unchanged across all of M26 and M27 as it should be, since neither milestone touched
  the corpus.
- `pnpm verify:sources` — 18/18 reachable, 5 exempt by design.
- The scheduled workflow was dispatched twice and succeeded both times, opening no
  issue. The issue-creation branch remains unexercised; breaking a real pin to test it
  would be worse than the gap.

### M27's own risk: do the published READMEs contradict the corpus?

This is the new failure mode. Four repositories now carry substantial claims in Anish's
voice, and none of them are covered by this repository's CI. Audited directly against
the frozen corpus:

| Check                                                                                  | Result                            |
| -------------------------------------------------------------------------------------- | --------------------------------- |
| Overclaim vocabulary (production, uptime, SLA, 99.x%, enterprise-scale, battle-tested) | clean                             |
| Excluded email or conflicting profile leaked                                           | none in any of the four           |
| Commit SHAs quoted                                                                     | 3 cited, all pinned in the corpus |
| Malware README states report-only                                                      | yes                               |
| MLOps README discloses its single smoke-test file                                      | yes                               |
| MLOps README warns its declared deps are unwired                                       | yes                               |
| Steward README states the clinical boundary and synthetic data                         | yes                               |
| Each links its own `/work/<slug>` page                                                 | yes                               |
| Links resolve                                                                          | 31/31                             |

One flag, investigated and dismissed: "uptime" in the MLOps README is the sentence
**"no live traffic, no real model behind it, no uptime to quote."** A negation again.

The evidence states line up with what each README says: the malware repository is
`PUBLIC_DOCUMENT_VERIFIED` and its README leads with holding the report and no model
code; the other three are `PUBLIC_CODE_VERIFIED` and describe code that exists.

### Repository metadata

All four flagships now carry a description, topics (6/6/5/5), and a homepage pointing at
their portfolio page. Values match `PUBLIC-PRESENCE.md`, which matches the corpus.

### CI

Every workflow run on `main` is green, including the two `Verify sources` dispatches.

---

## Known gaps carried forward

- **Profile bio and pinned repositories are not done, and cannot be done from here.**
  GitHub exposes no public GraphQL mutation for pinning repositories to a profile — the
  schema has `pinIssue` and `pinEnvironment`, nothing for repositories — and setting the
  bio needs a `user` token scope this environment does not have. Owner action, in the
  browser.
- **The human launch checklist** from M26 — real phone, screen reader, print, reading
  the claims cold.
- **Six Dependabot PRs**, red only because they branched before the typegen fix, and
  three actions on deprecated Node 20.
- **Local `pnpm ci` still excludes e2e**, documented in `TEST-STATUS.md`; CI runs it.
- **`verify:sources` issue-creation branch unexercised**, as above.
