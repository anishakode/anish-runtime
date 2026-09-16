import type { EvidenceGraph } from "@/lib/evidence/schema";
import { resolveSourceTrace } from "@/lib/evidence/source-trace";
import type {
  AutopsyDecision,
  AutopsyFailuresView,
  AutopsyProjectBundle,
  AutopsyStoryView,
} from "./lenses";

const FAILURE_MUSEUM_NODE_ID = "ev.boundary.failure-museum-empty";

const STEWARD_DECISION_DEFS: ReadonlyArray<{
  id: string;
  title: string;
  detail: string;
  evidenceState: AutopsyDecision["evidenceState"];
  sourceIds: string[];
}> = [
  {
    id: "dec.steward.mcp-tools",
    title: "Expose stewardship steps as inspectable MCP tools",
    detail:
      "Public MCP server surfaces FHIR-oriented tools (antibiotics, cultures, allergies, renal, recommendation, Task) so orchestration can be reviewed step-by-step.",
    evidenceState: "PUBLIC_CODE_VERIFIED",
    sourceIds: ["src.steward.mcp-server", "src.steward.readme"],
  },
  {
    id: "dec.steward.safety-boundary",
    title: "Keep hackathon / not-clinical boundary visible",
    detail:
      "README disclaimer frames Steward_AI as research/education — not medical advice and not a production clinical system.",
    evidenceState: "PUBLIC_CODE_VERIFIED",
    sourceIds: ["src.steward.readme"],
  },
  {
    id: "dec.steward.lab-boundary",
    title: "Label the browser Agent Lab as PORTFOLIO_EXTENSION",
    detail:
      "The inspectable lab uses synthetic context and withholds treatment advice. It is not live FHIR, Gemini, or MCP production runtime.",
    evidenceState: "PORTFOLIO_EXTENSION",
    sourceIds: ["src.portfolio.steward-lab", "src.steward.repo"],
  },
];

export function buildStewardAutopsyBundle(graph: EvidenceGraph): AutopsyProjectBundle {
  const project = graph.projects.find((p) => p.slug === "steward-ai");
  if (!project) {
    throw new Error("buildStewardAutopsyBundle: steward project missing from graph");
  }

  const story: AutopsyStoryView = {
    title: project.title,
    summary: project.summary,
    themes: [...project.themes],
    evidenceState: project.evidenceState,
  };

  const decisions: AutopsyDecision[] = STEWARD_DECISION_DEFS.map((def) => {
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
    throw new Error("buildStewardAutopsyBundle: failure museum boundary node missing");
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
