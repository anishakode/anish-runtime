---
name: milestone-ship
description: >-
  Definition of done, validation, and report templates for ANISH // RUNTIME
  milestones. Use when finishing a milestone, asking if work is complete, or
  preparing owner lock. Requires tests updated whenever new behavior is
  introduced; after lock, requires lock-stage-audit cumulative check.
---

# Milestone Ship

## Definition of done

A milestone is done only when **all** apply:

- [ ] Owner-approved scope implemented (no silent extras)
- [ ] Truth boundaries intact; evidence unchanged unless authorised
- [ ] Accessibility considered (keyboard, focus, semantics)
- [ ] Mobile behavior exists
- [ ] Reduced-motion behavior exists
- [ ] Privacy reviewed (session-only; no profiling)
- [ ] Security reviewed if AI/APIs/labs touched (bounds, allowlists, secrets)
- [ ] Performance implications reviewed
- [ ] **Tests updated in the same change** whenever new behavior is introduced (routes, UI contracts, graph/schema rules, validators, regressions). Extend existing cases; add new ones for new surfaces; remove/adjust obsolete assertions
- [ ] Lint/typecheck/tests pass
- [ ] Implementation report written (include what tests were added/updated)
- [ ] Verification notes written
- [ ] Owner explicitly approves/locks

## Tests with every introduction

Whenever implementation adds or changes product behavior:

1. Add or update unit tests for logic/contracts (schema, loaders, queries, pure UI assertions).
2. Add or update e2e/smoke coverage for new or changed routes and recruiter-critical paths.
3. Update fixtures/assertions when Evidence Graph or copy contracts change — do not leave stale expectations.
4. Note test deltas in the milestone report (`Tests added/updated:` …).

Shipping new surfaces without matching test updates fails definition of done.

## Exhaustive edge coverage (no loose ends)

For each new surface, cover edges — not only the happy path:

| Edge class | Examples |
|------------|----------|
| Missing / empty | Empty project tier, no nodes, no experience metrics |
| Invalid input | Unknown slug → 404; bad graph refs rejected by schema |
| Truth / weak states | `PORTFOLIO_EXTENSION`, `LIMITED_EVIDENCE`, `NOT_DEMONSTRATED`, owner-confirmed notes |
| Exclusions | Obsolete email / conflicting profiles never reappear |
| Provenance | GitHub links match fingerprints (SHA), not silent default-branch drift |
| Recruiter path | Work/Experience/About/CV/Contact without labs or AI |
| Chrome / a11y | Skip link, nav labels, print does not wipe page titles |
| Regressions | Prior locked milestones still green after this change |

If an edge cannot be automated yet, record it explicitly under **Known gaps** — never leave it silent.

## Strictness + status (owner mandate)

- Prefer **fail-first** tests: mutate bad inputs and assert rejection (with message where useful); assert **absence** of excluded identity; assert exact hrefs/states, not merely “something rendered.”
- Do **not** weaken assertions to keep CI green.
- After meaningful test changes, run `pnpm test:status` and keep `docs/testing/TEST-STATUS.md` current.
- Maintain `docs/testing/TEST-CATALOG.md` as the map of what each suite protects.
- Milestone reports must include test status summary (pass/fail counts + link to TEST-STATUS).

## Report template

```markdown
## Milestone report: [M# name]
**Scope approved:** …
**Implemented:** …
**Tests added/updated:** …
**Test status:** … passed / … failed — see `docs/testing/TEST-STATUS.md`
**Validation run:** …
**A11y / mobile / reduced-motion:** …
**Truth / privacy notes:** …
**Known gaps / deferred:** …
**Ask:** Lock M#? (yes/no)
```

## After lock

1. **Mandatory:** run `lock-stage-audit` — full check from the first stage, checking all locked stages in detail (not only the milestone just locked).
2. Report lock hygiene (Clean / Fix-then-confirm / Blocked).
3. Stop product work on the next milestone until that audit is reported.
4. Propose next milestone separately via `approval-gate` only after the audit (or owner override).

## Golden questions (block ship if unanswered)

Does this improve evidence inspection? Prefer deterministic over LLM when equal? Recruiter clarity? Failures of AI/JS/motion handled? Hidden profiling? Worth the complexity?
