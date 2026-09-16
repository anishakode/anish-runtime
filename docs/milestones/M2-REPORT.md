## Milestone report: M2 — Utility Portfolio

**Scope approved:** Owner directed to proceed to M2 after treating M1 as done

**M1 status:** Treated locked when moving to M2

**Implemented:** Utility portfolio routes, evidence UI, llms.txt, print CV, pre-lock integrity hardening (schema/print/pinned links/ci/contact).

**Tests added/updated (strict / fail-first):**

- Schema: 12 fail-first contracts (duplicate ids/slugs, short/missing SHA/URL, orphan projects, missing sources, exclusion reintroduction)
- Graph + queries: pinned vs unpinned repo links, exact flagship slug map, owner notes
- Pages: Home/Work/Experience/About/CV/Contact with exact hrefs, badges, absence of obsolete email
- RTL cleanup fixed in `vitest.setup.ts` (was leaking DOM across tests)
- E2e specs tightened (pinned SHA href, 404 nav, llms content-type, exclusions)
- Catalog: `docs/testing/TEST-CATALOG.md`
- Status reporter: `pnpm test:status` → `docs/testing/TEST-STATUS.md`

**Test status:** **36 passed / 0 failed** — see [`docs/testing/TEST-STATUS.md`](../testing/TEST-STATUS.md)

**Validation run:** `validate:scope`, `validate:evidence`, typecheck, `test:status` — OK

**Known gaps / deferred:**

- Boundary-node dedicated UI (later)
- M3 visual system; M3.5 `/evidence.json`
- E2e not in local `pnpm ci` (GitHub Actions runs it) — run `pnpm test:e2e` for browser status
- CSP hardening (M24)

**Ask:** Lock M2? → **Locked by owner** (2026-09-14). See `M2-LOCK-AUDIT.md`.
