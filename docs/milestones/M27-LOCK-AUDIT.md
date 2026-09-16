# Lock audit: through M27

**Trigger:** Owner locked M27 (Proof Trail Integrity)
**Stages re-checked:** M0 … M27 — every milestone, in detail
**What is different about this one:** the previous audit could only check the site. M27
published claims to four repositories outside this one, so this is the first audit with
a surface that this repository's CI cannot reach. The question it has to answer is
whether anything Anish now says on GitHub contradicts the frozen corpus.

**Result:** one HIGH defect found — in a fix the previous audit reported as landed —
plus five smaller ones. All fixed and mutation-proved except one truth question that
needs an owner decision.

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

### The printed CV drops evidence qualifiers (owner decision)

`src/app/cv/page.tsx:94-96` wraps the role `EvidenceBadge` in `no-print`, while the impact
metrics themselves print. So a printed CV reads "Approximately 30% fewer API integration
defects" with no `OWNER_CONFIRMED_PROFESSIONAL` label and none of the source note that
`/experience` does show. The PDF is the artefact most likely to circulate detached from
the site, which makes it the worst place to lose the qualifier. Left for the owner
because how the CV should print is a product decision, not a correctness one.

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
