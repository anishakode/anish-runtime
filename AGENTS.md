# ANISH // RUNTIME — Agent Contract

This repo is a **from-scratch rebuild** of an evidence-first, AI-native engineering portfolio — not a résumé template.

**Canonical product constitution:** `ANISH_RUNTIME_MASTER_HANDOFF.md`  
Treat M0–M23 in that file as the **product design history / contracts**. This workspace implements them again under approval gates. Do not invent features outside the approved milestone.

## Mottos (never dilute)

- Don't read what I can do. Run it. Break it. Inspect it. Challenge it. Trace the proof.
- AI handles interpretation. Software handles truth.
- The UI is the AI response.
- Proof outranks narrative quality.
- Make real engineering evidence feel unforgettable.

## Hard rules

1. **Approval gate** — Propose → wait for owner approval → implement → validate → report → owner lock → **full cumulative stage audit** (`lock-stage-audit`: from M0 through the locked milestone in detail). Never self-declare a milestone complete.
2. **Research first** — On ambiguous product/tech/UX choices: ask the owner **or** deep-research online, then propose a RUNTIME-native adaptation. Steal principles, never clone skins (no 3D-game / terminal-first / neon-cyberpunk / chatbot-primary copies).
3. **Truth** — Canonical Evidence Graph owns facts. AI must not invent or upgrade evidence states.
4. **Recruiter path** — Work / Experience / About / CV / Contact must always work without running labs or AI.
5. **WOW** — Amazement from meaningful engineering interaction, not gimmicks. Execution quality > feature quantity.
6. **Tests stay current** — Every time we introduce new behavior, routes, contracts, or evidence surfaces, update the test suite in the same change (unit and/or e2e as appropriate). Do not ship “feature now, tests later.”
7. **No loose ends** — Test each edge of introduced behavior (happy path, empty/missing data, invalid input, exclusions, weak evidence states, recruiter path without AI). Gaps and untested contracts fail ship.
8. **Strict tests + visible status** — Assertions must be able to fail (exact values, rejection messages, absence checks). Refresh `docs/testing/TEST-STATUS.md` with `pnpm test:status` so the owner can see pass/fail per case; keep `docs/testing/TEST-CATALOG.md` aligned when suites change.

## When forced to choose

Provable claim > impressive claim · Improve signature interaction > new feature · Evidence integrity > AI autonomy · Recruiter clarity > futuristic chrome.

## Project skills (`.cursor/skills/`)

| Skill | Use when |
|-------|----------|
| `approval-gate` | Any milestone, feature, or “start building” |
| `research-first` | Ambiguous decisions; inspiration; tech/UX choices |
| `runtime-constitution` | Any product, UI, AI, or content work |
| `wow-craft` | Landing, motion, labs, WOW features |
| `evidence-integrity` | Claims, badges, search, Signal, Fork, CV |
| `milestone-ship` | Finishing a milestone / definition of done |
| `lock-stage-audit` | After every lock — full check from M0 through all locked stages in detail |
| `lab-determinism` | Runtime labs, simulations, metrics |
| `recruiter-path` | Nav, landing, utility routes, first viewport |
| `public-presence` | GitHub, READMEs, live URL, public packaging |

Read the matching skill before substantive work in that area.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
