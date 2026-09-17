# ANISH // RUNTIME

**An executable professional identity.** — **https://anish-runtime.vercel.app**

This repository is a from-scratch rebuild. The engineering contract it was built under is
[`AGENTS.md`](AGENTS.md); the decisions are recorded in [`docs/adr/`](docs/adr) and the
milestone audits in [`docs/milestones/`](docs/milestones). The longer product constitution is
kept out of this repository on purpose — it mixes shipped contracts with deferred ideas, and
this project should not publish a document a reader could mistake for a list of claims.

## Current milestone

**Live:** https://anish-runtime.vercel.app — M27 locked.

Locked: M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 ·
M14 · M15 · M16 · M17 · M18 · M19 · M20 · M21 · M22 · M23 · M24 · M25 · M26 · M27.

M24 closed the V1 feature arc — security headers and CSP, API request bounds, fault
boundaries, bundle budgets, an accessibility audit, and the indexing policy. M25 froze
the public corpus: 96 claims are owner-confirmed and enforced by `pnpm freeze:check`, so
changing what this portfolio claims requires a recorded change-control entry. Every claim
and its evidence is listed in [`docs/evidence/CLAIM-LEDGER.md`](docs/evidence/CLAIM-LEDGER.md);
status per milestone lives in `docs/planning/milestones.md`.

M26 shipped it: a social card generated from the graph, and `pnpm smoke:live`, which
verifies a deployed origin rather than a local build — 38/38 against production. The
origin is a **build-time** input, so `NEXT_PUBLIC_SITE_URL` must be set before the
production build or the site ships relative canonicals and a card pointing at localhost;
the smoke script exists to catch exactly that. Deploy path:
[`docs/launch/`](docs/launch/LAUNCH-RUNBOOK.md).

M27 hardened the proof trail itself. The freeze proves a claim has not changed locally,
but not that the repository it cites still exists at that path, so `pnpm verify:sources`
re-checks every cited URL and that each pinned link carries the commit it claims — run
weekly, opening an issue when the trail breaks. The four flagship repositories now carry
READMEs that state their own limits rather than leaving a visitor at an empty page.

## Prerequisites

- Node.js 22+
- pnpm 12.3.4+ (`corepack enable` recommended)

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:status
pnpm test:e2e
pnpm test:e2e:prod   # e2e against a production build — the only run that asserts CSP,
                     # security headers, and the noindex policy
pnpm validate:scope
pnpm validate:evidence
pnpm check:bundle    # gzip first-load JS per route; fails on regression
pnpm freeze:check    # frozen public claims still match the graph
pnpm smoke:live https://origin   # verify a deployed origin (headers, canonicals, card,
                                 # indexing, recruiter path in raw HTML, AI fallbacks)
pnpm run ci          # scope · evidence · freeze · format · lint · typecheck · unit · build · bundle
pnpm run ci:full     # the above plus production e2e
```

## Agent contract

See `AGENTS.md` and `.cursor/skills/`. All milestones are owner approval-gated.
