import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
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
});
