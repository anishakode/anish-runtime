# ADR 0026 — Production hardening (M24)

**Status:** Accepted (M24)
**Context:** Handoff §43. The portfolio claims engineering maturity, so it has to survive engineering scrutiny itself. No new product surface, no new claims, no telemetry.

## Decisions

### 1. CSP without nonces

Nonce-based CSP requires dynamic rendering of every page in this Next version. That would convert 29 static routes into per-request renders, lose CDN caching, and slow the recruiter path — to defend against injected inline scripts on a site that ships no third-party JavaScript and renders no user-generated HTML.

`script-src` therefore keeps `'unsafe-inline'`, which the App Router needs for its streaming RSC bootstrap, while production drops `'unsafe-eval'` (React only needs it in development) and adds `object-src 'none'`, `frame-src 'none'`, `media-src 'none'`, and `upgrade-insecure-requests`. The policy contains no third-party origin at all, which a test asserts by rejecting any `http(s)://` in the header.

The trade-off is recorded rather than hidden: a stricter script policy is available the day this site needs third-party scripts or dynamic rendering for another reason.

### 2. Rate limiting without a visitor key

`/surface` states that no IP address or device fingerprint is recorded. Per-visitor rate limiting would contradict that, so the Signal endpoint uses a single shared fixed window (30 requests per minute).

The cost is real and stated: sustained abuse exhausts the window for everyone. That degrades to deterministic search, which needs no provider, so the recruiter path is never affected.

### 3. Origin checked against Host

The same-origin guard trusts `Sec-Fetch-Site: same-origin` when the browser sends it, and otherwise compares `Origin` to the **Host header** rather than to `request.url`. Behind a server or proxy the request URL's host is an internal address, which made a correct same-origin call look cross-origin — caught by the production e2e run, not by unit tests.

### 4. Rejections are named, not silent

Every bound on the Signal endpoint returns a distinct status and an `X-Signal-Reject` reason: `cross_origin` (403), `unsupported_media_type` (415), `body_too_large` (413), `invalid_json`, `invalid_query`, `query_too_long` (400). Control characters are rejected rather than stripped — a query containing them was not typed by a person, and silently rewriting input would hide that.

### 5. Fault boundaries keep the recruiter path

`error.tsx`, `labs/error.tsx`, and `global-error.tsx` render the site chrome, name what failed in plain language, say what still works, and expose the digest rather than a stack trace. They repeat the privacy guarantee, because a failure screen is exactly when a visitor wonders what was captured.

This forced a split: the chrome previously imported the Evidence Graph for the search index, which a client-side boundary cannot do. `site-chrome-static.tsx` now holds the graph-free nav and footer.

### 6. Performance: measure first, then act

Next no longer prints per-route sizes, so `scripts/check-bundle-budget.mjs` measures gzip first-load JavaScript from the prerendered HTML and fails CI on regression. `nomodule` polyfills are excluded because modern browsers never download them.

The measurement contradicted the assumption behind "lazy-load the Runtime Labs". Labs are already route-split and cost about 10 KB each; the portfolio's own code was roughly 19 KB per recruiter route. The real weight was **Zod, at 23.8 KB gzip on every route**, pulled into the browser by three value imports: the runtime-trace schema, the evidence-state enum in the legend, and the failure-publication requirements.

All three were removed from the client. The trace validator is now a hand-written allowlist — smaller, and more legible for a privacy boundary, with behaviour pinned by the unchanged M22 tests. Recruiter routes dropped from 209.7 KB to 145 KB gzip, project pages from 221.6 KB to 164.1 KB. No lazy loading was added, because the measurement said it would be optimising a non-problem.

### 7. Indexing: reachable, not indexed

`/ending`, `/surface`, `/fork`, and `/interview` describe a visitor's own session, not Anish's evidence. They are excluded from the sitemap, disallowed in robots, and served `noindex, nofollow` via both metadata and an `X-Robots-Tag` header.

`metadataBase` and the sitemap host come from `NEXT_PUBLIC_SITE_URL`. Unset, URLs stay relative — no fabricated production host before launch (M26).

### 8. Tests run against a real build

`pnpm test:e2e:prod` (and CI) runs Playwright against `next start`. CSP, security headers, and the noindex policy cannot be asserted on the dev server, which relaxes all three.

That decision immediately paid: the production run found a `dt` nested too deep inside the MLOps metric cells and an unreachable scrollable table, both serious axe violations, and exposed an e2e test that had been navigating with full page reloads — which reset the in-memory session, so it could never have proven the recompile contract it claimed to.

## Consequences

- Zod remains the validator for build-time and server-side data; only client-reachable modules were changed.
- Bundle ceilings sit ~6% above measured values and must be raised deliberately, with a reason in the milestone report.
- The shared rate-limit window is per server process; a multi-instance deployment gets one window per instance.
