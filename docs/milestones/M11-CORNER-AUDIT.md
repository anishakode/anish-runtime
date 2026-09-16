## Deep corner-case audit: through M11

**Trigger:** Owner — “deep and corner check … no gaps left”  
**Stages re-checked:** M0 → M11  
**Generated:** 2026-09-15  
**Gap-fix:** Owner — “Fix everything” (same day)

### CRITICAL

_None._ Recruiter path, Evidence Graph truth, and lab honesty hold.

### HIGH — closed in gap-fix

1. **Deep-link / ADR drift** — `autopsyLensFromHash` opens X-RAY for `#project-xray` / `#reversible-architecture`; lab links + ADR 0011 updated.
2. **X-Ray `aria-hidden`** — removed; dimming is opacity PE only; clicks remain available.
3. **Nested `SourceTraceProvider`s** — nesting-safe passthrough; Autopsy wraps once; unit asserts single dialog.
4. **Autopsy / X-Ray / Trace e2e** — hash → X-RAY, architecture hash, Trace Escape covered in `e2e/home.spec.ts`.
5. **Known-gaps docs** — explicit section on `M11-REPORT.md`.

### MEDIUM — closed in gap-fix

1. Autopsy tablist Arrow/Home/End APG pattern.
2. Source Trace drawer Tab focus trap + focus restore to trigger.
3. `validate-scope` REQUIRED pins ADR 0010–0013 + M8–M11 entry files.
4. Footer copy: “locked through M11”.
5. Local CI still omits Playwright (GHA runs e2e) — documented Known gap.

### LOW / deferred (documented OK)

- Live URL / public packaging
- Signal · Fork · Ending Signal · Steward/Malware labs
- CSP → M24
- Empty-nodes UI / thin orphan wrappers

### Lock hygiene

**Fix-then-confirm → Clean** for HIGH/MEDIUM corner items above.

**Validation:** `pnpm run ci` — **147 unit tests** green; gap-fix e2e (hash → X-RAY, Trace Escape, footer) green against `pnpm start` (CI webServer).
