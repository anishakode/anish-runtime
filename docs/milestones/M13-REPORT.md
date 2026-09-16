## Milestone report: M13 — PDF Malware Explainability Lab

**Scope approved:** Owner — “Lets go next” (Lock M12 + Approve M13)

**Implemented:**

- `src/lib/malware/` — static feature reconstruction + honesty contracts
- `MalwareLab` UI: feature toggles, study signal, LIMITED SHAP panel, Source Trace
- `/labs/malware` + Autopsy RUN on `/work/explainable-pdf-malware-detection`
- Graph: `ev.malware.runtime-lab`, `src.portfolio.malware-lab`, edges
- ADR 0015; validate-scope REQUIRED pins
- M12 locked + cumulative audit (`M12-LOCK-AUDIT.md`); footer → M12

**Tests added/updated:**

- `reconstruction.test.ts` — determinism, anti-verdict, toggle math
- `malware-lab.test.tsx` / page / autopsy bundle tests
- work page Malware RUN; home stats 40 nodes; e2e malware smoke
- Footer lock stage assertion → M12

**Test status:** **178 passed / 0 failed** — see `docs/testing/TEST-STATUS.md`

**Validation run:** scope · evidence · format · lint · typecheck · test:status · build — OK (`pnpm run ci`)

**Truth / privacy notes:** No execution · no upload · study signal ≠ security verdict · SHAP stays LIMITED_EVIDENCE · PORTFOLIO_EXTENSION labeled

**Known gaps / deferred:** Malware X-Ray depth; Failure Museum (M14); Signal; footer bumps to M13 on lock

**Ask:** Lock M13? (yes/no)
