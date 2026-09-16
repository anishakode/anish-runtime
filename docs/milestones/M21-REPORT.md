## Milestone report: M21 — Interview My Work

**Scope approved:** Owner — “yes next” (lock M20 + continue to M21)

**Implemented:**

- Session trail → evidence-bounded interview set: “Don't let my portfolio answer for me. Let it tell you what to ask me.”
- Authored catalogue (`src/lib/interview/catalog.ts`) across VERIFY · DEFEND · STRESS · BOUNDARY and three topic groups: MLOps governance, Steward_AI agents, PDF malware explainability
- `buildInterviewCatalog(graph)` binds every question to canonical nodes — titles, evidence states, per-node and per-question source counts, project hrefs; unbound questions are dropped, never faked
- `selectInterviewSet()` is pure and deterministic: distinct canonical items only, rank by matched triggers, catalogue order breaks ties, greedy archetype + topic diversity, hard cap of 3
- Free-text ASK RUNTIME queries and unknown ids land in `ignoredInputs` and cannot generate a question
- Each question exposes lead, one follow-up, WHY THIS QUESTION? (matched trigger ids, canonical source count, fairness rationale), and supporting evidence with honest badges
- ANSWER KEY boundary rendered with every set: not generated, no model answer, no candidate/hiring score, no personality or culture-fit assessment
- Two honest empty states: no canonical trail yet, or a trail outside catalogued topics
- `/interview` route + header INTERVIEW affordance; `/llms.txt` route list updated; primary recruiter nav unchanged
- ADR 0023

**Tests added/updated:**

- `src/lib/interview/interview.test.ts` — graph binding, unbound drop, free-text ignored, empty trail, non-catalogued trail, ≤3 cap with distinct archetypes/topics, determinism with exact ids, repeat collapse, weak-state pass-through
- `src/components/interview/interview-my-work.test.tsx` — entry line, empty reason, ≤3 rendered, WHY disclosure gating, answer-key boundary, clear set
- `src/app/interview/page.test.tsx` — route mount, recruiter nav ungated, no score framing
- `e2e/home.spec.ts` — empty-trail path, then trail → questions → WHY → answer-key boundary
- Catalog + `pnpm test:status`

**Test status:** 299 passed / 0 failed — see `docs/testing/TEST-STATUS.md`

**Validation run:** `pnpm run ci` (green) · Playwright `--grep "Interview My Work"` 2 passed (desktop + mobile)

**Repo hygiene fix (found during validation):** `pnpm format:check` failed on all 249 files because the working copy is CRLF while Prettier defaults to LF. Fixed by `endOfLine: "auto"` in `.prettierrc.json` plus a `.gitattributes` normalising the repo to LF. Content was byte-identical apart from line endings.

**A11y / mobile / reduced-motion:** Buttons and lists only; WHY disclosure uses `aria-expanded`; labelled regions for Questions, Supporting evidence, Answer key; no motion dependency.

**Truth / privacy notes:** Questions are authored against canonical node ids, never model-generated. Evidence states pass through unchanged (LIMITED_EVIDENCE and PORTFOLIO_EXTENSION are asserted to survive). Session trail stays in memory; nothing is persisted.

**Known gaps / deferred:** Catalogue covers three topic groups — SOFTWARE_CLOUD trails get the honest “no catalogued topic” state. Under the Surface (M22) and Ending Signal remain locked. Pre-existing dev-only React key warning from `ProjectAutopsy` on project pages, unrelated to M21, not yet traced.

**Ask:** Lock M21? (yes/no)

**Owner decision:** Locked — “Yes run the cumulative M0–M21 and then start M22” (2026-09-16). See `docs/milestones/M21-LOCK-AUDIT.md`.
