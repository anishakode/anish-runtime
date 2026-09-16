## Milestone report: M17 — Signal Orchestrator

**Scope approved:** Owner — “Lock and audit M16 and aprooce M17”

**Implemented:**

- Allowlisted read-only tools: `search_evidence`, `fetch_evidence`, `fetch_project`, `fetch_sources`, `compare_evidence`
- Request-local `SignalToolSession` exposed-ID gate
- Deterministic tool orchestrator `interpretWithSignal` (no freeform LLM; no `ui_plan`)
- Explicit **INTERPRET WITH SIGNAL** control in ASK RUNTIME
- `POST /api/signal/interpret` (query length bound, gap notice, graph authority headers)
- ADR 0019; scope validator requires Signal files; Fork/Ending Signal still forbidden

**Tests added/updated:**

- `src/lib/signal/signal.test.ts` — allowlist, exposure rejects, gap, LIMITED_EVIDENCE, invent-id absence
- `src/app/api/signal/interpret/route.test.ts` — bad JSON, oversized query, gap, SHAP honesty
- `src/components/search/ask-runtime.test.tsx` — INTERPRET WITH SIGNAL UI + mocked API
- `e2e/home.spec.ts` — Signal interpretation path
- `docs/testing/TEST-CATALOG.md` + `pnpm test:status`

**Test status:** 248 passed / 0 failed — see `docs/testing/TEST-STATUS.md`

**Validation run:** `pnpm run ci` → OK (scope, evidence, format, lint, typecheck, tests, build)

**A11y / mobile / reduced-motion:** Signal is optional inside existing ASK RUNTIME dialog (focus trap / Escape / Ctrl+K unchanged); button disabled while busy

**Truth / privacy notes:** Tools read Evidence Graph only; states never upgraded; no visitor query DB; session-local tool exposure; no browser API keys

**Known gaps / deferred:** Hosted LLM planner wrapping the same allowlist; constrained `ui_plan` (M18); rate limiting beyond query length; Fork / Ending Signal

**Locked:** 2026-09-15 — owner lock + audit; see `M17-LOCK-AUDIT.md`
