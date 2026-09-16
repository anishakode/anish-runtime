# Steward_AI — targeted patch, not a rewrite

The existing README is already good: problem framing, repository layout, a
mermaid architecture diagram, the MCP tool list, demo patients, local dev for all
three services, tests, Docker notes, and a disclaimer. Replacing it would lose
accurate detail and gain nothing.

Two changes only.

## 1. Put the boundary at the top, not the bottom

The disclaimer is currently the last thing on the page. For a project that
touches clinical decisions, the reader should meet it before the architecture
diagram, not after the Docker instructions. Keep the existing text at the bottom
too — belt and braces costs nothing.

Insert directly under the opening paragraph, before `## Why this exists`:

```markdown
> **Research and hackathon demonstration.** Not medical advice, not a clinical
> device, and not connected to any real patient record. Every FHIR interaction in
> this repository runs against the synthetic bundles in `fhir-data/`. The
> stewardship recommendation is a structured suggestion for a qualified clinician
> to accept or reject — it does not prescribe, and it must not replace
> professional judgement or institutional protocol.
```

## 2. Link the interactive walkthrough

The portfolio runs the four stewardship scenarios in the browser, showing which
tools each one calls and where they stop. It is the fastest way to understand the
agent's shape without standing up three services.

Add at the end of the opening section:

```markdown
**Walk through the scenarios interactively:**
[anish-runtime.vercel.app/work/steward-ai](https://anish-runtime.vercel.app/work/steward-ai)
— four cases, the tool calls each one makes, and the points where the agent
refuses to proceed.
```

## Why the lab shows the recommendation tool as blocked

Worth knowing if you compare the two, because it looks like a discrepancy and
isn't.

In this repository `generate_stewardship_recommendation` is implemented and
functional. In the portfolio lab it renders as `blocked` in all four scenarios,
including the baseline. That is a deliberate decision about the portfolio, not a
statement about this code: a portfolio page open to anyone on the internet should
not emit anything that reads like antibiotic guidance, however well hedged. The
lab shows the workflow reaching that tool and stopping.

The FHIR `Task` preview is handled the same way — shown as a dry run, only in the
baseline scenario, against synthetic patients.

## Repository metadata

- **Description:** `Antibiotic stewardship over FHIR — MCP tool server, A2A agent (Google ADK), synthetic patient data. Research/hackathon prototype.`
- **Topics:** `fhir`, `mcp`, `healthcare-ai`, `a2a`, `google-adk`, `agents`, `python`
- **Homepage:** `https://anish-runtime.vercel.app/work/steward-ai`
