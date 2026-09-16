import type { EvidenceGraph } from "@/lib/evidence/schema";
import { resolveSourceTrace } from "@/lib/evidence/source-trace";
import type {
  AutopsyDecision,
  AutopsyFailuresView,
  AutopsyProjectBundle,
  AutopsyStoryView,
} from "./lenses";

const FAILURE_MUSEUM_NODE_ID = "ev.boundary.failure-museum-empty";

const MLOPS_DECISION_DEFS: ReadonlyArray<{
  id: string;
  title: string;
  detail: string;
  evidenceState: AutopsyDecision["evidenceState"];
  sourceIds: string[];
}> = [
  {
    id: "dec.mlops.dual-detectors",
    title: "Pair PSI with KS instead of a single drift score",
    detail:
      "Public drift utilities expose both Population Stability Index and Kolmogorov–Smirnov paths so severity disagreement can be inspected rather than hidden behind one number.",
    evidenceState: "PUBLIC_CODE_VERIFIED",
    sourceIds: ["src.mlops.drift-py", "src.mlops.stats-py"],
  },
  {
    id: "dec.mlops.audit-policy-split",
    title: "Keep audit sink separate from policy checks",
    detail:
      "Audit event representation and policy/governance checks are distinct modules — recording what happened is not the same as gating a decision.",
    evidenceState: "PUBLIC_CODE_VERIFIED",
    sourceIds: ["src.mlops.audit-sink", "src.mlops.policy"],
  },
  {
    id: "dec.mlops.lab-boundary",
    title: "Label the browser Runtime Lab as PORTFOLIO_EXTENSION",
    detail:
      "The inspectable lab recomputes real local math grounded in public sources, but it is not claimed as the exact historical production runtime.",
    evidenceState: "PORTFOLIO_EXTENSION",
    sourceIds: ["src.portfolio.runtime-lab", "src.mlops.repo"],
  },
];

export function buildMlopsAutopsyBundle(graph: EvidenceGraph): AutopsyProjectBundle {
  const project = graph.projects.find((p) => p.slug === "mlops-governance-dashboard");
  if (!project) {
    throw new Error("buildMlopsAutopsyBundle: mlops project missing from graph");
  }

  const story: AutopsyStoryView = {
    title: project.title,
    summary: project.summary,
    themes: [...project.themes],
    evidenceState: project.evidenceState,
  };

  const decisions: AutopsyDecision[] = MLOPS_DECISION_DEFS.map((def) => {
    const resolved = resolveSourceTrace(
      {
        claimLabel: def.title,
        sourceIds: def.sourceIds,
        listAnchorId: "autopsy-decisions",
      },
      graph,
    );
    return {
      id: def.id,
      title: def.title,
      detail: def.detail,
      evidenceState: def.evidenceState,
      sourceIds: def.sourceIds,
      sources: resolved.sources,
    };
  });

  const failureNode = graph.nodes.find((n) => n.id === FAILURE_MUSEUM_NODE_ID);
  if (!failureNode) {
    throw new Error("buildMlopsAutopsyBundle: failure museum boundary node missing");
  }

  const failures: AutopsyFailuresView = {
    empty: true,
    nodeId: failureNode.id,
    title: failureNode.title,
    summary:
      failureNode.summary ??
      "No artifact-grade failure exhibits published yet. Empty truthful museum preferred over fabricated stories.",
    state: failureNode.state,
  };

  return {
    projectSlug: project.slug,
    story,
    decisions,
    failures,
  };
}
