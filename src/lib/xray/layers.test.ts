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

  it("carries the exact state of the graph node it represents", () => {
    // The states in this file are hand-authored, so without this they could be
    // upgraded and every other test would still pass.
    //
    // Binding is by explicit `nodeId`, not by shared sources. `src.mlops.repo`
    // backs both `ev.mlops.project` (PUBLIC_CODE_VERIFIED) and
    // `ev.mlops.runtime-lab` (PORTFOLIO_EXTENSION), so a source-overlap rule is
    // ambiguous: taking the strongest backing node lets the lab be promoted to
    // code-verified, and taking the weakest wrongly demotes the repo surface.
    // Exact equality against the declared node is the only unambiguous rule.
    const nodeById = new Map(getGraph().nodes.map((node) => [node.id, node]));
    const components = MLOPS_XRAY_LAYERS.flatMap((layer) => layer.components);
    expect(components).toHaveLength(7);

    for (const component of components) {
      const node = nodeById.get(component.nodeId);
      expect(
        node,
        `${component.id} cites unknown node ${component.nodeId}`,
      ).toBeDefined();
      expect(
        component.evidenceState,
        `${component.id} claims ${component.evidenceState} but ${component.nodeId} is ${node!.state}`,
      ).toBe(node!.state);
    }
  });

  it("keeps the boundary component at the weakest state in the layer set", () => {
    // Guards the specific upgrade that matters: the browser lab quietly
    // becoming code-verified. Asserted on its own so the intent survives even
    // if the corpus grows.
    const lab = findXrayComponent(MLOPS_XRAY_LAYERS, "cmp.mlops.runtime-lab");
    expect(lab?.evidenceState).toBe("PORTFOLIO_EXTENSION");

    const others = MLOPS_XRAY_LAYERS.flatMap((layer) => layer.components).filter(
      (component) => component.id !== "cmp.mlops.runtime-lab",
    );
    for (const component of others) {
      expect(
        EVIDENCE_STRENGTH[component.evidenceState],
        `${component.id} should not be weaker than the honesty boundary`,
      ).toBeLessThan(EVIDENCE_STRENGTH.PORTFOLIO_EXTENSION);
    }
  });

  it("declares a node whose sources overlap the component's own", () => {
    // Stops a component being pointed at a conveniently-stated but unrelated
    // node to satisfy the binding above.
    const nodeById = new Map(getGraph().nodes.map((node) => [node.id, node]));

    for (const layer of MLOPS_XRAY_LAYERS) {
      for (const component of layer.components) {
        const node = nodeById.get(component.nodeId)!;
        const shared = node.sourceIds.filter((id) => component.sourceIds.includes(id));
        expect(
          shared.length,
          `${component.id} and ${component.nodeId} cite no source in common`,
        ).toBeGreaterThan(0);
      }
    }
  });
});
