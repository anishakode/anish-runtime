## Research brief

**Question:** How should RUN ANISH compile without becoming terminal theatre or motion that gates recruiters?

**Sources:**

- Handoff M4 + WOW 1 (`ANISH_RUNTIME_MASTER_HANDOFF.md`)
- a11y-with-Lindsey — `prefers-reduced-motion` patterns
- Immersive intro specs (GitHub) — reduced-motion self-disables to static functional pages
- AdminLTE a11y notes — Escape + live announcements for status

**Patterns found:**

- Readable HTML first; cinematic sequence is enhancement
- Skip / Escape / reduced-motion jump to final state
- Live region announces progress for assistive tech
- Mobile prefers ordered lists over geometry

**Anti-patterns to reject:**

- Fake terminal / particle / neon cyberpunk
- Identity hidden until animation completes
- Canvas force-graph as the only mobile UX

**RUNTIME-native options:**

1. Timed step list + CSS constellation (chosen)
2. Framer Motion cinematic (heavier; deferred)
3. Immediate settle with optional replay only (weaker WOW)

**Recommendation:** Option 1 — four semantic compile steps paced by journey preset; settle into graph-backed counts, capabilities, flagships; Skip/Escape/reduced-motion → ready immediately.

**Needs owner approval before:** Already approved as M4 scope (“Yeah lets go next”).
