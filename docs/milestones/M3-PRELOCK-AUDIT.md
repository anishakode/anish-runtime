## Pre-lock audit: through M3 (ready to lock)

**Trigger:** Owner requested final check + improvements before lock  
**Stages re-checked:** M0 · M1 · M2 · M3

### CRITICAL

_None._

### HIGH (fixed before lock ask)

1. **TOKEN_HEX ↔ CSS sync** — now enforced in `tokens.test.ts` via `parseRootHexTokens`; all evidence-state fg/bg pairs (incl. verified-doc / resume / prior) in `CONTRAST_PAIRS`.

### MEDIUM (fixed)

2. Legend covers all 8 EvidenceState values (data + UI tests)
3. Experience page asserts legend
4. Visual tests assert `:focus-visible` + print `.site-chrome`
5. `--measure` in semantic token list; `globals.css` / `layout.tsx` in scope validator
6. M3-REPORT completed to ship template
7. Home asserts skip-link + `btn-primary`
8. Prettier drift cleaned; generated `TEST-STATUS.md` ignored by Prettier

### LOW / deferred (accept)

- Resume / prior / not-demonstrated share muted graphite palette (labels distinguish)
- Local `pnpm ci` omits e2e (GHA runs it)
- `/evidence.json`, labs/Signal, dark-default, CSP → later milestones
- Heavy screenshot VR deferred

### Solid

- Recruiter path intact; no Signal/labs paths
- Evidence graph OK; 45 unit tests green
- Editorial Lab fonts/tokens/a11y baselines present
- format · lint · typecheck · build OK

### Commands run

`validate:scope` · `validate:evidence` · `test:status` (45 pass) · `format:check` · `lint` · `typecheck` · `build`

**Lock hygiene:** Clean

**Ask:** Lock M3? → **Locked** — see `M3-LOCK-AUDIT.md`.
