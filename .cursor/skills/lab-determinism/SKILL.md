---
name: lab-determinism
description: >-
  Rules for ANISH // RUNTIME deterministic Runtime Labs (MLOps, Steward,
  Malware explainability). Use when building simulations, metrics, incident
  flows, or lab UI. Requires real local math, honest PORTFOLIO_EXTENSION
  labeling, and no fake production telemetry.
---

# Lab Determinism

## Principle

Labs demonstrate **real deterministic calculations / bounded scenarios** grounded in verified project concepts. They are usually `PORTFOLIO_EXTENSION` — not the original production runtime.

## Required

- Seeded / reproducible behavior where randomness appears
- Visible labeling of what is runtime-lab vs code-verified vs simulated notify
- Source Trace to canonical evidence for key metrics (e.g. PSI → drift.py)
- Accessible non-visual equivalents (tables, status text)
- Reduced-motion safe incident presentation

## Forbidden

- Fake Grafana / live prod traffic / invented uptime/FPS
- Real Slack/email sends (simulate and label)
- Claiming the browser lab *is* the historical production system
- Steward: real patient data, live clinical advice, live FHIR/Gemini as “production”
- Malware lab: file upload attack surface, malware execution, model verdict as absolute truth

## MLOps signature flow

BREAK → controlled shift → recompute PSI/KS → detect → audit → simulated alert → INCIDENT → investigate → recover → optional Source Trace

## Steward / Malware

Synthetic context only. Withhold treatment advice. Dry-run Task preview only. Static/deterministic explainability for malware study.
