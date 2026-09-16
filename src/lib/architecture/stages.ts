import type { TraceSourceView } from "@/lib/evidence/source-trace";

/** Handoff M9 stage ids — causal reasoning, not version history. */
export type ArchitectureStageId =
  | "system-boundary"
  | "lifecycle-context"
  | "observability"
  | "detection"
  | "governance-loop";

/**
 * Reality labels prevent architecture theatre (handoff §31 style).
 * PORTFOLIO_SIMULATION = browser lab / reconstruction framing.
 * PUBLIC_CODE_VERIFIED = grounded in SHA-pinned public sources.
 */
export type ArchitectureReality = "PORTFOLIO_SIMULATION" | "PUBLIC_CODE_VERIFIED";

export type ArchitectureStageDef = {
  id: ArchitectureStageId;
  index: number;
  title: string;
  /** Short stage claim shown in the panel */
  claimLabel: string;
  summary: string;
  /** Causal “why this comes next” copy */
  reasoning: string;
  reality: ArchitectureReality;
  nodeIds: readonly string[];
  sourceIds: readonly string[];
};

export type ArchitectureStageView = {
  id: ArchitectureStageId;
  index: number;
  title: string;
  claimLabel: string;
  summary: string;
  reasoning: string;
  reality: ArchitectureReality;
  nodeIds: string[];
  sources: TraceSourceView[];
};

export const ARCHITECTURE_PRODUCT_LABEL =
  "Architecture reasoning reconstruction" as const;

export const ARCHITECTURE_PRODUCT_NOTE =
  "Causal reconstruction of how the MLOps Governance system hangs together — not a fake historical v0 → v1 → v2 evolution." as const;

/** Ordered MLOps stages mapped only to existing Evidence Graph ids. */
export const MLOPS_ARCHITECTURE_STAGES: readonly ArchitectureStageDef[] = [
  {
    id: "system-boundary",
    index: 0,
    title: "System Boundary",
    claimLabel: "What is real vs portfolio simulation",
    summary:
      "The public MLOps Governance Dashboard is code-verified. The browser Runtime Lab is a PORTFOLIO_EXTENSION grounded in those concepts — not the exact historical production runtime.",
    reasoning:
      "Start with the honesty boundary so later stages cannot be mistaken for live production infrastructure.",
    reality: "PORTFOLIO_SIMULATION",
    nodeIds: ["ev.mlops.runtime-lab", "ev.mlops.project"],
    sourceIds: ["src.portfolio.runtime-lab", "src.mlops.repo"],
  },
  {
    id: "lifecycle-context",
    index: 1,
    title: "Lifecycle Context",
    claimLabel: "Where the system sits in the ML lifecycle",
    summary:
      "Governance sits around model and data operations: observe distributions, detect shift, record audits, and apply policy checks before promotion-style decisions.",
    reasoning:
      "Without lifecycle context, drift metrics look like isolated statistics instead of operational controls.",
    reality: "PUBLIC_CODE_VERIFIED",
    nodeIds: ["ev.mlops.project"],
    sourceIds: ["src.mlops.repo"],
  },
  {
    id: "observability",
    index: 2,
    title: "Observability",
    claimLabel: "Operational monitoring concepts",
    summary:
      "Monitoring concepts live in the public repository. This stage does not invent Grafana dashboards or live production telemetry.",
    reasoning:
      "You can only govern what you can observe — still without fabricating production telemetry in this portfolio.",
    reality: "PUBLIC_CODE_VERIFIED",
    nodeIds: ["ev.mlops.monitoring"],
    sourceIds: ["src.mlops.repo"],
  },
  {
    id: "detection",
    index: 3,
    title: "Detection",
    claimLabel: "Drift detection via PSI and KS",
    summary:
      "Data drift monitoring uses Population Stability Index and Kolmogorov–Smirnov utilities pinned to public source files.",
    reasoning:
      "Detection turns observed distributions into actionable severity — the same math the Runtime Lab recomputes locally.",
    reality: "PUBLIC_CODE_VERIFIED",
    nodeIds: ["ev.mlops.drift", "ev.mlops.psi", "ev.mlops.ks"],
    sourceIds: ["src.mlops.drift-py", "src.mlops.stats-py"],
  },
  {
    id: "governance-loop",
    index: 4,
    title: "Governance Loop",
    claimLabel: "Audit sink and policy checks",
    summary:
      "Audit event representation and policy/governance checks close the loop: record what happened and gate decisions with explicit rules.",
    reasoning:
      "Detection without governance is a dashboard. Audit + policy make the system accountable.",
    reality: "PUBLIC_CODE_VERIFIED",
    nodeIds: ["ev.mlops.audit", "ev.mlops.policy"],
    sourceIds: ["src.mlops.audit-sink", "src.mlops.policy"],
  },
] as const;

export const ARCHITECTURE_STAGE_COUNT = MLOPS_ARCHITECTURE_STAGES.length;

export function clampArchitectureIndex(index: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(ARCHITECTURE_STAGE_COUNT - 1, Math.trunc(index)));
}

export function architectureStageAt(index: number): ArchitectureStageDef {
  const i = clampArchitectureIndex(index);
  const stage = MLOPS_ARCHITECTURE_STAGES[i];
  if (!stage) {
    throw new Error(`architectureStageAt: missing stage at ${i}`);
  }
  return stage;
}

/** Cumulative stages revealed from 0 through index (inclusive). */
export function revealedArchitectureStages(index: number): ArchitectureStageDef[] {
  const end = clampArchitectureIndex(index);
  return MLOPS_ARCHITECTURE_STAGES.slice(0, end + 1).map((s) => s);
}

export function nextArchitectureIndex(index: number): number {
  return clampArchitectureIndex(index + 1);
}

export function previousArchitectureIndex(index: number): number {
  return clampArchitectureIndex(index - 1);
}

export const ARCHITECTURE_REALITY_LABEL: Record<ArchitectureReality, string> = {
  PORTFOLIO_SIMULATION: "portfolio simulation",
  PUBLIC_CODE_VERIFIED: "public code verified",
};
