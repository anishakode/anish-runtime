# Public presence pack (M26)

Copy to apply by hand after launch. Every line is drawn from the frozen corpus — if you
want different wording, change it here first, then check it does not contradict
`docs/evidence/CLAIM-LEDGER.md`.

Live origin: **https://anish-runtime.vercel.app** — verified 38/38 by `pnpm smoke:live`.

Already applied: the `anish-runtime` repository's description, homepage, and topics. The
rest below is by hand — profile, pins, the four flagship repositories, and LinkedIn.

---

## GitHub profile

**Bio** (95 of GitHub's 160 characters):

> AI · ML · Software Engineering. Don't read what I can do — run it, inspect it, trace the
> proof.

Sentence one is `identity:positioning` verbatim, so the profile cannot drift from the
frozen corpus the site and `/evidence.json` serve. An intermediate draft shortened it to
"AI · ML engineering" and was rejected for exactly that: it contradicted a frozen claim,
and dropped the term covering the professional experience that is best evidenced.

Sentence two replaces an earlier draft's "I build intelligent systems from data to model
to production." That line is the only capability claim in the corpus with no evidence
state — defensible on a page surrounded by badges, a legend, and a source trace, and a
bare boast on a profile that has none of them. The motto is the honest substitute, and it
pays off in place: the pinned repositories sit directly beneath it.

The URL is deliberately omitted. GitHub does not linkify bios, so it would be unclickable
text directly above the Website field that renders it properly.

**Location:** Manchester, UK
**Website:** `https://anish-runtime.vercel.app`

**Pinned repositories** — flagships only, archive noise unpinned:

1. `MLOps-Governance-Dashboard`
2. `Steward_AI`
3. `Malware-Detection-Using-ML`
4. `Boring_AI` _(optional fourth)_

## Repository metadata

| Repository                   | Description                                                                                                                | Topics                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `MLOps-Governance-Dashboard` | Monitoring, drift (PSI/KS), data quality, audit events, and governance workflows for ML systems.                           | `mlops` `model-monitoring` `data-drift` `psi` `observability` `governance` |
| `Steward_AI`                 | Healthcare AI stewardship prototype using FHIR context, MCP tools, and A2A/ADK agent concepts. Research/hackathon framing. | `healthcare-ai` `fhir` `mcp` `agents` `safety` `prototype`                 |
| `Malware-Detection-Using-ML` | Explainability study for PDF malware detection, with a public project report. Not production security infrastructure.      | `machine-learning` `explainability` `shap` `security-ml` `pdf`             |
| `Boring_AI`                  | Test-backed codemod workflow for mechanical web3.py v6 → v7 migrations, with optional AI follow-up.                        | `codemod` `web3py` `migration` `deterministic` `ci`                        |

Set each repository's **homepage** to `https://anish-runtime.vercel.app/work/<slug>`.

## Flagship README minimum

Per the `public-presence` skill, a flagship README needs all six:

1. Problem / why it exists
2. What is and is not claimed — the evidence boundary, in the repository's own words
3. Architecture sketch
4. How to run locally
5. Tests / CI
6. Links to sources or the report

A one-line README on a flagship undersells the work and contradicts the portfolio's
central claim that the evidence is inspectable.

## LinkedIn

**Featured link:** `https://anish-runtime.vercel.app` — titled "ANISH // RUNTIME — evidence-first engineering
portfolio".

**Headline** (123 of LinkedIn's 220 characters):

> AI · ML · Software Engineering | MLOps, model monitoring & drift detection (PSI/KS) |
> LLM agents | Evidence-first portfolio

Opens with `identity:positioning` verbatim, as every surface must.

Replaces "AI · ML · Software Engineering — I build intelligent systems from data to model
to production", which failed on two counts. It carried the corpus's only unevidenced
capability claim onto a surface with no badge, legend, or trace to qualify it — the same
objection that decided the GitHub bio, and stronger here, since LinkedIn has no evidence
apparatus at all. It was also the wrong use of the field: the headline is the most heavily
weighted term in recruiter search, and "I build intelligent systems" matches nothing a
recruiter types.

The replacement names work rather than titles, and every term traces to evidence: drift
and monitoring to the MLOps governance dashboard, agents to the Steward ADK orchestrator.
No job title is claimed — the professional role at Cardstack was data and cloud
engineering, so "MLOps Engineer" or "ML Engineer" as a title would be an overclaim the
rest of the corpus refuses to make.

## Identity hygiene

- Canonical email only: `anishakode3101@gmail.com`. The excluded address must not appear
  on any public profile.
- The conflicting Sricons profile stays out of the corpus and off linked profiles.
- Other handles (Devpost and similar) must not contradict the canonical identity.

## Honesty

Agent tooling was used to build this and that is fine — do not hide it. Prefer the
explicit `PORTFOLIO_EXTENSION` and prototype labels over inflated production claims; the
labels are the reason the rest of the evidence is credible.
