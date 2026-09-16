/**
 * Honesty + Source Trace contracts for the MLOps deterministic core (M5).
 * Calculations are PORTFOLIO_EXTENSION — grounded in public project evidence,
 * not claimed as the exact historical production runtime.
 */

export const MLOPS_LAB_EVIDENCE_STATE = "PORTFOLIO_EXTENSION" as const;

export const MLOPS_SOURCE_TRACE = {
  projectId: "proj.mlops-governance",
  projectSlug: "mlops-governance-dashboard",
  runtimeLabNodeId: "ev.mlops.runtime-lab",
  psiNodeId: "ev.mlops.psi",
  ksNodeId: "ev.mlops.ks",
  driftNodeId: "ev.mlops.drift",
  psiSourceId: "src.mlops.drift-py",
  ksSourceId: "src.mlops.stats-py",
  psiSourcePath: "backend/app/utils/drift.py",
  ksSourcePath: "backend/app/utils/stats.py",
  commitSha: "a2ba6fc45aaece5c3241569271bcca77124da2b4",
} as const;

export const MLOPS_BOUNDARY_NOTICE =
  "PORTFOLIO_EXTENSION — browser-ready deterministic core grounded in public MLOps Governance Dashboard evidence. Not the exact historical production runtime. No fabricated Grafana or live production telemetry.";
