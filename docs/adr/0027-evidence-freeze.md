# ADR 0027 — Evidence freeze

**Status:** Accepted (M25)
**Context:** Handoff §44. After M24 the system was production-ready; what it _claims_
was still free to drift. M25 freezes the public corpus so that changing professional
truth becomes a deliberate, attributable act.

## Decision

Freeze **claims**, not files. A claim is anything a reader could hold Anish to: an
identity fact, an education entry, a role, an impact number, a project tier, an evidence
state, a commit fingerprint, an exclusion, a corpus count. `buildClaimSet` projects the
graph into 96 such claims, each hashed into a short digest, recorded in
`content/evidence/freeze.json`, and checked by `pnpm freeze:check` in `pnpm ci` and CI.

### Why claims rather than a file hash

A hash of `graph.json` would fail on whitespace and say nothing useful when it did.
Claim digests report _which_ claim moved and _how_ — `"MLOps Governance Dashboard
(flagship) — …" → "… used in production at scale"` — which is the sentence a reviewer
needs to judge whether the change is honest.

### Direction matters: strengthening needs evidence

Every state is ranked in `strength.ts`, strongest first. A claim that weakens
(`PUBLIC_CODE_VERIFIED → LIMITED_EVIDENCE`) needs only a change-control entry.
A claim that _strengthens_ needs an entry whose `strengthening` block names the exact
transition and at least one new source id. A reason is not evidence, and an entry that
names the wrong transition is rejected. This encodes the handoff's rule directly: if
evidence cannot answer the question, weaken the claim rather than invent proof.

`PORTFOLIO_EXTENSION` is ranked below `RESUME_DOCUMENTED` even though it is a boundary
label rather than a strength tier. Moving a claim _to_ it is an honest weakening; moving
_from_ it up to a verified state is precisely what this milestone exists to catch.

### What the freeze does not do

It makes a change loud and attributable. It does not make one impossible: whoever can
edit the corpus can also write a change-control entry. The real tamper-evidence is
review of the diff. That is an honest limitation, recorded here rather than dressed up
as cryptographic guarantee — and it is weaker than intended today, because the
repository has one commit and the corpus is untracked (see the M25 report).

### Status is part of the truth

The manifest carries `status`. It is `PENDING_OWNER_CONFIRMATION` until the owner
confirms the facts no validator can check — the 25 claims resting on a résumé or on the
owner's word, including the three Cardstack impact metrics. Writing
`OWNER_CONFIRMED` is a deliberate `pnpm freeze:write --confirmed`, not a default.

## Consequences

- Any edit to the evidence corpus now fails `pnpm ci` until it is recorded. That friction
  is the point, and it applies to agents as much as to the owner.
- `docs/evidence/CLAIM-LEDGER.md` is generated, so the public answer to "where is the
  evidence?" cannot drift from what the site renders.
- Claims backed only by the owner's word are labelled as such in the ledger rather than
  being quietly presented alongside verifiable ones.

## Alternatives rejected

- **Signing the manifest.** Real tamper-evidence, but the private key would live beside
  the thing it protects in a single-maintainer repository. Ceremony without security.
- **Freezing only at launch (M26).** Leaves the corpus unguarded through the launch
  changes, which is exactly when copy tends to get more confident.
- **Warning instead of failing.** The owner chose hard enforcement; a warning that never
  blocks is a comment.
