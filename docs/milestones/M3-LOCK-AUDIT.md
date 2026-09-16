## Lock audit: through M3

**Trigger:** Owner locked M3 (“Oka lets lock this”)  
**Stages re-checked:** M0 · M1 · M2 · M3  
**Generated:** 2026-09-14

### CRITICAL

_None._

### HIGH

_None remaining._ (Pre-lock HIGH — TOKEN_HEX ↔ CSS sync — fixed before lock.)

### MEDIUM

1. **Local `pnpm ci` omits Playwright e2e** — GitHub Actions still runs `test:e2e`. Run `pnpm test:e2e` when verifying browser recruiter UX.
2. **Boundary honesty nodes** remain graph-only (no dedicated UI) — by design until later museum/Fork work.

### LOW / deferred

- `/evidence.json` public projection → **M3.5**
- RUN ANISH / labs / Signal → **M4+**
- Dark-default theme out of Editorial Lab light-first contract
- Heavy cross-OS screenshot VR deferred
- CSP `unsafe-inline` / `unsafe-eval` → **M24**

### Solid

**M0** — Scope validator, CI baseline, no premature WOW paths, security headers intact.  
**M1** — Evidence graph validates (10 / 38 / 41 / 21); exclusions; weak states honest; SHA fingerprints required.  
**M2** — Recruiter routes + nav; 404; `/llms.txt`; pinned repo links; print chrome scoped.  
**M3** — Editorial Lab tokens/fonts; legend covers all EvidenceState values; forced-colors / reduced-motion / print / focus-visible; TOKEN_HEX sync + AA contrast contracts; Active Instrument hooks only.

### Commands run

- `pnpm validate:scope` → OK
- `pnpm validate:evidence` → OK
- `pnpm test:status` → **45 passed / 0 failed**
- `pnpm format:check` → OK
- `pnpm lint` → OK
- `pnpm typecheck` → OK
- `pnpm build` → OK

**Lock hygiene:** Clean

**Next:** Propose M3.5 — Public Evidence Manifest (await owner approval — do not implement until Approve M3.5).
