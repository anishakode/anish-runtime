# M27 — Proof Trail Integrity

**Status:** Built — drafts awaiting owner review
**Approved:** owner, after the M26 lock audit
**Scope:** make the destinations of the evidence trail worthy of the claims pointing at
them, and make provenance continuously verified rather than verified once.

## Why this milestone

The M26 lock audit confirmed the site itself is honest. Looking outward at where the
proof trail actually leads found the gap:

| Repository                   | README      | Description | Topics | Homepage |
| ---------------------------- | ----------- | ----------- | ------ | -------- |
| `MLOps-Governance-Dashboard` | 29 bytes    | none        | none   | none     |
| `Malware-Detection-Using-ML` | 28 bytes    | none        | none   | none     |
| `Boring_AI`                  | 1,583 bytes | none        | none   | none     |
| `Steward_AI`                 | 5,707 bytes | none        | none   | none     |

The site invites visitors to inspect the proof. Every Source Trace on the MLOps
project — the flagship with the Runtime Lab, PSI/KS maths, Reversible Architecture and
X-Ray — led to a repository with a 29-byte README. The code is real and SHA-pinned; the
destination undercut it.

## Shipped

### `pnpm verify:sources`

Resolves all 23 cited sources and confirms they still respond. Currently **18/18
reachable, 5 exempt by design**.

The logic is a pure function with the fetcher injected, so every failure mode is tested
without touching a network: a moved path (404), a renamed repository (301), an
unreachable host (thrown error, which counts as a failure and never a pass), a URL-less
source of a type that should carry one, and multiple failures reported together rather
than stopping at the first. A separate check confirms every pinned URL actually contains
the commit it claims — verified against the real corpus, not just fixtures.

Deliberately **not** in `pnpm ci`. See ADR 0029: a check that fails for reasons
unrelated to correctness gets ignored.

### Four flagship README drafts

In `docs/presence/`, for review before anything is pushed. Three full drafts and one
patch — `Steward_AI` already had a good README, so replacing it would have lost accurate
detail.

Each draft was written after surveying the repository: file tree, CI workflow,
dependency manifest, test files. That produced three statements worth calling out,
because each makes a project look _smaller_ than vague copy would:

- **MLOps** — `tests/test_smoke.py` is the only test file and asserts two things; the
  statistical functions have no tests in that repository. The draft also warns that
  `requirements.txt` declaring `mlflow`, `redis`, and `celery` does not mean they are
  wired up — the same reason the portfolio's X-Ray refuses to draw them.
- **Malware** — the repository contains two files, the report and the README. No model
  code. The draft leads with that, consistent with the project being
  `PUBLIC_DOCUMENT_VERIFIED` rather than `PUBLIC_CODE_VERIFIED`.
- **Boring_AI** — the `geth-poa-factory-unchanged` fixture asserts the codemod leaves
  valid code alone. A codemod that rewrites too eagerly does silent damage, so a test
  whose expected output is byte-identical to its input is the most interesting one in
  the set.

The Steward patch also explains a discrepancy rather than leaving it to be discovered:
`generate_stewardship_recommendation` is implemented in the repository but shows as
`blocked` in the portfolio lab, because a public page should not emit anything that
reads like antibiotic guidance.

### Repository metadata

Ready-to-run `gh repo edit` commands in `docs/presence/README.md`, with descriptions and
topics taken from `PUBLIC-PRESENCE.md` so the two cannot drift.

## Validation

| Check                 | Result                      |
| --------------------- | --------------------------- |
| `pnpm ci`             | pass                        |
| `pnpm test`           | 480 passed                  |
| `pnpm verify:sources` | 18/18 reachable, 5 exempt   |
| `pnpm test:e2e:prod`  | 142 passed                  |
| `pnpm freeze:check`   | 96 claims, digest unchanged |

The freeze digest is unchanged, as expected — M27 adds no claims and edits no evidence.

## Tests added

- `src/lib/sources/verify.test.ts` — 10 cases covering reachability, both pin-integrity
  branches, and the exemption list.

## Not done

- **Applying the drafts.** Owner's call; they are paste-by-hand by request.
- **Scheduling `verify:sources`.** It runs on demand today. A weekly GitHub Action is
  the obvious follow-up, but scheduling it should be a deliberate decision, not a
  default.
- **The human launch checklist** from M26 — real phone, screen reader, print, reading
  the claims cold.
- **Six Dependabot PRs** and three actions on deprecated Node 20.

## Owner decisions needed

1. Review the four drafts, then apply or amend.
2. Whether to run the metadata commands now.
3. Whether `verify:sources` should run on a schedule.
