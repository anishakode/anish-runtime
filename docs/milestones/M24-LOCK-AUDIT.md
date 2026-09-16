# Lock audit: through M24

**Trigger:** Owner locked M24 (2026-09-16)
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 ·
M12 · M13 · M14 · M15 · M16 · M17 · M18 · M19 · M20 · M21 · M22 · M23 · M24

M24 is the first milestone that changes how _every_ earlier stage is served — headers,
error boundaries, bundle composition, and indexing all apply site-wide. This audit
weighted those cross-cutting effects over re-reading stage logic that has been stable and
test-covered since its own lock.

## CRITICAL

None.

## HIGH

None outstanding. One was found and fixed during this pass:

1. **The M24 report claimed a test file that did not exist.** `src/lib/seo/seo.test.ts`
   was listed as new; the repository had no such file, so the indexing policy — what
   search engines may and may not index — had no unit coverage at all. The scope
   validator did not catch it because the M24 entry listed source paths only. Fixed: the
   file exists with 12 tests, and the four new M24 test paths are now required by
   `scripts/validate-scope.mjs`. This is the second time a report has been more confident
   than the repository (M24's own report found the same class of problem in an M19 e2e
   test that could never have passed), so it is worth naming as a pattern: a claim in a
   report is not evidence until a validator or test enforces it.

## MEDIUM

1. **The public README was thirteen locks stale.** It advertised "Next: M12" and "Locked:
   M0 … M11" while M24 was being locked. Every lock audit from M12 onward updated the
   footer and the milestones table but never the README, so the one file a GitHub visitor
   reads first was the least accurate. Fixed, and the commands section now documents
   `test:e2e:prod`, `check:bundle`, and `ci:full`. Remaining `public-presence` work
   (pinned repos, live URL, profile metadata) stays with M26 launch.
2. **Footer milestone marker lagged the lock** — "locked through M23" with M24 locked.
   Fixed in `site-chrome-static.tsx` with the e2e assertion updated alongside it.

## LOW / deferred

1. **Social preview image.** Handoff §43 lists it. Deferred with reason: with
   `metadataBase` unset the URL stays relative and no crawler can resolve it, so the card
   would be inert. Belongs with the live origin in M26.
2. **Browser matrix.** §43 asks for one; the suite runs desktop Chromium and Pixel 7.
   Owner declined WebKit and Firefox on CI time at this lock. Re-raise at M26 if the live
   site is to be Safari-guaranteed.
3. **Rate limiting is per process.** A multi-instance deployment gets one window each.
   Acceptable while the endpoint is optional and degrades to deterministic search.
4. **Nonce-based CSP.** Would force dynamic rendering for every page; revisit only if a
   third-party script ever ships. Recorded in ADR 0026.

## Solid

**M0–M3.5 foundation.** `validate:scope` and `validate:evidence` pass. The graph reports
10 projects · 40 nodes · 45 edges · 23 sources · 3 metrics, and `/evidence.json` is a
derived projection of the same numbers rather than a parallel source of truth. Evidence
states are never upgraded in UI or copy; the legend derives from `EVIDENCE_STATES`, which
the schema is now built from, so the two cannot drift.

**M2 recruiter path — now proven, not assumed.** Work, Experience, About, CV, and Contact
render with JavaScript disabled, and a separate test fetches the raw server HTML with no
browser involved to confirm the `h1`, the five nav links, and the mailto address are in
the markup. An unknown project slug and an unknown route both return a real 404 with the
full nav and no serious axe violations. Print drops chrome and keeps the CV.

**M4–M13 labs and determinism.** Landing compilation, MLOps drift/incident/recover,
Source Trace, Reversible Architecture, Autopsy, X-Ray, Steward, and the malware lab all
remain green in unit and e2e runs. Labs stay `PORTFOLIO_EXTENSION` / `PORTFOLIO_SIMULATION`
and never claim `REAL_RUNTIME`. The MLOps definition-list and scrollable-histogram
accessibility fixes from M24 did not change any lab number.

**M14 failure honesty.** `CANONICAL_FAILURE_EXHIBITS` is still `[]`; the museum renders
its empty state behind the publication gate, and the renderer stays fixture-tested.

**M15–M18 search and Signal.** Deterministic-first retrieval, semantic labelled as
relevance not proof, allowlisted tools only, and full fallback on an invalid ui_plan. The
API surface is now bounded without changing its answers: an empty query returns the gap
notice and runs no tool at all.

**M19–M23 session surfaces.** Recompile still requires consent, Fork still refuses to
score, Interview still withholds answers, Under the Surface still rejects unsafe trace
fields, and the Ending Signal still publishes its four hard zeros. The M24 rewrite of the
trace validator from a Zod schema to hand-written checks is now pinned branch by branch,
including the edges that must pass — a measured `0` must not read as NOT MEASURED.

**Privacy.** A repository-wide search finds no `localStorage`, `sessionStorage`,
`document.cookie`, `sendBeacon`, analytics, or tag-manager usage in application source —
only a comment in the CSP explaining their absence. The integrity manifests that claim
zero tracking are still telling the truth, and the CSP now enforces it at the browser
level by allowing no third-party connect or script host.

**M24 itself.** Production headers, CSP without `unsafe-eval`, keyless rate limiting that
refuses before reading a body, fault boundaries that keep the recruiter path reachable,
per-route gzip budgets, and an indexing policy that excludes session-shaped pages from
both the sitemap and the crawler. Two new structural guards make the work
self-defending: the bundle check fails and names the route if a server-only module such
as zod reaches a client chunk, and the SEO suite walks `src/app` so a new page cannot be
added without being classified as indexable or noindex.

## Commands run

- `pnpm run ci` — green (scope · evidence · format · lint · typecheck · 433 tests / 67 files · build · bundle budget 24 routes, zod absent)
- `pnpm test:e2e:prod` — 138 passed against `next start` (desktop Chromium + Pixel 7)
- `pnpm run validate:evidence` — Evidence graph OK; public manifest OK
- `node scripts/validate-scope.mjs` — OK
- `pnpm test:status` — `docs/testing/TEST-STATUS.md` refreshed, 433 passed / 0 failed

## Coverage delta at this lock

|                | Before M24       | At M24 lock                                                |
| -------------- | ---------------- | ---------------------------------------------------------- |
| Unit tests     | 348 / 62 files   | 433 / 67 files                                             |
| Production e2e | none             | 138 (desktop + mobile)                                     |
| Build guards   | scope · evidence | scope · evidence · bundle budget · server-only module scan |

**Lock hygiene:** Clean — the two documentation defects found (stale README, lagging
footer) were fixed within this audit, and the missing SEO suite is now written and
enforced.

**Next:** Propose M25 — Evidence Freeze (handoff §44).
