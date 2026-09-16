## Cumulative audit: through M4 (pre-lock)

**Trigger:** Owner asked to check from the start, current status, and all possible gaps  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 (implemented — awaiting lock)  
**Generated:** 2026-09-15

### Where we are

| Milestone                             | Status                            |
| ------------------------------------- | --------------------------------- |
| M0 Repository Foundation              | Locked                            |
| M1 Canonical Truth + Evidence Graph   | Locked                            |
| M2 Utility Portfolio                  | Locked                            |
| M3 Visual System                      | Locked                            |
| M3.5 Public Evidence Manifest         | Locked                            |
| M4 Landing Compilation + Home Runtime | Implemented — awaiting owner lock |
| M5+ (labs, Signal, Fork, …)           | Not started                       |

Corpus (honest, not padded): **10 projects · 38 nodes · 41 edges · 21 sources**

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm ci` omits Playwright e2e** — GitHub Actions still runs `test:e2e`. Local green ≠ browser green. (Open since M2.)
2. **Journey presets mostly change compile pacing + settled label** — settled IA is the same for 20 SEC / 2 MIN / EXPLORE. Copy implies richer differentiation than shipped.
3. **M4 a11y edges** — journey radios are buttons without arrow-key radiogroup behavior; Skip/Escape can drop focus (no move to ready heading); duplicate “Journey preset” labelling.
4. **E2e coverage thinner than unit for M4** — Skip/Reset covered; Escape and `prefers-reduced-motion` are unit-only; mobile constellation stack not asserted in Playwright.
5. **Empty project-tier UI path untested** — Work page has empty-tier copy; tests only assert non-empty corpus.
6. **Weak-state strings on project pages not asserted in UI tests** — `PORTFOLIO_EXTENSION` / `LIMITED_EVIDENCE` appear via node badges on `/work/[slug]`, but no page-level assertion. Graph/loader tests cover states.

### LOW / deferred

- Boundary / `NOT_DEMONSTRATED` nodes remain graph + legend + `/evidence.json` only (by design until museum/Fork).
- Footer still says “visual system (M3)” — cosmetic stale chrome.
- Journey wall-clock names are metaphorical (compile finishes in seconds, not 20s/2min).
- Capability constellation is restrained CSS grid, not strong geometry — ADR-aligned polish backlog.
- Print: chrome hidden; home RUN controls not specially `.no-print`.
- CSP `unsafe-inline` / `unsafe-eval` → M24.
- Dark-default theme, heavy cross-OS screenshot VR → deferred.
- Labs / Signal / Fork / Ending Signal → correctly absent (scope validator).

### Solid (regressions green)

**M0** — Scope validator OK; no premature Signal/labs/fork paths; tooling/CI baseline; security headers intact.  
**M1** — Evidence validates; exclusions; weak states honest; SHA fingerprints required.  
**M2** — Recruiter routes + nav; 404; `/llms.txt`; pinned repo links; print chrome scoped.  
**M3** — Editorial Lab tokens/fonts; legend; reduced-motion / forced-colors / print / focus-visible.  
**M3.5** — `/evidence.json` derived projection; fingerprints; exclusion leak guards; llms discovery.  
**M4** — Idle readable without RUN; RUN ANISH + presets; four compile steps; Skip/Escape/reduced-motion; settled counts/capabilities/flagships/reset; client bundle does not pull `node:fs` via badges (`format.ts` split).

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK (graph + public manifest)
- `pnpm test:status` → **61 passed / 0 failed**
- `pnpm format:check` → OK
- `pnpm lint` → OK
- `pnpm typecheck` → OK
- `pnpm build` → OK

**Hygiene:** Fix-then-confirm recommended (no CRITICAL/HIGH; MEDIUMs documented)

### Recommended next moves

**A — Lock M4 as-is** accepting MEDIUMs as known gaps, then propose M5.  
**B — Fix-now patch before lock** (approval-gated if you want it scoped): Escape + reduced-motion e2e; focus management on settle; radiogroup a11y tidy; optional weak-state page assertions; optional footer copy bump.

Do **not** start M5 until M4 is locked (or you explicitly override).
