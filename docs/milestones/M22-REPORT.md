## Milestone report: M22 — Under the Surface + Runtime Trace

**Scope approved:** Owner — “Yes run the cumulative M0–M21 and then start M22”

**Implemented:**

- Five-layer self-reveal (`src/lib/surface/layers.ts`): INTERFACE · ORCHESTRATION · TRUTH · SESSION · RUNTIME, entry line “You've inspected my work. Now inspect the system that showed it to you.”
- Every subsystem carries a reality label — REAL RUNTIME · PORTFOLIO SIMULATION · OPTIONAL PROVIDER · BUILD-TIME SYSTEM — plus the repository path that implements it and the milestone that introduced it
- Reality-label filter chips and per-layer disclosure on `/surface`
- Bounded in-memory runtime trace (`src/lib/runtime-trace/trace.ts`): Signal interpretation, accepted Recompile, Fork branch, Interview set — last 12 actions, tab-scoped
- Safety is structural: `RuntimeTraceInputSchema` is a strict Zod object, so `query`, `jobDescription`, `prompt`, `reasoning`, `ip`, and `secret` fail parsing rather than being filtered later; rejections are counted and shown
- Honest absence vocabulary: NOT MEASURED · NOT COLLECTED · UNAVAILABLE, with measured `0` distinguished from unmeasured `null`
- “Never recorded” panel states the exclusions in the UI, not only in docs
- `RuntimeTraceProvider` wraps the session layer in the app shell; Signal, Recompile, Fork, and Interview record through it
- `/surface` reachable from the footer; `/llms.txt` updated; primary recruiter nav unchanged
- ADR 0024

**Tests added/updated:**

- `src/lib/surface/surface.test.ts` — layer order, label validity, **every declared path exists on disk**, labs can never be REAL_RUNTIME, LLM stays OPTIONAL_PROVIDER, graph stays BUILD_TIME_SYSTEM, unknown layer throws, reality counts; trace schema rejects query/JD/prompt/reasoning/IP/secret and unknown action or status, null defaults, hard bound at 12, formatting vocabulary
- `src/components/surface/under-the-surface.test.tsx` — five layers, lab labelling, reality filter, empty trace, safe recording, NOT MEASURED / NOT COLLECTED rendering, rejected count without leaking the payload, clear
- `src/app/surface/page.test.tsx` — route mount, recruiter nav ungated, trace UNAVAILABLE outside the provider
- `e2e/home.spec.ts` — `/surface` labels, then Fork via client-side navigation and back: trace shows the action, not the pasted text
- Catalog + `pnpm test:status`

**Test status:** 326 passed / 0 failed — see `docs/testing/TEST-STATUS.md`

**Validation run:** `pnpm run ci` (green, 28 routes) · Playwright `--grep "Under the Surface|footer reflects"` → 4 passed

**A11y / mobile / reduced-motion:** Disclosure buttons carry `aria-expanded`, filter chips carry `aria-pressed`, labelled regions for layers, subsystems, trace entries, and never-recorded; empty trace uses `role="status"`; no motion dependency.

**Truth / privacy notes:** Labs and the incident path are asserted to be PORTFOLIO_SIMULATION so they can never be staged as production infrastructure. Declared paths are verified against the filesystem, so the architecture map cannot drift from the code. The trace is in-memory, bounded, and structurally incapable of holding raw queries or job text.

**Known gaps / deferred:** Ending Signal (M23). Duration is measured only for Signal; other actions honestly report NOT MEASURED. Pre-existing dev-only React key warning from `ProjectAutopsy` still untraced.

**Ask:** Lock M22? (yes/no)

**Owner decision:** Locked — “Yes go on” (2026-09-16). See `docs/milestones/M22-LOCK-AUDIT.md`.
