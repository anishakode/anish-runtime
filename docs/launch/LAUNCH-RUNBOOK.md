# Launch runbook (M26)

Handoff §45: launch is deployment of an already-proven system. No new WOW during launch
week unless a critical defect demands it. The portfolio is already the interesting part.

Target platform: **Vercel** (first-party Next.js support). The origin is chosen at deploy
time and was deliberately left unset until then.

---

## 0. Before you start

```bash
pnpm run ci          # scope · evidence · freeze · format · lint · typecheck · unit · build · bundle
pnpm test:e2e:prod   # 138 tests against a production build
```

Both must be green on the commit you intend to deploy. Nothing below fixes a red build.

---

## 1. Push the repository

The repo has history but no remote, so the only copy is local.

```bash
git remote add origin git@github.com:anishakode/<repo>.git
git push -u origin main
```

GitHub Actions runs the same `pnpm ci` plus production e2e on push.

---

## 2. Create the Vercel project

1. Import the GitHub repository. Vercel detects Next.js; **do not** override the build
   command, output directory, or install command.
2. Node version 22, pnpm 12.3.4 (matches `package.json` and CI).
3. Deploy once to get a `*.vercel.app` URL. **Do not announce this deploy** — the origin
   is not configured yet, so its metadata is still wrong (see step 3).

## 3. Set the origin — the step that breaks launches

Set `NEXT_PUBLIC_SITE_URL` in Vercel → Settings → Environment Variables, for
**Production** (and Preview, if previews should self-describe):

```
NEXT_PUBLIC_SITE_URL=https://<final-origin>
```

No trailing slash — `siteUrl()` strips one, but keep the value clean.

This is read at **build time**, so it only takes effect on a **redeploy**. Deploying
without it leaves, verifiably:

- `<link rel="canonical" href="/">` — relative, useless to a crawler
- `og:image` pointing at `http://localhost:3000/opengraph-image`
- `robots.txt` with no `Sitemap:` line and `sitemap.xml` with relative URLs

That exact failure was rehearsed locally; `pnpm smoke:live` reports all five (see step 6).

**Redeploy after setting the variable.**

## 4. Custom domain (if using one)

1. Add the domain in Vercel and follow the DNS instructions.
2. Wait for the certificate to issue; confirm `https://` serves without a warning.
3. If the domain differs from `NEXT_PUBLIC_SITE_URL`, update the variable and redeploy —
   they must agree, or canonical URLs will point at the wrong host.
4. Confirm HSTS appears (`strict-transport-security`). It is emitted only for an https
   origin, so it has never been exercised before this step.

## 5. Secrets

There are none. The application reads exactly one environment variable,
`NEXT_PUBLIC_SITE_URL`, which is public by definition. Semantic retrieval is local
TF-IDF and Signal is tool-orchestrated, so there is no provider key to leak. If that ever
changes, the key belongs in Vercel's encrypted environment variables and never in
`NEXT_PUBLIC_*`.

---

## 6. Verify the live origin

```bash
pnpm smoke:live https://<final-origin>
```

38 checks: https and HSTS, security headers, CSP without `unsafe-eval`, every public
route, a real 404, the recruiter path present in raw server HTML, absolute canonical and
social-card URLs, no leaked localhost, the card rendering, robots and sitemap agreeing
with the indexing policy, `noindex` on the four session surfaces, `/evidence.json` and
`/llms.txt`, and Signal refusing a cross-origin caller.

Then the checks a script should not pretend to make — see `LAUNCH-CHECKLIST.md`.

---

## 7. Public presence

Apply `docs/launch/PUBLIC-PRESENCE.md`: GitHub profile website link, pinned flagships,
repository descriptions and topics, and the LinkedIn featured link.

---

## Rollback

Vercel keeps every deployment. If the live site is wrong, **promote the previous
deployment** rather than debugging in production, then fix forward on a branch. The
evidence corpus cannot be hotfixed casually: any change to a public claim fails
`pnpm freeze:check` until it is recorded in `content/evidence/freeze.json`.
