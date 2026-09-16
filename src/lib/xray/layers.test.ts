import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { EVIDENCE_STRENGTH } from "@/lib/freeze/strength";
import { buildMlopsXrayLayers, mlopsXrayCopyMentionsInventedInfra } from "./build-views";
import { findXrayComponent, MLOPS_XRAY_LAYERS, relatedLabelsFor } from "./layers";

describe("Project X-Ray layers (M11)", () => {
  it("defines four responsibility layers with graph-backed components", () => {
    expect(MLOPS_XRAY_LAYERS.map((l) => l.id)).toEqual([
      "boundary",
      "observability",
      "detection",
      "governance",
    ]);
    const views = buildMlopsXrayLayers(getGraph());
    expect(views).toHaveLength(4);
    for (const layer of views) {
      expect(layer.components.length).toBeGreaterThan(0);
      for (const component of layer.components) {
        expect(component.sources.length).toBeGreaterThan(0);
      }
    }
  });

  it("resolves detection components to drift.py and stats.py", () => {
    const views = buildMlopsXrayLayers(getGraph());
    const detection = views.find((l) => l.id === "detection");
    const paths = detection?.components.flatMap((c) => c.sources.map((s) => s.path));
    expect(paths).toEqual(
      expect.arrayContaining([
        "backend/app/utils/drift.py",
        "backend/app/utils/stats.py",
      ]),
    );
  });

  it("rejects invented Redis/MLflow vocabulary in layer copy", () => {
    const blob = MLOPS_XRAY_LAYERS.map(
      (l) =>
        `${l.title} ${l.summary} ${l.components.map((c) => c.responsibility).join(" ")}`,
    ).join(" ");
    expect(mlopsXrayCopyMentionsInventedInfra(blob)).toBe(false);
    expect(mlopsXrayCopyMentionsInventedInfra("uses Redis and MLflow")).toBe(true);
  });

  it("finds components and related labels", () => {
    expect(findXrayComponent(MLOPS_XRAY_LAYERS, "cmp.mlops.drift")?.label).toMatch(
      /PSI/i,
    );
    const views = buildMlopsXrayLayers(getGraph());
    expect(relatedLabelsFor(views, "cmp.mlops.drift")).toEqual(
      expect.arrayContaining([expect.stringMatching(/KS/i)]),
    );
  });

  it("never claims a state stronger than the graph nodes behind its sources", () => {
    // The states in this file are hand-authored, so without this they could be
    // upgraded and every other test would still pass. Bind them to the corpus:
    // a component may be more cautious than its evidence, never bolder.
    const graph = getGraph();
    const components = MLOPS_XRAY_LAYERS.flatMap((layer) => layer.components);
    expect(components.length).toBeGreaterThan(0);

    for (const component of components) {
      const backing = graph.nodes.filter((node) =>
        node.sourceIds.some((id) => component.sourceIds.includes(id)),
      );
      expect(
        backing.length,
        `${component.id} cites no graph-backed source`,
      ).toBeGreaterThan(0);

      const strongestAvailable = Math.min(
        ...backing.map((node) => EVIDENCE_STRENGTH[node.state]),
      );
      expect(
        EVIDENCE_STRENGTH[component.evidenceState],
        `${component.id} claims ${component.evidenceState}, stronger than anything its sources support`,
      ).toBeGreaterThanOrEqual(strongestAvailable);
    }
  });
});
