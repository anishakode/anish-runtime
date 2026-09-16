# M26 — Launch

**Status:** **Locked** by the owner — live at https://anish-runtime.vercel.app
**Contract:** Handoff §45 · ADR [`0028-launch.md`](../adr/0028-launch.md)
**Owner decisions:** Vercel as host · origin decided at deploy time · start with everything doable locally

## What this milestone is

Launch is not a feature. Everything the site does was built and proven in M0–M25; M26 is
about making it reachable at a real URL without quietly breaking any of it in the process.
So the work here is a deployment path, an automated way to prove the deployed thing is the
same thing that passed CI, and the one visual surface that only becomes meaningful once an
origin exists.

No product surface was added. The recruiter path, the labs, Signal, Fork, Interview,
Surface, and Ending Signal are byte-for-byte what M25 locked.

## The failure this milestone is mostly about

`NEXT_PUBLIC_SITE_URL` is read at **build** time. That single fact creates the most likely
way this launch goes wrong: deploy first, set the variable afterwards, and the site looks
perfectly healthy while serving a relative canonical URL, a sitemap with no absolute URLs,
and a social card whose image URL points at `http://localhost:3000`. Nothing in the app can
notice — from the server's point of view every request succeeds.

I rehearsed it both ways locally against a production build:

| Build        | `pnpm smoke:live` result                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Origin unset | **5 failures**, each named: relative canonical on `/`, card URL not on the origin, `localhost` string in the served HTML, sitemap entries not absolute, robots host mismatch |
| Origin set   | **38/38 passed**                                                                                                                                                             |

That is the point of the script: the mistake is invisible in a browser and obvious in the
smoke run.

## What shipped

### Social preview card — `src/app/opengraph-image.tsx`

M24 deliberately left this out, because with no origin its URL is unresolvable by any
crawler. Now it ships. It renders through `next/og` (Node runtime — it reads the graph from
disk) and every word on it comes from the Evidence Graph: name, positioning, tagline, and
the live project / node / source counts. Root metadata moved to `summary_large_image` so
the card is actually displayed rather than thumbnailed.

This is the only surface in the whole portfolio that shows claims without visible evidence
badges next to them, so it gets a test that the badges would otherwise provide: the unit
test asserts the text matches the graph and contains none of the vocabulary this corpus
refuses — "senior", "expert", "production at scale", "years of experience".

### Live smoke script — `scripts/live-smoke.mjs`

`pnpm smoke:live https://origin` runs 38 checks against a _deployed_ origin: https and
HSTS, the full M24 security header set, CSP with no third-party or `unsafe-*` host, every
public route, a real 404, the recruiter path present in **raw server HTML** (not after
hydration), absolute canonical and card URLs on the origin, no leaked `localhost`, robots
and sitemap agreeing with the indexing policy, session-shaped routes still noindex,
`/evidence.json` and `/llms.txt` with correct content types, and Signal refusing a
cross-origin caller. `--allow-http` exists only so the script can be rehearsed against
`next start`.

### Launch documentation — `docs/launch/`

- **`LAUNCH-RUNBOOK.md`** — the deploy path end to end: push, Vercel project, the env var
  _before_ the first production build, custom domain, secrets (there are none), verification,
  rollback by promoting the previous deployment.
- **`LAUNCH-CHECKLIST.md`** — the checks a script cannot honestly make: real phone, keyboard
  and screen reader, print, and reading the claims cold as a stranger would.
- **`PUBLIC-PRESENCE.md`** — profile, pinned repos, repository metadata, and LinkedIn copy,
  every line drawn from the frozen corpus so the packaging cannot contradict the site.

## Decisions worth naming

**No analytics.** The site publishes integrity manifests claiming zero tracking and zero
profiling, and the CSP allows no third-party connect host. Adding analytics would make a
published claim false _and_ require punching a hole in the CSP. Uptime checks against the
origin are truthful; visitor analytics are not. Recorded in ADR 0028 rather than left as an
open question for launch week.

**No runtime origin detection.** Deriving the origin from request headers would make
canonical URLs depend on whichever host requested the page, including preview and proxy
hosts — the exact ambiguity canonicals exist to remove.

**No fabricated host in the repo.** The origin stays unset in `.env.example`, which now
explains the build-time trap in place rather than in a doc nobody opens at 2am.

## Validation

| Gate                                               | Result                                                                                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm ci`                                          | **Pass** — scope, evidence, freeze (96 claims, `42f8efd8bc5c2aa7`, OWNER_CONFIRMED), format, lint, typecheck, build, bundle budget (24 routes, 1 server-only module verified absent) |
| Unit                                               | **461 passed / 0 failed**                                                                                                                                                            |
| E2e vs production build                            | **142 passed** (chromium desktop + mobile)                                                                                                                                           |
| `pnpm smoke:live` rehearsal                        | 38/38 with the origin set; 5 named failures without it                                                                                                                               |
| `pnpm smoke:live https://anish-runtime.vercel.app` | **38/38 against the live origin**                                                                                                                                                    |

New coverage: 3 unit tests for the card, 2 production e2e tests (the PNG is decoded and its
IHDR width/height read, so a broken or placeholder image fails), and the smoke script itself.

## What the first real CI run caught

Pushing to GitHub was the first time any gate ran against a genuinely clean checkout, and
it failed immediately: `Cannot find name 'LayoutProps'` in `src/app/layout.tsx`. That type
is generated by Next into `.next/types`, and CI runs `typecheck` before `build`, so it did
not exist yet. Locally it always passed because `.next` was warm from an earlier build.

This is worth naming because it means `pnpm ci` had been passing for a reason unrelated to
the code being correct. The fix is `"typecheck": "next typegen && tsc --noEmit"`, so the
types are generated on demand rather than inherited from a previous run, and the ordering
hazard disappears for every future contributor and every fresh clone. Verified by deleting
`.next` and running the full gate from cold.

## The deploy

Repository: [anishakode/anish-runtime](https://github.com/anishakode/anish-runtime),
public, `main`, GitHub Actions green. Origin: **https://anish-runtime.vercel.app**, with
`NEXT_PUBLIC_SITE_URL` set during the Vercel import so the first production build already
carried it — the failure this milestone was designed around never happened.

The live smoke passes 38/38. Worth singling out two results that had never been exercised
before a real deploy: **HSTS** is served (`max-age=63072000; includeSubDomains; preload`),
because it is emitted only for an https origin, and the **social card** renders as a real
PNG at an absolute URL on the origin with counts matching the graph — 10 projects, 40
evidence nodes, 23 sources.

Repository description, homepage, and topics are applied. The rest of
`PUBLIC-PRESENCE.md` — profile, pins, the four flagship repositories, LinkedIn — is by
hand.

## What is not done

- The human checklist in `LAUNCH-CHECKLIST.md`: real phone, screen reader, print, and
  reading the claims cold. A script should not pretend to make those calls.
- Six Dependabot PRs opened on push. All show red, but all branched from before the
  typegen fix, so they are failing on that and not on any incompatibility. They include a
  TypeScript major; they are post-launch work, not launch-week work.
- Three GitHub Actions still target the deprecated Node 20 (a warning, not a failure).
  Dependabot PRs 1–3 are the fix.

## Owner decision

**Locked.** The cumulative M0–M26 audit is in
[`M26-LOCK-AUDIT.md`](./M26-LOCK-AUDIT.md) — the first audit in this project able to check
the contracts against a real deployed origin rather than a local build.

## Audit addendum (M26 lock)

The cumulative M0-M26 audit found and fixed six defects. See
[`M26-LOCK-AUDIT.md`](./M26-LOCK-AUDIT.md) for the detail. The two that mattered most
were three test assertions that could never fail, and a histogram binning bug that made the
MLOps lab report drift in the wrong direction for values below the reference floor.

Unit tests moved 461 to 470 as a result.
