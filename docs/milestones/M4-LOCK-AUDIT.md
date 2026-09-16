## Lock audit: through M4

**Trigger:** Owner — fix-now then lock M4 (“Do the fix and then lock it, make sure you give me the best one”)  
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4  
**Generated:** 2026-09-15

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm ci` still omits Playwright e2e** — GitHub Actions runs `test:e2e`. Agent environment lacked Chromium binaries for a local browser run; CI remains the browser gate.
2. **Boundary / `NOT_DEMONSTRATED` nodes** remain graph + legend + `/evidence.json` only — by design until museum/Fork.

### LOW / deferred

- Journey wall-clock names remain metaphorical (compile completes in seconds).
- Capability constellation is restrained CSS grid (ADR-aligned), not force-directed geometry.
- Print: chrome hidden; home RUN controls not specially `.no-print`.
- CSP `unsafe-inline` / `unsafe-eval` → M24.
- Dark-default theme / heavy screenshot VR → deferred.
- Labs / Signal / Fork / Ending Signal → M5+ (correctly absent).

### Pre-lock MEDIUMs resolved in fix-now

- Journey presets now change settled IA (flagship count, constellation, primary CTA), not only pacing/label.
- Native radio journey controls (replacing button radiogroup).
- Focus moves to Skip → ready heading → RUN on reset.
- Escape + reduced-motion + 20 SEC covered in e2e specs (plus unit).
- Empty-tier UI unit-tested; weak-state project badges unit + e2e-spec’d.
- Footer stage label updated to M4.

### Solid

**M0** — Scope validator, CI baseline, no premature WOW paths, security headers.  
**M1** — Graph 10/38/41/21; exclusions; weak states; SHA fingerprints.  
**M2** — Recruiter routes + nav; 404; `/llms.txt`; pinned repos; print chrome.  
**M3** — Editorial Lab tokens/fonts; legend; a11y motion/contrast/print.  
**M3.5** — `/evidence.json` derived projection; fingerprints; exclusion guards.  
**M4** — RUN ANISH + differentiated journeys; Skip/Escape/RM; focus handoff; graph-backed settle; client-safe evidence labels.

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK
- `pnpm test:status` → **66 passed / 0 failed**
- `pnpm format:check` → OK
- `pnpm lint` → OK
- `pnpm typecheck` → OK
- `pnpm build` → OK

**Lock hygiene:** Clean (remaining MEDIUMs are known dual-CI / deferred museum — accepted)

**Next:** Propose M5 — Deterministic MLOps Core (await owner approval — do not implement until Approve M5).
