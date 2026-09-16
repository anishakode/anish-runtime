# Lock audit: through M25

**Trigger:** Owner locked M25 (2026-09-16)
**Stages re-checked:** M0 … M25

M25 changed what the repository _permits_ rather than what it renders, so this audit
concentrated on two questions: does the freeze actually hold across every earlier stage's
claims, and did the newly committed git history change any conclusion from the M24 audit.

## CRITICAL

None.

## HIGH

None. The HIGH finding raised at the M24 lock — a report claiming a test file that did
not exist — is closed: `src/lib/seo/seo.test.ts` exists, and the scope validator now
requires the M24 and M25 test paths, so the same class of drift fails the build.

## MEDIUM

None outstanding. Both MEDIUM findings from the M24 lock are resolved and stayed
resolved: the README is current (M25 locked, M26 next) and the footer reads "locked
through M25", with the e2e assertion updated alongside it.

The M25-specific risk found during the milestone — the repository having one commit and
20 tracked files — is resolved. M0–M25 is now eight commits with a clean working tree.

## LOW / deferred

1. **No git remote.** The commits exist only on this machine, so the backup is local.
   Owner deferred pushing to M26 launch.
2. **The freeze is attributable, not tamper-proof.** Whoever can edit the corpus can also
   write a change-control entry; diff review is the real control. Recorded in ADR 0027,
   and now meaningful because history exists.
3. **Social preview image** and **browser matrix beyond Chromium** — both carried forward
   from M24 with their reasons unchanged.
4. **Per-process rate limiting** — unchanged from M24.

## Solid

**The freeze holds across every stage's claims.** 96 claims match digest
`42f8efd8bc5c2aa7` at status `OWNER_CONFIRMED`. The claims are not a re-description of
one milestone: they span M1 identity and education, the M1 Cardstack role and its three
impact metrics, M2 project tiers and summaries, M8 commit fingerprints, M13's
`LIMITED_EVIDENCE` SHAP boundary, M14's empty museum, M20's no-fit-scores boundary, and
the corpus counts that M3.5 publishes through `/evidence.json`. A single silent edit to
any of them now fails `pnpm ci`.

**Nothing strengthened between M1 and M25.** Verified claim by claim against what the
milestone reports documented: SHAP detail is still `LIMITED_EVIDENCE`, the three browser
labs are still `PORTFOLIO_EXTENSION`, the malware project still rests on a document
rather than code, the Cardstack metrics are still owner-confirmed only, and the Failure
Museum is still `NOT_DEMONSTRATED` with `CANONICAL_FAILURE_EXHIBITS = []`.

**Provenance is intact.** Every GitHub-backed source carries a commit pin — the check
`sources of type github_repo / github_file / report with no commitSha` returns 0. The
five unpinned sources are the owner confirmation, the résumé, and the three
portfolio-runtime labs, none of which can have an external commit.

**Recruiter path, privacy, and hardening unchanged.** 138 production e2e tests pass,
including the recruiter path with JavaScript disabled and the raw-HTML check. A
repository-wide sweep for `localStorage`, `sessionStorage`, `document.cookie`,
`sendBeacon`, and analytics returns 0 files in application source, so the zero-tracking
manifests remain true. Security headers, CSP, fault boundaries, bundle budgets, and the
indexing policy are all still asserted against a production build.

**The freeze mechanism itself is tested honestly.** 25 unit tests cover the projection,
the strength ranking, and every rejection path — including three ways a change-control
entry can be wrong. Beyond the tests, the guard was verified by tampering with the real
corpus and watching CI refuse it.

## Commands run

- `pnpm run ci` — green (scope · evidence · freeze · format · lint · typecheck · 458 tests / 68 files · build · bundle budget)
- `pnpm test:e2e:prod` — 138 passed against `next start` (desktop Chromium + Pixel 7)
- `pnpm freeze:check` — 96 claims, `42f8efd8bc5c2aa7`, OWNER_CONFIRMED
- `node scripts/validate-scope.mjs` — OK
- Provenance, privacy, and failure-exhibit sweeps — 0 unpinned GitHub sources, 0 tracking APIs, 0 published exhibits

**Lock hygiene:** Clean.

**Next:** Propose M26 — Launch (handoff §45). It is the first milestone whose result is
not verifiable locally: deployment, a real origin, HTTPS, and live checks.
