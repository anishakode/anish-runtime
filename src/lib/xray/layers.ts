import type { EvidenceState } from "@/lib/evidence/schema";
import type { TraceSourceView } from "@/lib/evidence/source-trace";

export type XrayLayerId = "boundary" | "observability" | "detection" | "governance";

export type XrayComponentDef = {
  id: string;
  label: string;
  responsibility: string;
  evidenceState: EvidenceState;
  sourceIds: readonly string[];
  relatedComponentIds: readonly string[];
};

export type XrayLayerDef = {
  id: XrayLayerId;
  title: string;
  summary: string;
  components: readonly XrayComponentDef[];
};

export type XrayComponentView = {
  id: string;
  label: string;
  responsibility: string;
  evidenceState: EvidenceState;
  sources: TraceSourceView[];
  relatedComponentIds: string[];
};

export type XrayLayerView = {
  id: XrayLayerId;
  title: string;
  summary: string;
  components: XrayComponentView[];
};

export const XRAY_PRODUCT_LABEL = "Project X-Ray" as const;

export const XRAY_PRODUCT_NOTE =
  "Responsibility-layer inspection grounded in public evidence — not invented Redis/MLflow or fake production service maps." as const;

/**
 * MLOps layers — only components with Evidence Graph source ids.
 * No unproven infrastructure paths.
 */
export const MLOPS_XRAY_LAYERS: readonly XrayLayerDef[] = [
  {
    id: "boundary",
    title: "Boundary",
    summary:
      "What is portfolio simulation versus public code. Keeps the Runtime Lab honest.",
    components: [
      {
        id: "cmp.mlops.runtime-lab",
        label: "Browser Runtime Lab",
        responsibility:
          "Deterministic local PSI/KS lab labeled PORTFOLIO_EXTENSION — not the historical production runtime.",
        evidenceState: "PORTFOLIO_EXTENSION",
        sourceIds: ["src.portfolio.runtime-lab", "src.mlops.repo"],
        relatedComponentIds: ["cmp.mlops.repo-surface"],
      },
      {
        id: "cmp.mlops.repo-surface",
        label: "Public repository surface",
        responsibility:
          "SHA-pinned public MLOps Governance Dashboard repository as the code-verified project root.",
        evidenceState: "PUBLIC_CODE_VERIFIED",
        sourceIds: ["src.mlops.repo"],
        relatedComponentIds: ["cmp.mlops.runtime-lab", "cmp.mlops.monitoring"],
      },
    ],
  },
  {
    id: "observability",
    title: "Observability",
    summary:
      "Monitoring concepts as represented in the public repo — no fabricated Grafana dashboards.",
    components: [
      {
        id: "cmp.mlops.monitoring",
        label: "Operational monitoring concepts",
        responsibility:
          "Observability language and monitoring framing from the public project evidence.",
        evidenceState: "PUBLIC_CODE_VERIFIED",
        sourceIds: ["src.mlops.repo"],
        relatedComponentIds: ["cmp.mlops.drift", "cmp.mlops.repo-surface"],
      },
    ],
  },
  {
    id: "detection",
    title: "Detection",
    summary: "Drift detection utilities: PSI and KS paths in public source files.",
    components: [
      {
        id: "cmp.mlops.drift",
        label: "Drift monitoring (PSI utilities)",
        responsibility:
          "Population Stability Index and related drift helpers in backend/app/utils/drift.py.",
        evidenceState: "PUBLIC_CODE_VERIFIED",
        sourceIds: ["src.mlops.drift-py"],
        relatedComponentIds: ["cmp.mlops.ks", "cmp.mlops.monitoring"],
      },
      {
        id: "cmp.mlops.ks",
        label: "KS statistic utilities",
        responsibility:
          "Kolmogorov–Smirnov helpers in backend/app/utils/stats.py for distribution comparison.",
        evidenceState: "PUBLIC_CODE_VERIFIED",
        sourceIds: ["src.mlops.stats-py"],
        relatedComponentIds: ["cmp.mlops.drift", "cmp.mlops.audit"],
      },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    summary: "Audit recording and policy checks as separate responsibilities.",
    components: [
      {
        id: "cmp.mlops.audit",
        label: "Audit sink",
        responsibility: "Audit event representation in backend/app/utils/audit_sink.py.",
        evidenceState: "PUBLIC_CODE_VERIFIED",
        sourceIds: ["src.mlops.audit-sink"],
        relatedComponentIds: ["cmp.mlops.policy", "cmp.mlops.ks"],
      },
      {
        id: "cmp.mlops.policy",
        label: "Policy checks",
        responsibility: "Policy / governance checks in backend/app/utils/policy.py.",
        evidenceState: "PUBLIC_CODE_VERIFIED",
        sourceIds: ["src.mlops.policy"],
        relatedComponentIds: ["cmp.mlops.audit"],
      },
    ],
  },
] as const;

export const XRAY_LAYER_IDS = MLOPS_XRAY_LAYERS.map((l) => l.id);

export function findXrayComponent(
  layers: readonly XrayLayerDef[],
  componentId: string,
): XrayComponentDef | undefined {
  for (const layer of layers) {
    const found = layer.components.find((c) => c.id === componentId);
    if (found) return found;
  }
  return undefined;
}

export function relatedLabelsFor(
  layers: readonly XrayLayerView[],
  componentId: string,
): string[] {
  const all = layers.flatMap((l) => l.components);
  const self = all.find((c) => c.id === componentId);
  if (!self) return [];
  return self.relatedComponentIds
    .map((id) => all.find((c) => c.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}
