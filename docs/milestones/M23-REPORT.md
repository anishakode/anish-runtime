## Milestone report: M23 — Ending Signal

**Scope approved:** Owner — “Yes go on” (lock M22 + continue to M23)

**Implemented:**

- `/ending` closes the V1 journey: YOUR PATH THROUGH ANISH · “This describes this session, not you.” · “There's one thing left you can't test here.” · “Working with me.” · “The last unresolved node is the human.”
- Reads **existing state only** — the M19 interaction trail and the M22 bounded runtime trace. No third tracking system was added.
- Journey catalogue (`src/lib/ending/catalog.ts`) resolves canonical session items to graph-backed labels, hrefs, and evidence states; unresolvable items are omitted rather than guessed
- Free-text query refs are discarded into `discardedRefs` and never rendered
- Density honesty: DEEP requires ≥6 nodes **and** ≥3 actions; STANDARD needs ≥3 nodes **or** ≥1 action; everything else stays SHALLOW with copy stating the path will not be invented
- Strongest exploration thread shown only when the deterministic M19 heuristic actually detects a lean
- `CHALLENGE_COMPLETED` added to the runtime-trace enum and wired to real completions only: an MLOps incident recovered from an actual break, and a non-baseline Steward safety scenario run through
- WHY THIS SIGNAL? lists inputs and the seven explicit exclusions (employer, location, demographics, outside browsing, raw JD, raw queries, persistent profiles)
- Journey Integrity Manifest publishes counts plus four hard zeros: external tracking, persistent profiles, inferred personal traits, fabricated interactions
- Conventional close: email, CV, LinkedIn, GitHub from the canonical profile
- Footer affordance next to Under the surface; `/llms.txt` updated; primary recruiter nav unchanged
- Scope validator's forbidden-path list is now empty — every WOW surface in the handoff is unlocked
- ADR 0025

**Tests added/updated:**

- `src/lib/ending/ending.test.ts` — catalogue resolution and the absence of any query-ref entry; density boundaries pinned on both sides; inactive session stays empty; ordered replay with repeat collapse; discarded refs never serialised; challenge vs action split; integrity zeros; exclusion list
- `src/components/ending/ending-signal-view.test.tsx` — shallow honesty, session-not-you line, ordered replay, challenge section, WHY disclosure gating, manifest, human close with all four contact hrefs
- `src/app/ending/page.test.tsx` — route mount, recruiter nav ungated, canonical email asserted against the graph's exclusion list
- `e2e/home.spec.ts` — inactive visitor stays SHALLOW with exclusions and zeroed manifest; a real BREAK → RECOVER run replays as a completed challenge
- Catalog + `pnpm test:status`

**Test status:** 348 passed / 0 failed — see `docs/testing/TEST-STATUS.md`

**Validation run:** `pnpm run ci` (green, 29 routes) · Playwright `--grep "Ending Signal|footer reflects"` → 6 passed

**A11y / mobile / reduced-motion:** Ordered list on every viewport — a decorative desktop constellation was rejected as spectacle, which also means there is no staged cinematic motion to suppress for reduced-motion users. Labelled regions for journey nodes, challenges, actions, manifest, and contact; WHY uses `aria-expanded`; the empty state uses `role="status"`.

**Truth / privacy notes:** The signal cannot describe anything the visitor did not do — nodes come from the catalogue, actions from the sanitised trace, and neither path can synthesise an entry. Density thresholds are exported and tested precisely because inflating a quiet session is the tempting failure here.

**Known gaps / deferred:** Public packaging and live URL (M24–M26). Duration remains measured only for Signal interpretation. Pre-existing dev-only React key warning from `ProjectAutopsy` still untraced.

**Ask:** Lock M23? (yes/no)

**Owner decision:** Locked — “Yes please” (2026-09-16). See `docs/milestones/M23-LOCK-AUDIT.md`.
