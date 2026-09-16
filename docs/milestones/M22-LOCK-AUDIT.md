## Lock audit: through M22

**Trigger:** Owner — “Yes go on” (lock M22 + continue)
**Stages re-checked:** M0 · M1 · M2 · M3 · M3.5 · M4 · M5 · M6 · M7 · M8 · M9 · M10 · M11 · M12 · M13 · M14 · M15 · M16 · M17 · M18 · M19 · M20 · M21 · M22
**Generated:** 2026-09-16

### CRITICAL

_None._

### HIGH

_None._

### MEDIUM

1. **Local `pnpm run ci` omits Playwright e2e** — GHA runs e2e on push; M22 e2e was run manually (4 passed, desktop + mobile).
2. **Public live URL / packaging** deferred (M24–M26).
3. **Hosted LLM / pgvector** deferred by design — and now declared as an OPTIONAL PROVIDER on `/surface` rather than implied.

### LOW / deferred

- Ending Signal (M23)
- Steward / Malware X-Ray depth · CSP hardening → M24
- Duration is measured only for Signal interpretation; other trace actions honestly report NOT MEASURED
- Pre-existing dev-only React key warning from `ProjectAutopsy` on project pages (no user-visible effect, still untraced)

### Solid

**M0** — `validate:scope` green with M22 paths added to the required list; forbidden `src/features/ending-signal` still absent.

**M1 / M3.5** — Graph validation green (10 projects, 40 nodes, 45 edges, 23 sources); `/evidence.json` remains a derived projection.

**M2–M4** — Recruiter routes and the idle landing still work with no lab, AI, session, or trace dependency; primary nav asserted present on `/fork`, `/interview`, and `/surface`.

**M5–M14** — Labs, incident, Source Trace, Reversible Architecture, Autopsy, X-Ray, and the empty Failure Museum all green inside the 326-test run.

**M15–M18** — Search, semantic retrieval, Signal allowlist, and the ui_plan full-fallback contract unchanged by the new provider layer.

**M19** — Session trace still distinct-item and consent-gated. The new `RuntimeTraceProvider` wraps it without altering its behaviour; `recompile-banner` tests pass with the trace provider absent, proving the optional-hook boundary.

**M20 / M21** — Fork and Interview now emit trace entries carrying counts only. Fork's entry is asserted in e2e to contain none of the pasted job text.

**M22** — Five layers in handoff order; labs and the incident path are test-locked to PORTFOLIO_SIMULATION; the LLM planner is OPTIONAL_PROVIDER; graph validation is BUILD_TIME_SYSTEM; every declared subsystem path is verified to exist on disk; the trace schema is `.strict()` so `query`, `jobDescription`, `prompt`, `reasoning`, `ip`, and `secret` fail parsing rather than being scrubbed; history is bounded at 12 and in-memory; rejected entries are counted and surfaced; NOT MEASURED / NOT COLLECTED / UNAVAILABLE replace fabricated numbers, with measured `0` distinguishable from unmeasured `null`; ADR 0024.

### Cross-cutting

- **No persistence anywhere:** a repository scan for `localStorage`, `sessionStorage`, `document.cookie`, `sendBeacon`, `gtag`, and `analytics` in non-test source returns zero matches. The privacy claims on `/surface` are structurally true, not merely stated.
- `/surface` is a footer affordance; primary nav is untouched.
- Weak evidence states are still never upgraded by Signal, Fork, Interview, or the architecture map.
- `/llms.txt` lists `/fork`, `/interview`, and `/surface` with their honesty caveats.
- Footer + milestones table → locked through M22.

### Commands run

- `node scripts/validate-scope.mjs` → Scope validation OK
- `pnpm run ci` → green (scope · evidence · format · lint · typecheck · 326 tests / 59 files · build, 28 routes)
- `pnpm exec playwright test --grep "Under the Surface|footer reflects"` → 4 passed
- Persistence/analytics scan across non-test `src/` → zero matches
- Strict-schema probe on `src/lib/runtime-trace/trace.ts` → `.strict()` present

**Lock hygiene:** Clean

**Next:** M23 — Ending Signal (owner continued with “Yes go on”).
