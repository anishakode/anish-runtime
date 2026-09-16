# M25 — Evidence Freeze

**Status:** Built — awaiting owner confirmation of the facts, then lock
**Handoff:** §44
**ADR:** `docs/adr/0027-evidence-freeze.md`

## What shipped

The public corpus is now frozen as **96 claims** and enforced by `pnpm freeze:check`,
which runs inside `pnpm ci` and in CI. A claim is anything a reader could hold Anish to:
an identity fact, an education entry, a role, an impact number, a project tier, an
evidence state, a commit fingerprint, an exclusion, a corpus count.

| Piece                           | Purpose                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `src/lib/freeze/claims.ts`      | Projects the graph into claims and hashes each one                                 |
| `src/lib/freeze/strength.ts`    | Explicit strongest-to-weakest ranking of the eight evidence states                 |
| `src/lib/freeze/verify.ts`      | Detects ADDED / CHANGED / REMOVED / STRENGTHENED and applies change control        |
| `content/evidence/freeze.json`  | The frozen snapshot: 96 claims, corpus digest `42f8efd8bc5c2aa7`                   |
| `docs/evidence/CLAIM-LEDGER.md` | Generated ledger — every claim and the evidence answering "where is the evidence?" |
| `scripts/freeze-evidence.ts`    | `freeze:check` · `freeze:write` · `freeze:ledger`                                  |

**Strengthening is treated differently from weakening.** Weakening a claim needs only a
change-control entry. Strengthening needs an entry that names the exact transition _and_
at least one new source id — a reason is not evidence. This is the handoff's rule in
code: if evidence cannot answer the question, weaken the claim rather than invent proof.

The guard was verified by attack, not by assertion alone: upgrading
`ev.malware.shap-limited` from `LIMITED_EVIDENCE` to `PUBLIC_CODE_VERIFIED` in the corpus
made `pnpm freeze:check` exit 1 and name the claim, the direction, and the missing
change-control entry.

## Anti-strengthening pass

Handoff §44 asks whether any claim quietly got stronger during M1–M24. **No strengthening
found.** Every state the milestone reports documented still matches the live corpus:

| Documented                                        | Where                 | Live                                                                                     |
| ------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| SHAP detail stays `LIMITED_EVIDENCE`              | M13 report            | `ev.malware.shap-limited` = LIMITED_EVIDENCE                                             |
| Failure Museum may stay empty, `NOT_DEMONSTRATED` | M14 report / ADR 0016 | `ev.boundary.failure-museum-empty` = NOT_DEMONSTRATED, `CANONICAL_FAILURE_EXHIBITS = []` |
| Three browser labs are `PORTFOLIO_EXTENSION`      | M6 / M12 / M13        | all three = PORTFOLIO_EXTENSION                                                          |
| Cardstack metrics are owner-confirmed only        | M1 / exclusions       | three metrics = OWNER_CONFIRMED_PROFESSIONAL, source `src.owner.cardstack-impact`        |
| Malware project rests on a document, not code     | M13                   | `PUBLIC_DOCUMENT_VERIFIED`, not upgraded to code-verified                                |
| No fit scores or hiring language                  | M20                   | `ev.boundary.no-fit-scores` = NOT_DEMONSTRATED                                           |

Fingerprints also hold: **18 of 23 sources carry a commit SHA**, and the five without one
are exactly the kinds that cannot have one — the owner confirmation, the résumé, and the
three portfolio-runtime labs. No GitHub-backed source is unpinned.

**Method caveat, stated plainly:** this pass compares the corpus against the milestone
reports, not against git history. It could not use git history — see below.

## The repository has no history

`git log` shows **one commit** ("Initial commit from Create Next App") and **20 tracked
files**. Everything built across M0–M24 — the entire evidence corpus, all source, all
docs — is uncommitted working-tree state in a cloud-synced folder.

Two consequences, one of them urgent:

1. **The work is one accident away from gone.** During this milestone a deliberate tamper
   test could not be undone with `git checkout`, because the file was not tracked; it had
   to be repaired by hand.
2. **Change control has nothing to anchor to.** ADR 0027 says the real tamper-evidence is
   review of the diff. That is true only once there are commits to diff against.

This is an owner decision, not something to fix silently. Recommended before lock:
commit the work, then re-run `pnpm ci`.

## Owner confirmation still required

25 claims rest on the owner's word or on a résumé, and no validator can check them. The
manifest status is therefore **`PENDING_OWNER_CONFIRMATION`**. The full list is in the
ledger; the ones that carry the most risk in an interview are the three Cardstack impact
metrics (≈30% fewer API integration defects, zero audit failures across six release
cycles, ≈40% faster incident investigation), the employment dates, both degrees with
their grades, and the location and email.

Confirming is a deliberate act: `pnpm freeze:write --confirmed`.

## Tests

- `src/lib/freeze/freeze.test.ts` — 25 tests covering the projection, the strength
  ranking, and every rejection path, including three ways a change-control entry can be
  wrong (mismatched digests, a strengthening with no evidence, a strengthening that names
  the wrong transition).
- Every assertion was checked to be able to fail; the freeze guard was additionally
  verified by tampering with the real corpus.

## Validation

- `pnpm run ci` — green (scope · evidence · **freeze** · format · lint · typecheck · 458 tests / 68 files · build · bundle budget)
- `pnpm freeze:check` — 96 claims match `42f8efd8bc5c2aa7` (PENDING_OWNER_CONFIRMATION)
- `node scripts/validate-scope.mjs` — OK, with the eight new M25 paths required

## Not done, deliberately

- **Signing the manifest.** The key would live beside the thing it protects in a
  single-maintainer repository — ceremony, not security. Recorded in ADR 0027.
- **Freezing CV and project copy rendered outside the graph.** All public copy already
  derives from the graph; if that ever stops being true, the freeze must extend to it.

**Ask:** Confirm the 25 owner-only claims (or correct them first), decide on committing
the repository, then lock M25?
