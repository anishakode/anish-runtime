# ADR 0024 — Under the Surface + Runtime Trace (M22)

**Status:** Accepted (M22)
**Context:** Handoff §31 (Under the Surface) and §32 (Runtime Trace) — “You've inspected my work. Now inspect the system that showed it to you.”

## Decision

Expose the implemented architecture as five layers, label every subsystem with what it actually is, and back it with a bounded in-memory action log that cannot leak sensitive input.

### Five layers

`src/lib/surface/layers.ts` declares INTERFACE, ORCHESTRATION, TRUTH, SESSION, and RUNTIME, in that order. Each subsystem carries a name, a one-line detail, the milestone that introduced it, and the **repository path** that implements it — so the claim is checkable against the code that served the page.

### Reality labels

Four labels prevent architecture theatre:

| Label                | Meaning                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| REAL RUNTIME         | Actually executing in this website right now                                |
| PORTFOLIO SIMULATION | Deterministic reconstruction for inspection — not production infrastructure |
| OPTIONAL PROVIDER    | External dependency that may be absent; the system degrades honestly        |
| BUILD-TIME SYSTEM    | Runs during build or validation, not while you browse                       |

Enforced by test, not by discipline: every subsystem whose name matches a lab or incident **must** be `PORTFOLIO_SIMULATION`, the hosted LLM planner **must** be `OPTIONAL_PROVIDER`, graph validation **must** be `BUILD_TIME_SYSTEM`, and every declared path must exist on disk.

### Runtime trace

`src/lib/runtime-trace/trace.ts` records four action kinds: Signal interpretation, accepted Recompile, Fork branch, and Interview set.

Safety is structural rather than review-based. `RuntimeTraceInputSchema` is a `.strict()` Zod object over exactly the allowed fields — action, status, evidence count, tool names, architecture stages, duration, and a short note. Any extra key (`query`, `jobDescription`, `prompt`, `reasoning`, `ip`, `secret`) fails parsing, so an unsafe payload cannot be appended even by mistake. Rejections are counted and shown; they are not silently dropped.

History is bounded to the last 12 entries and lives in React state inside the app shell, so it dies with the tab.

### Honest absence

Missing telemetry renders as `NOT MEASURED`, `NOT COLLECTED`, or `UNAVAILABLE`. `formatMetric(null)` returns NOT MEASURED while `formatMetric(0)` returns `0` — a measured zero and an unmeasured value must not look alike. No fabricated number is ever substituted.

## Consequences

- The architecture page can drift from reality only by failing its own tests (paths must exist, labs must stay simulations).
- Adding a new recorded action means extending the enum and the UI together; there is no free-form logging path.
- `/surface` is a footer-level self-reveal, not a primary nav item — the recruiter path stays unchanged.
- The bounded trace is the input M23's Ending Signal will read, alongside the M19 session trail, so no third tracking system is needed.
