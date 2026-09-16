## Milestone report: M3 — Visual System

**Scope approved:** Owner — “Go on with the best setting” (research Option B)

**M2 status:** Locked (see M2-LOCK-AUDIT)

**Implemented:**

- Editorial Lab semantic tokens + evidence-state colour pairs in `globals.css`
- Instrument Sans + IBM Plex Mono (`next/font`)
- Chrome / page shell / buttons / badges / chips / skip-link primitives
- Evidence state legend on Work + Experience (covers all 8 EvidenceState values)
- Active Instrument hooks only (`instrument-label` / mono tabular nums)
- reduced-motion, prefers-contrast, forced-colors, print, focus-visible
- TOKEN_HEX ↔ CSS sync + WCAG AA contrast contracts
- ADR 0004; research brief at `docs/planning/M3-RESEARCH-BRIEF.md`

**Tests added/updated:**

- `tokens.test.ts` — token names, CSS hex sync, AA contrast, a11y/print/focus contracts
- `evidence-legend.test.tsx` — all EvidenceState labels in legend
- Experience + Work legend asserts; home skip-link + btn-primary class

**Test status:** **45 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** `validate:scope`, `validate:evidence`, `test:status`, format, lint, typecheck, build

**A11y / mobile / reduced-motion:** focus-visible outline; skip-link; forced-colors badge/button borders; prefers-reduced-motion kill-switch; prefers-contrast stroke/muted strengthen; fluid page titles; recruiter routes unchanged on mobile layout

**Truth / privacy notes:** Visual only — no evidence state upgrades; legend explains weak states honestly; session privacy unchanged

**Known gaps / deferred:**

- `/evidence.json` → M3.5
- RUN ANISH / labs / Signal → M4+
- Dark-default theme out of M3
- Heavy cross-OS screenshot VR deferred (CI Linux optional later)
- Local `pnpm ci` still omits e2e (GitHub Actions runs it)
- CSP hardening → M24

**Ask:** Lock M3? → **Locked by owner** (2026-09-14). See `M3-LOCK-AUDIT.md`.
