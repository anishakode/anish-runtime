## Research brief

**Question:** How should M5 implement PSI/KS and related metrics so they are real, reproducible, and honest about PORTFOLIO_EXTENSION?

**Sources:**

- Pinned evidence: `backend/app/utils/drift.py` @ `a2ba6fc…` (PSI + classify)
- Pinned evidence: `backend/app/utils/stats.py` @ `a2ba6fc…` (KS D + severity)
- [dqt `drift.psi` notes](https://github.com/antonbarr-data/dqt/blob/b4fcede8c76067e32911890e4e595e2be6e822b3/docs/algorithms/psi.md) — empty-bin / log(0) failure mode
- Handoff M5 + `lab-determinism` skill

**Patterns found:**

- PSI on binned proportions with safe epsilon; classify at 0.10 / 0.25
- Two-sample KS D via empirical CDF max gap; classify at 0.10 / 0.20
- Labs must be seeded and labeled as portfolio extensions, not production telemetry

**Anti-patterns to reject:**

- Fake Grafana / live prod traffic
- Claiming browser math _is_ the historical runtime
- Shipping lab UI in M5 (belongs to M6)

**RUNTIME-native options:**

1. Port pinned PSI/KS algorithms into TypeScript + add seeded histogram/scenario/state/alert core (chosen)
2. Call Python WASM (heavier; deferred)
3. Approximate metrics only (rejected — proof requires real math)

**Recommendation:** Option 1 under `src/lib/mlops/` with Source Trace IDs to graph nodes/sources; no UI routes.

**Needs owner approval before:** Already approved as M5 (“lets go next”).
