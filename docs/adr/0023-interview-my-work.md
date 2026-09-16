# ADR 0023 — Interview My Work (M21)

**Status:** Accepted (M21)  
**Context:** Handoff §30 — “Don't let my portfolio answer for me. Let it tell you what to ask me.”

## Decision

Turn the canonical evidence a visitor actually inspected into a small, evidence-bounded technical interview set — and refuse to produce the answers.

### Inputs

- Source of truth for interest: the existing in-memory M19 session trace (`SessionTraceEvent[]`).
- Only **canonical** item ids count (`SESSION_ITEM_CATEGORY` membership). Free-text ASK RUNTIME queries and any unknown id are collected into `ignoredInputs` and cannot generate a question.
- Repeated visits to one item collapse via `distinctEvents` — clicking a project ten times buys nothing.

### Catalogue

Questions are **authored**, not generated. `src/lib/interview/catalog.ts` holds templates with:

- `archetype` — VERIFY · DEFEND · STRESS · BOUNDARY;
- `topic` — MLOps governance · Steward agents · Malware explainability (the three strongest evidence groups today);
- `triggerItemIds` — canonical session items that earn the question;
- `evidenceIds` — canonical node ids that bound it;
- `lead`, `followUp`, `why` (WHY THIS QUESTION?), `fairness`.

`buildInterviewCatalog(graph)` binds templates to the Evidence Graph server-side: titles, evidence states, per-node source counts, and project hrefs come from the graph. A template whose evidence ids do not resolve is **dropped**, never displayed with invented support.

### Selection

`selectInterviewSet(catalog, events)` is pure and deterministic:

1. Distinct canonical items only.
2. Candidates = templates with ≥1 matched trigger.
3. Rank by matched-trigger count; catalogue order breaks ties (stable sort).
4. Greedy pick: distinct archetype **and** distinct topic first, then distinct archetype, then fill.
5. Hard cap: **3 questions**.

Two honest empty states instead of filler: no canonical trail yet, or a trail that never reached a catalogued topic.

### Boundary

`ANSWER_KEY_NOTICE` renders with every set:

```text
ANSWER KEY
Not generated.
This portfolio can show you the evidence behind each question.
It will not manufacture Anish's interview answer.
Ask him.
```

Not generated anywhere in this feature: model answer, perfect answer, candidate score, hiring score, personality or culture-fit assessment.

## Consequences

- The interview set is reproducible from the trail — same trail, same questions.
- Extending coverage means authoring catalogue entries against real nodes, which keeps evidence integrity mechanical rather than editorial.
- Topics without strong public evidence simply have no questions, and the UI says so.
- `/interview` is additive: primary recruiter nav is untouched, and the page works without labs, AI, or Signal.
