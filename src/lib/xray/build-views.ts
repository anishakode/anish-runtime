import type { EvidenceGraph } from "@/lib/evidence/schema";
import { resolveSourceTrace } from "@/lib/evidence/source-trace";
import { MLOPS_XRAY_LAYERS, type XrayLayerView } from "./layers";

export function buildMlopsXrayLayers(graph: EvidenceGraph): XrayLayerView[] {
  return MLOPS_XRAY_LAYERS.map((layer) => ({
    id: layer.id,
    title: layer.title,
    summary: layer.summary,
    components: layer.components.map((component) => {
      const resolved = resolveSourceTrace(
        {
          claimLabel: component.label,
          sourceIds: [...component.sourceIds],
          listAnchorId: "project-xray",
        },
        graph,
      );
      return {
        id: component.id,
        label: component.label,
        responsibility: component.responsibility,
        evidenceState: component.evidenceState,
        sources: resolved.sources,
        relatedComponentIds: [...component.relatedComponentIds],
      };
    }),
  }));
}

/** Guard: no invented infra vocabulary in MLOps X-Ray copy. */
export function mlopsXrayCopyMentionsInventedInfra(text: string): boolean {
  return /\b(redis|mlflow|kubernetes|k8s|prometheus|grafana dashboard)\b/i.test(text);
}
