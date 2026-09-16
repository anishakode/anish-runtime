## Lock audit: through M23 — end of the V1 feature arc

**Trigger:** Owner — “Yes please” (lock M23 + propose M24)
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15 · M16 · M17 · M18 · M19 · M20 · M21 · M22 · M23
**Generated:** 2026-09-16

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM — all land in M24 by design

1. **No `robots.ts` and no `sitemap.ts`.** Handoff §43 requires both, and explicitly warns that session-shaped pages must not become SEO landing pages. `/ending`, `/surface`, `/fork`, and `/interview` are currently indexable like any other route.
2. **No `metadataBase`, canonical URL, or social preview** in `src/app/layout.tsx`. Absolute URLs cannot be resolved for Open Graph until a live origin exists.
3. **CSP still carries `'unsafe-inline'` and `'unsafe-eval'`** in `script-src` — the M0 baseline, correctly annotated in `next.config.ts` as “tighten further in M24; do not fake production maturity here.”
4. **No rate limiting, body-size bound, or `no-store` policy on `/api/signal/interpret`.** Input is Zod-validated and the route is same-origin by deployment, but the bounds §43 asks for are not in place.
5. **No route or global error boundaries** (`error.tsx` / `global-error.tsx`). A render failure in an optional feature currently has no scoped recovery.
6. **Runtime Labs are not lazily loaded** — the lab bundles ship on routes that do not need them.
7. **Local `pnpm run ci` omits Playwright**; GHA runs e2e on push. M23 e2e was run manually (6 passed, desktop + mobile).

### LOW / deferred

- Evidence Freeze (M25) and Launch (M26)
- Duration is measured only for Signal interpretation; other trace actions honestly report NOT MEASURED
- Pre-existing dev-only React key warning from `ProjectAutopsy` on project pages — no user-visible effect, still untraced
- No axe / forced-colours / reflow browser suite yet (M24 accessibility objective)

### Solid

**M0** — `validate:scope` green. The forbidden-path list is now legitimately empty: `src/features/ending-signal` was the last gate and M23 shipped it as `src/lib/ending` + `src/app/ending`. Security-header baseline present since M0 and honestly labelled as a baseline.

**M1 / M3.5** — Graph validation green (10 projects, 40 nodes, 45 edges, 23 sources). `/evidence.json` remains a derived projection.

**M2–M4** — Recruiter path verified again on the three newest routes: `/fork`, `/interview`, `/surface`, and now `/ending` all mount the full Primary nav, and none of them gate Work / Experience / About / CV / Contact. The idle landing still reads without RUN.

**M5–M14** — Deterministic MLOps core, labs, incident, Source Trace, Reversible Architecture, Autopsy, X-Ray, and the empty Failure Museum all green inside the 348-test run. M23 touched `MlopsLab` and `StewardLab` to record challenge completion; both existing suites pass unchanged, and the MLOps recovery assertion still holds.

**M15–M18** — Search, semantic fallback, Signal allowlist, and the ui_plan full-fallback contract untouched by M23.

**M19 / M22** — The Ending Signal consumes both providers read-only. `recompile-banner` and the surface suites still pass with the other provider absent, so the optional-hook boundaries remain real rather than incidental.

**M20 / M21** — Fork and Interview trace entries carry counts only; the e2e assertion that no pasted job text reaches the trace still passes, and that guarantee now extends transitively to the Ending Signal, which can only read what the trace stored.

**M23** — Reads only existing state; the journey catalogue has no entry for query refs by construction, so a raw query cannot become a node even if one were recorded; density thresholds are exported constants tested on both sides of every boundary; an inactive visitor gets an empty route and copy that refuses to invent one; `CHALLENGE_COMPLETED` fires only after a real break→recover or a non-baseline scenario run; WHY THIS SIGNAL? names all seven exclusions; the manifest publishes four hard zeros; the close uses conventional contact channels asserted against the graph's exclusion list; ADR 0025.

### Cross-cutting

- **No persistence anywhere:** the scan for `localStorage`, `sessionStorage`, `document.cookie`, `sendBeacon`, `gtag`, and `analytics` across non-test source still returns zero matches. Every privacy claim on `/surface` and `/ending` is structurally enforced.
- **No fabricated evidence path:** nodes resolve from the graph, actions from the sanitised trace; neither can synthesise an entry.
- Weak evidence states are never upgraded by Signal, Fork, Interview, the architecture map, or the ending replay.
- `/llms.txt` lists `/fork`, `/interview`, `/surface`, and `/ending` with their honesty caveats.
- Footer + milestones table → locked through M23.

### Commands run

- `node scripts/validate-scope.mjs` → Scope validation OK (forbidden list empty)
- `pnpm run ci` → green (scope · evidence · format · lint · typecheck · 348 tests / 62 files · build, 29 routes)
- `pnpm exec playwright test --grep "Ending Signal|footer reflects"` → 6 passed
- Persistence/analytics scan across non-test `src/` → zero matches
- Discoverability probe: no `src/app/robots.ts`, no `src/app/sitemap.ts`, no `metadataBase` in `layout.tsx`

**Lock hygiene:** Clean

**Next:** M24 — Production Hardening (proposed; awaiting owner approval). Every MEDIUM finding above is an M24 objective from handoff §43.
