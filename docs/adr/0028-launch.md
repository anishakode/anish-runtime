# ADR 0028 — Launch

**Status:** Accepted (M26)
**Context:** Handoff §45. Launch is deployment of an already-proven system, not another
feature milestone. The owner chose Vercel and deferred the origin to deploy time.

## Decisions

### The origin is a build-time input, and that is a hazard worth guarding

`NEXT_PUBLIC_SITE_URL` is read at build time, so setting it after a deploy changes
nothing until a rebuild. Deploying without it does not fail — it quietly ships a relative
canonical URL, a social card pointing at `http://localhost:3000`, and a sitemap with no
absolute URLs. Nothing in the application can detect this, because from the server's
point of view everything is working.

So the guard lives outside the application: `pnpm smoke:live <origin>` asserts, against
the running site, that the canonical and card URLs belong to the origin being tested and
that no `localhost` string survives in the page. The failure mode was rehearsed locally
by deploying both ways; the script reports five distinct failures when the variable is
missing and 38/38 when it is set.

### The social preview card was deferred to here on purpose

M24 built the indexing policy but deliberately left the card out: with no origin, its URL
is relative and no crawler can resolve it. Now that an origin exists, the card ships. It
renders through `next/og` in the Node runtime (it reads the graph from disk, so the Edge
runtime is not an option) and every word on it — name, positioning, tagline, and the
project/node/source counts — is read from the Evidence Graph. A unit test asserts the
text matches the graph and contains none of the vocabulary the portfolio refuses to use
("senior", "expert", "production at scale"), so the one surface without visible evidence
badges still cannot overclaim.

### No secrets

The application reads exactly one environment variable and it is public by definition.
Semantic retrieval is local TF-IDF; Signal is tool-orchestrated with no provider key.
There is nothing to rotate and nothing to leak, which is itself worth recording — if a
provider key ever arrives, it must not be `NEXT_PUBLIC_*`.

### Monitoring stops at uptime

The site publishes integrity manifests claiming zero tracking and zero profiling, and the
CSP permits no third-party connect or script host. Adding analytics would make those
claims false and require a CSP hole to work. Uptime checks against the origin are
truthful and privacy-compatible; visitor analytics are not, and are refused here rather
than left as an open question for launch week.

### Rollback is promotion, not hotfixing

Vercel keeps every deployment, so the recovery path is promoting the previous one. The
evidence corpus specifically cannot be hotfixed: a changed public claim fails
`pnpm freeze:check` (M25) until it is recorded, and that gate applies during launch week
exactly as it does otherwise.

## Consequences

- Launch is reduced to a runbook plus one command, which is the "boring launch" the
  handoff asks for.
- The checks a script cannot honestly make — real phone, screen reader, print, reading
  the claims as a stranger — are a separate human checklist rather than being faked by
  automation.
- Public presence (profile, pins, repository metadata, LinkedIn) is drafted from the
  frozen corpus so the packaging cannot contradict the site.

## Alternatives rejected

- **Hardcoding the origin now.** Would put an invented production host in the repository
  before one exists, which M24 and M25 both refused.
- **Runtime origin detection from request headers.** Would make canonical URLs depend on
  whatever host requested the page, including preview and proxy hosts — the exact
  ambiguity canonical URLs exist to remove.
- **Analytics "just for launch".** A temporary exception to a published privacy claim is
  a false claim.
