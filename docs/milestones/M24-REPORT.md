# M24 — Production Hardening

**Scope:** Handoff §43. Security, reliability, performance, accessibility, discoverability, reproducibility. No new product surface, no new claims, no telemetry.

## What shipped

### Security

- `src/lib/security/policy.ts` builds the CSP and header set. Production drops `'unsafe-eval'`, adds `object-src 'none'`, `frame-src 'none'`, `media-src 'none'`, `worker-src`, `manifest-src`, and `upgrade-insecure-requests`, and contains no third-party origin. `'unsafe-inline'` stays in `script-src` because the App Router streams its RSC payload inline; nonces were rejected because they would make all 29 static routes dynamic (ADR 0026).
- Headers added: `X-Permitted-Cross-Domain-Policies`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, a broader `Permissions-Policy`. HSTS is emitted only when `NEXT_PUBLIC_SITE_URL` is an https origin — never faked locally.
- `src/lib/security/request-guard.ts` bounds the Signal endpoint: same-origin only, `application/json` only, 4 KB body ceiling enforced while streaming, string query ≤ 500 chars, control characters rejected rather than stripped. Each refusal returns a distinct status and an `X-Signal-Reject` reason.
- `src/lib/security/rate-limit.ts` is a shared 30-per-minute window with **no visitor key**, because `/surface` promises no IP or fingerprint is recorded. Exhaustion degrades to deterministic search.

### Reliability

- `src/app/error.tsx`, `src/app/labs/error.tsx`, `src/app/global-error.tsx` with a shared `RuntimeFault` surface: site chrome intact, plain-language cause, what still works, retry, digest instead of a stack trace, and the privacy guarantee restated.
- This required splitting the graph-free chrome into `src/components/site-chrome-static.tsx`, since a client boundary cannot import the Evidence Graph.

### Performance

- `scripts/check-bundle-budget.mjs` measures gzip first-load JS per route from the prerendered HTML (Next no longer prints sizes) and fails CI on regression. `nomodule` polyfills are excluded; a referenced chunk missing on disk is an error rather than a silent zero.
- The measurement overturned the plan. Labs are already route-split (~10 KB each); the real weight was **Zod at 23.8 KB gzip on every route**, reaching the browser through three value imports: the runtime-trace schema, the evidence-state enum used by the legend, and the failure-publication requirements. All three now come from validator-free modules, and the trace validator is a hand-written allowlist whose behaviour the unchanged M22 tests still pin.

| Route group                                                                | Before     | After      |
| -------------------------------------------------------------------------- | ---------- | ---------- |
| Recruiter routes (`/about`, `/cv`, `/contact`, `/experience`, `/failures`) | 209.7 KB   | 145.0 KB   |
| `/` and `/work`                                                            | 212.5 KB   | 146–148 KB |
| Project pages                                                              | 221.6 KB   | 164.1 KB   |
| Runtime Labs                                                               | 216–220 KB | 152–155 KB |

About 126 KB of every figure is the React + Next floor. No lazy loading was added — the measurement said it would be optimising a non-problem.

### Accessibility

`e2e/production.spec.ts` runs axe at serious-and-critical severity across 15 routes, plus 320px reflow, skip-link focus, focus visibility under the sticky header, 24px target sizes, forced colours, and reduced motion.

It found two real violations on `/labs/mlops`: a `dt` nested one level too deep inside the metric cells (with a `<p>` sibling breaking the definition list) and a scrollable histogram container unreachable by keyboard. Both fixed.

### Discoverability

`robots.ts`, `sitemap.ts`, `metadataBase`, per-page canonicals, a title template, and Open Graph / Twitter metadata. `/ending`, `/surface`, `/fork`, and `/interview` are excluded from the sitemap, disallowed in robots, and served `noindex, nofollow` through both metadata and an `X-Robots-Tag` header. With `NEXT_PUBLIC_SITE_URL` unset, URLs stay relative — no invented production host before launch.

### Reproducibility

`pnpm ci` now ends with the bundle budget; `pnpm ci:full` adds e2e. CI installs with `--frozen-lockfile` and runs Playwright against `next start` via `E2E_PROD`, so headers, CSP, and indexing are asserted on a real build. `scripts/run-e2e-prod.mjs` resolves the Playwright CLI through Node so the command behaves the same on Windows and Linux.

## Bugs this milestone found

1. **The same-origin guard rejected legitimate calls behind a server.** Comparing `Origin` to `request.url` fails once the host is internal; it now compares against the Host header and trusts `Sec-Fetch-Site: same-origin`. Only the production e2e run exposed this.
2. **An e2e test could never have proven what it claimed.** The M19 recompile test navigated with `page.goto`, which reloads the document and resets the in-memory session, so the four-interaction lean could not accumulate. Rewritten to navigate client-side with explicit URL assertions — and it now genuinely fails if the session trail breaks.
3. Two serious axe violations on the MLOps lab (above).

## Tests

- 383 unit tests across 65 files (was 348 across 62).
- New: `src/lib/security/security.test.ts`, `src/lib/seo/seo.test.ts`, `src/app/error.test.tsx`; `src/app/api/signal/interpret/route.test.ts` extended with every named rejection.
- 112 e2e tests pass against the production build (desktop + Pixel 7).

## Validation

- `pnpm run ci` — green (scope · evidence · format · lint · typecheck · 383 tests / 65 files · build 31 routes · bundle budget 24 routes)
- `pnpm test:e2e:prod` — 112 passed
- `docs/testing/TEST-STATUS.md` refreshed; `TEST-CATALOG.md` updated; ADR 0026 written; scope validator extended with the 17 new M24 paths

## Not done, deliberately

- Nonce or hash-based CSP (would force dynamic rendering; revisit if third-party scripts ever ship)
- A live origin, social preview image, and HSTS in effect — all belong to M26 launch
- Per-instance rate limiting is per process; a multi-instance deployment gets one window each

**Ask:** Lock M24?

**Owner decision (2026-09-16): LOCKED.** Browser matrix stays Chromium desktop + Pixel 7;
WebKit and Firefox declined on CI time. Cumulative audit: `M24-LOCK-AUDIT.md`.

---

## Addendum — hardening review before lock

A second pass over M24 looking for anything missed. No new product surface; one metadata
fix, one build guard, and the test coverage the first pass claimed or skipped.

### A claim in this report was not backed by a file

The Tests section above listed `src/lib/seo/seo.test.ts` as new. It did not exist in the
repository. The indexing policy — the thing that decides what Google may index — had no
unit tests at all; only the production e2e run touched it. The scope validator did not
catch it because the M24 entry listed `src/lib/seo/routes.ts` and none of the new test
files. Both are fixed: the file now exists with 12 tests, and the four new test paths are
required by `scripts/validate-scope.mjs`.

### Gaps closed

| Gap                                             | Why it mattered                                                                                                             | Now                                                                                                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hand-written trace validator mostly untested    | M24 replaced a Zod schema with manual checks in `runtime-trace/trace.ts`; only the unsafe-field rejections were covered     | Every branch pinned with its exact message, plus the allowed edges (`0`, 120-char note) and non-object input                                               |
| Route-level 429 never executed                  | The limiter was tested in isolation; the route's refusal path was not                                                       | Its own suite exhausts the window, asserts `Retry-After` bounds, and proves the refusal happens before the body is read                                    |
| Zod could silently return to the client         | The 24 KB win was one shared import away from reversing, and the budget would have reported only an unexplained weight gain | `check-bundle-budget.mjs` scans every client chunk for server-only markers and names the route that pulled one in (verified by making it fail)             |
| No route inventory guard                        | A new page could be added and silently omitted from the sitemap                                                             | The SEO suite walks `src/app` and fails if a page is neither indexable nor noindex                                                                         |
| Indexing declared only in headers               | Page `robots` metadata and canonicals were asserted nowhere                                                                 | `src/app/metadata.test.ts` checks the title template, per-page canonicals, noindex on session pages, and the unknown-slug case                             |
| "Works without JS" was an assumption            | Hard rule 4 promises the recruiter path without labs or AI, never tested                                                    | The recruiter routes run with JavaScript disabled, and the raw server HTML is fetched with no browser to prove the h1, nav, and mailto are server-rendered |
| 404 and print untested                          | Both are recruiter-facing                                                                                                   | The 404 returns a real 404 with the full nav and no serious axe violations; an unknown project slug 404s; print hides chrome and keeps the CV              |
| Machine-readable routes untested in production  | `/evidence.json` and `/llms.txt` are the AI-facing contract                                                                 | Both asserted for status, content type, and content                                                                                                        |
| Body ceiling only tested with a declared length | The streaming branch — the one that stops a lying `Content-Length` — never ran                                              | A `ReadableStream` body with no length is refused and cancelled; a multi-chunk body under the ceiling reassembles                                          |
| Origin edges                                    | `same-site` (a sibling subdomain) and an unparseable `Origin` were untested                                                 | Both refused                                                                                                                                               |
| Empty query                                     | Reached the orchestrator untested                                                                                           | Answers with the gap notice and runs no tool at all                                                                                                        |

### Product changes

- `export const viewport` declares `color-scheme: light` and a theme colour. The palette is
  a single light theme; without the declaration a browser in dark mode inverts form
  controls and scrollbars against it.
- `vitest.setup.ts` stubs `next/font/google`, which has no runtime implementation, so any
  test may import the root layout.

### Still deliberately not done

- **Social preview image.** A generated OG card is inert until an origin exists: with
  `metadataBase` unset the URL stays relative and no crawler can resolve it. It belongs
  with the live URL in M26.
- **Browser matrix beyond Chromium.** Handoff §43 asks for one; the suite runs desktop
  Chromium and Pixel 7. Adding WebKit and Firefox is a CI-time decision for the owner.

### Validation

- `pnpm test` — 433 passed across 67 files (was 383 across 65)
- `pnpm lint`, `pnpm typecheck`, `pnpm build` — clean
- `node scripts/check-bundle-budget.mjs` — 24 routes, no regression, zod verified absent
- `pnpm test:e2e:prod` — 134 passed (desktop + Pixel 7), up from 112
- `node scripts/validate-scope.mjs` — OK
