# ADR 0029 — Proof trail integrity (M27)

**Status:** Accepted
**Date:** 2026-09-16
**Milestone:** M27

## Context

The portfolio's central claim is that its evidence is inspectable: "Don't read what I
can do. Run it. Break it. Inspect it. Trace the proof." Source Trace exists so a visitor
can follow any claim to a SHA-pinned file on GitHub.

Two things were undermining that at the end of M26.

The destinations were thin. `MLOps-Governance-Dashboard` — the flagship behind the
Runtime Lab, Reversible Architecture, and X-Ray — had a 29-byte README.
`Malware-Detection-Using-ML` had 28 bytes. None of the four flagships had a
description, topics, or a homepage. A visitor who did exactly what the site asked
arrived somewhere that looked abandoned.

And provenance was verified once. The M25 freeze proves a claim has not changed
_locally_; it cannot know that a repository was renamed or a file moved. A dead pin
would leave the site presenting a 404 as proof, and nothing would notice.

## Decision

### Verify reachability continuously, outside the main pipeline

`pnpm verify:sources` resolves every cited URL and confirms it still responds. The
logic is a pure function over the source list with the fetcher injected, so the failure
modes are unit-testable without a network.

It is **not** in `pnpm ci`. A flaky network or a GitHub rate limit must not fail an
otherwise correct build — a check that fails for reasons unrelated to correctness gets
ignored, and an ignored check is worse than no check. It runs on a schedule and before
publishing anything that leans on the provenance.

A thrown network error counts as a failure, never a pass. The alternative — treating an
unreachable host as "probably fine" — defeats the purpose.

### Exempt only the source types with nothing to point at

`owner_confirmation`, `resume`, and `portfolio_runtime` have no public URL by design.
That list is a constant, and any other type without a URL is reported as a provenance
gap. Otherwise a new URL-less source type could be added and quietly skipped.

### Rewrite three READMEs, patch the fourth

`Steward_AI` already had a good README. Replacing it would lose accurate detail, so it
gets two targeted changes: hoist the clinical disclaimer above the architecture diagram,
and link the interactive walkthrough.

### Ground every draft in the actual repository

Each draft was written after surveying the repository tree and reading the CI workflow,
dependency manifest, and test files. This produced three statements a generated README
would not have made:

- MLOps has exactly one test file asserting two things, and its statistical functions
  are untested in that repository.
- MLOps declares `mlflow`, `redis`, and `celery` in `requirements.txt` without those
  being wired up — the same reason the portfolio's X-Ray refuses to draw them as
  components.
- The malware repository contains two files, a report and a README. There is no model
  code to run.

Each of those makes the project look smaller than a vague README would. That is the
point: a boundary a reader can verify is what makes the rest credible.

### Explain the Steward discrepancy rather than hide it

`generate_stewardship_recommendation` is implemented in the repository but renders as
`blocked` in the portfolio lab. Anyone comparing the two would reasonably read that as
dishonesty in one direction or the other, so the patch states the reason: a public page
should not emit anything resembling antibiotic guidance, so the lab shows the workflow
reaching the tool and stopping.

### Drafts stay local until the owner applies them

The drafts live in `docs/presence/` and are pasted by hand. Repository metadata is
scripted with `gh`, with values taken from `PUBLIC-PRESENCE.md` so the two documents
cannot drift apart.

## Consequences

- Link rot becomes a failing check instead of a silent falsehood.
- The four flagships gain READMEs that state their own boundaries, in their own words,
  consistent with their evidence states in the frozen corpus.
- README content in other repositories is outside this repository's CI. The drafts are
  reviewed here, but nothing prevents later edits there from contradicting the corpus.
  Accepted: the alternative is a cross-repository sync no one would maintain.
- `verify:sources` needs network access, so it cannot gate a build. Accepted for the
  reason above.

## Alternatives rejected

**Put reachability in `pnpm ci`.** Rejected — network flakiness would train everyone to
ignore a red build.

**Use the GitHub API to verify commits and paths.** More precise, but needs a token and
hits rate limits. Fetching the URL checks the same thing a visitor experiences, which is
the thing that actually matters.

**Generate READMEs from the Evidence Graph.** Rejected. The graph holds the portfolio's
claims about a project; a README is the project speaking for itself. Generating one
would produce four pages of identical shape that read like marketing.
