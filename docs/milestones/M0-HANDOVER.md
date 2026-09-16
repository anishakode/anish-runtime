# M0 Detailed Handover — ANISH // RUNTIME

**Date:** 2026-09-14  
**Milestone:** M0 — Repository Foundation  
**Owner:** Anish Akode  
**Status:** Implemented and locally verified — **awaiting owner lock**  
**Product constitution:** `ANISH_RUNTIME_MASTER_HANDOFF.md`  
**Agent contract:** `AGENTS.md` + `.cursor/skills/*`

---

## 1. Executive verdict — is M0 okay?

**Yes — M0 is in good shape for foundation scope.**

It does what M0 is supposed to do: serious engineering baseline, no portfolio WOW features, recruiter-readable identity stub, validated tooling, and gates so later milestones cannot silently invent truth or skip approval.

| Area                                 | Verdict                             |
| ------------------------------------ | ----------------------------------- |
| Scope fidelity (no WOW)              | Pass                                |
| Tooling / TypeScript / lint / format | Pass                                |
| Unit tests                           | Pass (2/2)                          |
| E2E + axe critical (last full run)   | Pass (4/4)                          |
| Build                                | Pass (Webpack path on this machine) |
| Evidence truth boundary              | Pass (skeleton only)                |
| Agent / skill governance             | Pass                                |
| Ready to lock                        | **Yes, after you confirm**          |
| Ready for M1 without lock            | **No** — lock M0 first              |

**One small housekeeping fix applied during this handover check:** Prettier drift on `docs/planning/milestones.md` (format check had failed; reformatted).

---

## 2. What M0 was approved to do

From the approved M0 proposal:

- Next.js + React + TypeScript + pnpm
- Strict TS, ESLint, Prettier
- Tailwind/PostCSS foundation (tokens only — not full visual system)
- Security headers / CSP baseline
- Vitest + RTL
- Playwright desktop/mobile scaffold + axe
- CI + Dependabot
- Canonical evidence **skeleton** (not full corpus)
- ADR + planning + scope validator
- `AGENTS.md` / skills (already created before M0 code)
- Minimal placeholder page — **no** RUN ANISH / labs / Signal

**Explicitly out of scope for M0 (correctly not built):**

- Landing compilation / Home Runtime
- Full Evidence Graph content
- Utility routes (`/work`, `/cv`, …) as product
- Digital Research Lab visual system (M3)
- Labs, Signal, Fork, Ending Signal

---

## 3. What exists on disk (map)

### Product / agent governance

| Path                              | Role                                              |
| --------------------------------- | ------------------------------------------------- |
| `ANISH_RUNTIME_MASTER_HANDOFF.md` | Full product constitution (M0–M23 design history) |
| `AGENTS.md`                       | Always-on agent contract for this rebuild         |
| `.cursor/skills/*/SKILL.md`       | 9 auto-applicable project skills                  |
| `CLAUDE.md`                       | Points at `AGENTS.md`                             |

### Application

| Path                    | Role                                              |
| ----------------------- | ------------------------------------------------- |
| `src/app/layout.tsx`    | Root layout + metadata                            |
| `src/app/page.tsx`      | M0 identity placeholder                           |
| `src/app/globals.css`   | Tailwind + quiet tokens + reduced-motion baseline |
| `src/app/page.test.tsx` | Identity unit test                                |

### Evidence skeleton (truth foundation — empty graph)

| Path                                   | Role                                                                 |
| -------------------------------------- | -------------------------------------------------------------------- |
| `content/evidence/schema.ts`           | Zod vocabulary (states, sources, profile, graph)                     |
| `content/evidence/graph.skeleton.json` | Validated skeleton: profile + empty nodes/edges/sources + exclusions |
| `content/evidence/schema.test.ts`      | Schema/unit validation test                                          |
| `scripts/validate-evidence.ts`         | CLI evidence validation                                              |

### Tooling / quality

| Path                                    | Role                                       |
| --------------------------------------- | ------------------------------------------ |
| `package.json`                          | Scripts, engines Node ≥22, pnpm pin        |
| `next.config.ts`                        | CSP + security headers                     |
| `eslint.config.mjs`                     | Next + Prettier                            |
| `vitest.config.mts` / `vitest.setup.ts` | Unit test runner                           |
| `playwright.config.ts`                  | Desktop + mobile projects                  |
| `e2e/home.spec.ts`                      | Smoke + axe critical                       |
| `scripts/validate-scope.mjs`            | Blocks early WOW paths; requires key files |

### Docs / CI

| Path                                     | Role                   |
| ---------------------------------------- | ---------------------- |
| `docs/adr/0001-repository-foundation.md` | Foundation ADR         |
| `docs/planning/milestones.md`            | Milestone status table |
| `docs/milestones/M0-REPORT.md`           | Short milestone report |
| `.github/workflows/ci.yml`               | CI pipeline            |
| `.github/dependabot.yml`                 | Weekly dependency PRs  |
| `README.md`                              | How to run             |

---

## 4. Runtime / commands for the next agent or human

```bash
pnpm install
pnpm dev                 # http://localhost:3000 (Webpack on this Windows host)
pnpm validate:scope
pnpm validate:evidence
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e            # needs: pnpm exec playwright install chromium
pnpm ci                  # aggregate (does not include e2e by default in package "ci" script — CI workflow does)
```

**Identity on the page today:** Anish Akode · AI · ML · Software Engineering · Email / GitHub / LinkedIn links. Marked as “M0 foundation — not the product experience.”

---

## 5. Validation snapshot (this handover)

Re-run during handover writing:

| Check               | Result                          |
| ------------------- | ------------------------------- |
| `validate:scope`    | OK                              |
| `validate:evidence` | OK                              |
| `format:check`      | OK after fixing `milestones.md` |
| `lint`              | OK                              |
| `typecheck`         | OK                              |
| `test`              | OK — 2 files, 2 tests           |
| `build`             | OK on prior M0 run (Webpack)    |
| `test:e2e`          | OK on prior M0 run — 4 tests    |

---

## 6. Important environment caveat (do not ignore)

On this Windows machine, **Application Control blocks** `@next/swc-win32-x64-msvc`.

**Mitigation already in repo:**

- `"dev": "next dev --webpack"`
- `"build": "next build --webpack"`

Linux CI (GitHub Actions) should not hit this. If native SWC works on another machine, Webpack still works — slightly slower, fine for M0.

---

## 7. Skills pack status (part of M0 governance)

Created and lightly tightened before/during M0:

1. `approval-gate` — propose → approve → implement → report → lock
2. `research-first` — ask or deep research; similar ≠ clone
3. `runtime-constitution` — mottos, never-become, AI vs truth
4. `wow-craft` — signature WOW, anti-gimmick
5. `evidence-integrity` — states, Signal/Fork rules, exclusions
6. `milestone-ship` — definition of done
7. `lab-determinism` — labs honesty
8. `recruiter-path` — utility always available
9. `public-presence` — GitHub/live packaging

**Tweaks already applied:** greenfield clarification, forced-choice hierarchy, research timebox, security DoD, Phase-2 WOW named as backlog.

---

## 8. Truth / privacy / security posture at M0

- **Truth:** Only profile skeleton + exclusions (old email listed so it cannot sneak back). Nodes/edges/sources empty until M1.
- **Privacy:** No session personalization, no Signal, no analytics profiles.
- **Security:** CSP + nosniff + frame deny + referrer + permissions-policy baseline. Not production-hardened (that is M24).
- **A11y:** Reduced-motion CSS; axe critical smoke on home; semantic heading/links.

---

## 9. Known gaps (intentional)

These are **not** M0 failures — they are later milestones:

| Gap                                                  | Milestone |
| ---------------------------------------------------- | --------- |
| Full Evidence Graph (projects, nodes, sources)       | M1        |
| `/work`, `/experience`, `/about`, `/cv`, `/contact`  | M2        |
| Digital Research Lab visual system / Instrument Sans | M3        |
| `/evidence.json` public projection                   | M3.5      |
| RUN ANISH / labs / Signal / Fork / Ending            | M4–M23    |
| Production hardening / freeze / launch               | M24–M26   |

Also: GitHub public packaging of _flagship repos_ (MLOps README etc.) is tracked by `public-presence` skill but is **not** this app’s M0 deliverable.

---

## 10. Risks / watch-outs for whoever continues

1. **Do not start M1 until M0 is locked** (`approval-gate`).
2. **Do not put career claims** in UI until M1 evidence nodes exist.
3. **Scope validator** will fail CI if early paths like `src/components/signal` appear.
4. **pnpm only** — respect `packageManager` field.
5. Fresh clones need Playwright browsers installed once.
6. Keep inspiration protocol: adapt principles, do not clone 3D/terminal/neon portfolios.
7. `pnpm ci` script currently omits e2e; GitHub workflow runs e2e separately — keep that distinction conscious.

---

## 11. Definition of done checklist (M0)

- [x] Owner-approved scope implemented
- [x] No WOW product features
- [x] Truth boundaries intact (skeleton only)
- [x] A11y considered (basic)
- [x] Mobile e2e project exists
- [x] Reduced-motion baseline CSS
- [x] Privacy OK for M0
- [x] Tests/contracts exist
- [x] Lint/typecheck/tests/build/e2e verified
- [x] Implementation report exists (`docs/milestones/M0-REPORT.md`)
- [ ] **Owner lock** ← only remaining gate

---

## 12. Recommended next step (after lock)

1. You reply: **`Lock M0`**
2. Agent proposes **M1 — Canonical Truth + Evidence Graph** (full corpus, still no WOW UI)
3. You approve M1 separately
4. Only then implement M1

Do **not** jump to M4 visuals/labs before M1–M3 — that would violate the handoff’s truth-before-UI order.

---

## 13. One-line handover summary

> M0 is a clean, verified engineering foundation for a from-scratch ANISH // RUNTIME rebuild: Next.js/pnpm/tooling/CI/tests/CSP/evidence skeleton/agent skills, with a non-product identity stub. Lock it, then approve M1 for real evidence content.

**Ask:** Lock M0? (`yes` / `no` + notes)
