# ADR 0025 — Ending Signal (M23)

**Status:** Accepted (M23)
**Context:** Handoff §33–§34 — close the V1 journey with “YOUR PATH THROUGH ANISH”, without building a profiling system to do it.

## Decision

Replay the session from state that already exists, and make the honesty of an inactive session a first-class outcome.

### Inputs — no third tracking system

`buildEndingSignal(catalog, events, traceEntries)` is pure and reads exactly two existing sources:

- the M19 session interaction trail (distinct canonical items);
- the M22 bounded runtime trace (sanitised actions).

Nothing new is recorded for the ending. Only refs present in the journey catalogue become nodes; anything else — notably free-text query refs — is counted in `discardedRefs` and never rendered.

### Journey catalogue

`buildJourneyCatalog(graph)` resolves canonical session item ids into label, href, and evidence state from the Evidence Graph: projects by id, labs via their boundary nodes, experience by record, and the two utility routes with a null state. An item that cannot be resolved is omitted rather than guessed, so the replay cannot name something the graph does not contain.

### Density honesty

| Density  | Rule                                  |
| -------- | ------------------------------------- |
| DEEP     | ≥6 canonical nodes **and** ≥3 actions |
| STANDARD | ≥3 nodes **or** ≥1 action             |
| SHALLOW  | everything else                       |

The thresholds are exported constants with tests pinned to their boundaries, because the tempting failure here is inflating a quiet visit. A visitor who opened nothing gets an empty route, a SHALLOW label, and copy that says the page will not invent one.

### Challenges

`CHALLENGE_COMPLETED` was added to the M22 action enum and is recorded only after a challenge is actually carried through: an MLOps incident recovered from a real break, or a non-baseline Steward safety scenario run to completion. Both record counts and a short note, never raw state. Completed challenges render separately from ordinary runtime actions.

### Privacy

`WHY THIS SIGNAL?` lists what informed the ending and, explicitly, what it excludes: employer identity, location inference, demographic inference, outside browsing history, raw job description text, raw Signal queries, and persistent behaviour profiles. The Journey Integrity Manifest publishes counts alongside four hard zeros — external tracking, persistent profiles, inferred personal traits, and fabricated interactions.

### Ending

The page closes on “There's one thing left you can't test here / Working with me / The last unresolved node is the human”, followed by conventional contact actions — email, CV, LinkedIn, GitHub — resolved from the canonical profile.

## Consequences

- The Ending Signal can only ever describe what the visitor actually did; there is no code path that fabricates a node or an action.
- Presentation is an ordered readable list on every viewport. A decorative desktop constellation was considered and rejected as spectacle that would add nothing to the claim.
- Reduced-motion needs no special handling because there is no staged cinematic movement to suppress.
- `/ending` is a footer affordance alongside `/surface`; the recruiter path is untouched.
- With M23 shipped, the scope validator's forbidden-path list is empty — every WOW surface in the handoff is now unlocked.
