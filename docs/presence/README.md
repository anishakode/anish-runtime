# Flagship README drafts (M27)

Drafts for review. Nothing here has been pushed to the flagship repositories — read
them, change anything that misrepresents the work, then apply.

Why this milestone exists: the site tells visitors to inspect the proof, and until now
the proof trail ended at repositories with 29-byte READMEs. The code was real and
SHA-pinned, but the destination looked abandoned.

| Repository                   | README before | Draft                                              |
| ---------------------------- | ------------- | -------------------------------------------------- |
| `MLOps-Governance-Dashboard` | 29 bytes      | [full draft](README-mlops-governance-dashboard.md) |
| `Malware-Detection-Using-ML` | 28 bytes      | [full draft](README-malware-detection.md)          |
| `Boring_AI`                  | 1,583 bytes   | [full draft](README-boring-ai.md)                  |
| `Steward_AI`                 | 5,707 bytes   | [two-change patch](README-steward-ai-patch.md)     |

`Steward_AI` already had a good README, so it gets a patch rather than a rewrite.

## What I checked before writing them

Every draft describes files that exist. I surveyed each repository's tree and read the
CI workflows, `requirements.txt`, `pytest.ini`, the test files, and `codemod.yaml`, so
the run instructions and test claims match reality rather than sounding plausible.

Three things the drafts say that a generated README would not:

- **MLOps** — `tests/test_smoke.py` is the only test file and asserts two things. The
  draft says so, and says the statistical functions are untested in that repository.
  It also warns that `requirements.txt` declaring `mlflow`, `redis`, and `celery` does
  not mean those are wired up, which is the same reason the portfolio's X-Ray refuses
  to draw them.
- **Malware** — the repository holds two files, the report and the README. There is no
  model code to run. The draft leads with that.
- **Boring_AI** — the `geth-poa-factory-unchanged` fixture asserts the codemod leaves
  valid code alone, which is the most interesting test in the set.

## Applying

READMEs are paste-by-hand. Repository metadata is scripted, and the values come from
[`../launch/PUBLIC-PRESENCE.md`](../launch/PUBLIC-PRESENCE.md) so both files agree:

```bash
gh repo edit anishakode/MLOps-Governance-Dashboard \
  --description "Monitoring, drift (PSI/KS), data quality, audit events, and governance workflows for ML systems." \
  --homepage "https://anish-runtime.vercel.app/work/mlops-governance-dashboard" \
  --add-topic mlops --add-topic model-monitoring --add-topic data-drift \
  --add-topic psi --add-topic observability --add-topic governance

gh repo edit anishakode/Steward_AI \
  --description "Healthcare AI stewardship prototype using FHIR context, MCP tools, and A2A/ADK agent concepts. Research/hackathon framing." \
  --homepage "https://anish-runtime.vercel.app/work/steward-ai" \
  --add-topic healthcare-ai --add-topic fhir --add-topic mcp \
  --add-topic agents --add-topic safety --add-topic prototype

gh repo edit anishakode/Malware-Detection-Using-ML \
  --description "Explainability study for PDF malware detection, with a public project report. Not production security infrastructure." \
  --homepage "https://anish-runtime.vercel.app/work/explainable-pdf-malware-detection" \
  --add-topic machine-learning --add-topic explainability --add-topic shap \
  --add-topic security-ml --add-topic pdf

gh repo edit anishakode/Boring_AI \
  --description "Test-backed codemod workflow for mechanical web3.py v6 to v7 migrations, with optional AI follow-up." \
  --homepage "https://anish-runtime.vercel.app/work/boring-ai" \
  --add-topic codemod --add-topic web3py --add-topic migration \
  --add-topic deterministic --add-topic ci
```

Then pin the four on the profile and set the bio, per `PUBLIC-PRESENCE.md`.

## After applying

```bash
pnpm verify:sources
```

The drafts add links, and a link that 404s on a page arguing for provenance is worse
than no link. This confirms all 23 cited sources still resolve.
