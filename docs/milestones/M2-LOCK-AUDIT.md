## Lock audit: through M2

**Trigger:** Owner locked M2 (“Yes go on”)  
**Stages re-checked:** M0 · M1 · M2  
**Generated:** 2026-09-14

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm ci` still omits Playwright e2e** — GitHub Actions runs `test:e2e`; local green ≠ browser green. Run `pnpm test:e2e` on a machine with browsers installed when verifying recruiter UX in a real browser.
2. **GitHub Actions previously used `pnpm test` not `test:status`** — aligned to `pnpm test:status` during this lock so CI refreshes `docs/testing/TEST-STATUS.md` (authorised hygiene).
3. **Boundary honesty nodes** (`failure-museum-empty`, `no-fit-scores`) remain graph-only — correct for M2; no dedicated UI yet (deferred by design).

### LOW / deferred

- Visual system / typography / state colour language → **M3**
- `/evidence.json` public projection → **M3.5**
- CSP still includes `unsafe-inline` / `unsafe-eval` → **M24**
- Evidence-state glossary for recruiters → polish with M3 or later Signal work
- Format-check not re-run in this audit pass if Prettier drift exists on incidental docs (CI covers it)

### Solid

**M0**

- Scope validator present; forbids Signal/labs/fork/ending-signal paths; required foundation + M2 utility files present
- Security header baseline intact; no WOW product paths on disk
- Tooling: validate/lint/typecheck/test/build operational (Windows webpack flags still required)

**M1**

- Evidence graph validates: 10 projects · 38 nodes · 41 edges · 21 sources
- Exclusions coherent; weak states preserved (`PORTFOLIO_EXTENSION`, `LIMITED_EVIDENCE`, `OWNER_CONFIRMED_PROFESSIONAL`, `NOT_DEMONSTRATED`)
- Schema fail-first contracts + live corpus tests green
- GitHub sources require full SHA + URL; project pages use pinned links

**M2**

- Recruiter routes live with permanent nav (Work · Experience · About · CV · Contact)
- Invalid slug → 404; `/llms.txt` graph-derived; print CSS scoped to `.site-chrome`
- Owner-confirmation notes on Experience; contact excludes obsolete email
- Strict unit suite: **36 passed / 0 failed** (`docs/testing/TEST-STATUS.md`)
- Test catalog + status reporter in place

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK
- `pnpm test:status` → 36 passed
- `pnpm lint` → OK
- `pnpm typecheck` → OK
- `pnpm build` → OK

**Lock hygiene:** Clean (known MEDIUM items accepted / deferred)  
**Next:** Propose M3 Visual System (await owner approval — do not implement until Approve M3).
