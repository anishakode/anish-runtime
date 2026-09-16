## Milestone report: M12 — Steward_AI Agent Lab

**Scope approved:** Owner — “next” (Approve M12)

**Implemented:**

- `src/lib/steward/` — evidence honesty + four deterministic scenarios with tool states
- `StewardLab` UI: synthetic context, tool table, withheld advice, dry-run Task preview, Source Trace
- `/labs/steward` + Autopsy RUN on `/work/steward-ai`
- Graph: `ev.steward.runtime-lab`, `src.portfolio.steward-lab`, edges
- ADR 0014; validate-scope REQUIRED pins

**Tests added/updated:**

- `scenarios.test.ts` — four scenarios, anti-advice, fail-closed invalid input
- `steward-lab.test.tsx` / `labs/steward/page.test.tsx` / `steward-bundle.test.ts`
- work page Steward RUN; source-trace Steward MCP parity; home stats 39 nodes
- e2e Steward lab smoke

**Test status:** **164 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**A11y / mobile / reduced-motion:** radiogroup scenarios; semantic tool table; Trace drawer reuses M8 a11y

**Truth / privacy notes:** Synthetic context only; no live FHIR/Gemini/MCP; treatment advice withheld; Task dry-run only; PORTFOLIO_EXTENSION labeled

**Known gaps / deferred:** Steward X-Ray / Reversible Architecture; Malware lab (M13); Signal (M17+); footer still says locked through M11 until M12 lock

**Ask:** Lock M12? (yes/no)

**Status:** Locked (owner — 2026-09-15 · “Lets go next”)

**Lock audit:** `docs/milestones/M12-LOCK-AUDIT.md`
