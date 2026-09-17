# ADR 0030 — Subtraction pass: dead logic, a fake choice, and inverted prominence

**Status:** Accepted (post-M27)
**Context:** An owner-requested strict review of every segment, with a mandate to remove
whatever was not needed. The finding that mattered was not code volume — the repository is
lean, with four runtime dependencies and no unused packages — but three places where the
codebase claimed more structure than it had, and one where the navigation promoted the
weakest surfaces over the strongest.

## Decisions

### Dead helpers with passing tests are removed, not kept "in case"

`isNoindexRoute()` and `architectureStageAt()` were both exported, both tested, and both
uncalled by any production path. The indexing policy is applied by `robots.ts` reading
`NOINDEX_ROUTES` directly and by pages spreading `NOINDEX_METADATA`; the scrubber never
asked for a single stage.

Deleted, with their assertions. Tests passing against code nothing runs are worse than no
tests: they report coverage over a path that cannot regress, and they make the real
implementation look guarded when it is not. `seo.test.ts` keeps the assertion that carried
the actual value — that no route appears in both the indexable and noindex lists.

`scripts/inspect-chunks.mjs` went the same way: a debugging aid from the M24 bundle work,
referenced by no script, workflow, or document.

### The reveal rule is generic, so its one test guards the real path

`revealedArchitectureStages(index)` returned `ArchitectureStageDef[]` and was called only by
its own test. The shipped scrubber computed `stages.slice(0, safeIndex + 1)` inline over
graph-enriched `ArchitectureStageView`s — a different type, which is why the duplication was
never obvious.

So the reveal rule existed twice and only the unused copy was tested. An off-by-one corrected
in the library would not have reached the UI, and the test would still have passed.

The function is now generic over the stage shape and the scrubber calls it. One implementation,
one test, exercising what actually renders. Clamping of out-of-range indices is now asserted
too, since the component shares that exact call.

### Two presets, because three included a duplicate

`2min` and `explore` both showed three flagships and the constellation and both sent the
visitor to `/work`. They differed in compile dwell — 650ms against 420ms — and in whether the
button read "View work" or "Browse all work".

`docs/milestones/M4-PRELOCK-AUDIT.md` recorded this at M4: _"settled IA is the same for
20 SEC / 2 MIN / EXPLORE. Copy implies richer differentiation than shipped."_ It was logged
and never fixed, and survived twenty-three subsequent milestones.

`explore` is removed. A preset picker whose entire value is honestly respecting the reader's
time cannot itself offer a choice that is not one — that is the same defect as an unearned
evidence badge, in interaction rather than prose. `runtime-model.test.ts` now asserts that no
two presets agree on every layout field, so a decorative third cannot return.

### Runtime Labs take a top-level nav slot; Fork and Interview move to the footer

The header carried `FORK ANISH` and `INTERVIEW` as buttons beside the primary nav. The three
Runtime Labs — the surfaces that make "run it, break it, inspect it" true, and the only place
real math is computed from visitor input — had no top-level entry at all. They were reachable
only from inside a project page.

The most speculative features were therefore the most prominent, and the best-evidenced ones
were two clicks down. Fork and Interview also produce the least for a recruiter: one refuses
to give a fit score, the other ships no answer key, both correctly.

A `/labs` index is added and `Labs` joins the primary nav. Fork and Interview move to a
labelled footer nav beside Under the Surface and Ending Signal, grouping the four
session-shaped surfaces where they belong. The five recruiter routes are untouched.

Demotion is not removal, and the footer links are load-bearing: `/fork` and `/interview` are
`noindex`, so losing their only inbound link would make them unreachable by visitors and
crawlers alike. A test asserts all four remain reachable from the footer, and that neither
returns to the header.

### The labs index reuses the existing registry rather than adding a second list

The lab set already existed as a private `LAB_REFS` constant inside `src/lib/ending/catalog.ts`.
Writing a fresh list for the index would have reproduced the exact defect corrected two
decisions above.

`src/lib/labs/catalog.ts` is now the single registry; the journey catalog derives from it. Only
the labels and an operating-verb line are local — each lab's summary and evidence state are read
from its graph node, so the index cannot describe a lab more favourably than the corpus does,
and all three badge `PORTFOLIO_EXTENSION` on the page where the visitor chooses what to open.

### The product constitution leaves the public repository

`ANISH_RUNTIME_MASTER_HANDOFF.md` was 1,783 lines in the repository root, containing
"PHASE-2 / DEFERRED IDEAS", "NEXT ROADMAP", and "FINAL INSTRUCTION TO THE NEXT AI AGENT"
alongside shipped contracts. A visitor cannot tell built from planned.

On a site whose whole argument is that a claim must carry its evidence, publishing a spec a
reader could mistake for a list of claims is the largest overclaim risk in the repository —
and it sat one file away from a README doing the opposite job well.

It is gitignored and kept in the working tree, so agent work is unaffected and
`validate-scope` no longer requires it. **History is deliberately not rewritten.** Earlier
commits still contain the file and it remains retrievable. Purging it would mean a force-push
over the history that the freeze's tamper-evidence story depends on — spending real
provenance to tidy a presentation concern. Removing it from `HEAD` stops it framing the
repository; that is the whole goal, and it is worth being explicit that this is not erasure.

## Consequences

- Four fewer exported symbols, one fewer script, one fewer preset, one less duplicated rule.
- One new route (`/labs`), indexable, server-rendered, and covered by the no-JS and axe suites.
- Three new test files' worth of assertions covering the registry, the index, and the
  prominence contract — including the two guards that would have caught the preset duplicate
  and the nav inversion had they existed earlier.
- No evidence claim changed. The freeze remains 99 claims at `551e9d36a463f48f`, unchanged,
  because nothing here touched the corpus — only what the site does with it.
