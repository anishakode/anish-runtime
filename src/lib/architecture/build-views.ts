import type { EvidenceGraph } from "@/lib/evidence/schema";
import { resolveSourceTrace, toTraceSourceView } from "@/lib/evidence/source-trace";
import { MLOPS_ARCHITECTURE_STAGES, type ArchitectureStageView } from "./stages";

/** Build client-safe stage views from the Evidence Graph (server-only entry). */
export function buildMlopsArchitectureViews(
  graph: EvidenceGraph,
): ArchitectureStageView[] {
  return MLOPS_ARCHITECTURE_STAGES.map((stage) => {
    const resolved = resolveSourceTrace(
      {
        claimLabel: stage.claimLabel,
        sourceIds: [...stage.sourceIds],
        listAnchorId: "reversible-architecture",
      },
      graph,
    );

    // Prefer resolveSourceTrace ordering; fall back to empty if somehow empty (should throw above).
    const sources =
      resolved.sources.length > 0
        ? resolved.sources
        : stage.sourceIds.map((id) => {
            const source = graph.sources.find((s) => s.id === id);
            if (!source) {
              throw new Error(`buildMlopsArchitectureViews: missing source ${id}`);
            }
            return toTraceSourceView(source);
          });

    return {
      id: stage.id,
      index: stage.index,
      title: stage.title,
      claimLabel: stage.claimLabel,
      summary: stage.summary,
      reasoning: stage.reasoning,
      reality: stage.reality,
      nodeIds: [...stage.nodeIds],
      sources,
    };
  });
}
