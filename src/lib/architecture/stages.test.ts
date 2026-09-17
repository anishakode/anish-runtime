import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { buildMlopsArchitectureViews } from "./build-views";
import {
  ARCHITECTURE_STAGE_COUNT,
  clampArchitectureIndex,
  MLOPS_ARCHITECTURE_STAGES,
  nextArchitectureIndex,
  previousArchitectureIndex,
  revealedArchitectureStages,
} from "./stages";

describe("architecture stages (M9)", () => {
  it("defines exactly five ordered handoff stages", () => {
    expect(ARCHITECTURE_STAGE_COUNT).toBe(5);
    expect(MLOPS_ARCHITECTURE_STAGES.map((s) => s.id)).toEqual([
      "system-boundary",
      "lifecycle-context",
      "observability",
      "detection",
      "governance-loop",
    ]);
    expect(MLOPS_ARCHITECTURE_STAGES.every((s, i) => s.index === i)).toBe(true);
  });

  it("clamps scrubber indices and supports prev/next bounds", () => {
    expect(clampArchitectureIndex(-3)).toBe(0);
    expect(clampArchitectureIndex(99)).toBe(4);
    expect(clampArchitectureIndex(2.9)).toBe(2);
    expect(previousArchitectureIndex(0)).toBe(0);
    expect(nextArchitectureIndex(4)).toBe(4);
    expect(nextArchitectureIndex(1)).toBe(2);
    expect(previousArchitectureIndex(1)).toBe(0);
  });

  it("reveals stages cumulatively", () => {
    expect(
      revealedArchitectureStages(MLOPS_ARCHITECTURE_STAGES, 0).map((s) => s.id),
    ).toEqual(["system-boundary"]);
    expect(
      revealedArchitectureStages(MLOPS_ARCHITECTURE_STAGES, 2).map((s) => s.id),
    ).toEqual(["system-boundary", "lifecycle-context", "observability"]);
    expect(revealedArchitectureStages(MLOPS_ARCHITECTURE_STAGES, 4)).toHaveLength(5);
    // Out-of-range clamps rather than returning a short or empty list — the
    // scrubber shares this exact call, so a regression here reaches the UI.
    expect(revealedArchitectureStages(MLOPS_ARCHITECTURE_STAGES, 99)).toHaveLength(5);
    expect(
      revealedArchitectureStages(MLOPS_ARCHITECTURE_STAGES, -3).map((s) => s.id),
    ).toEqual(["system-boundary"]);
  });

  it("builds views whose sources exist in the Evidence Graph", () => {
    const graph = getGraph();
    const views = buildMlopsArchitectureViews(graph);
    expect(views).toHaveLength(5);
    for (const view of views) {
      expect(view.sources.length).toBeGreaterThan(0);
      for (const source of view.sources) {
        expect(graph.sources.some((s) => s.id === source.id)).toBe(true);
      }
    }
    const detection = views.find((v) => v.id === "detection");
    expect(detection?.sources.map((s) => s.path)).toEqual(
      expect.arrayContaining([
        "backend/app/utils/drift.py",
        "backend/app/utils/stats.py",
      ]),
    );
    const governance = views.find((v) => v.id === "governance-loop");
    expect(governance?.sources.some((s) => s.path?.includes("audit_sink.py"))).toBe(true);
    expect(governance?.sources.some((s) => s.path?.includes("policy.py"))).toBe(true);
  });

  it("keeps system-boundary as portfolio simulation with PORTFOLIO_EXTENSION framing", () => {
    const boundary = MLOPS_ARCHITECTURE_STAGES[0]!;
    expect(boundary.reality).toBe("PORTFOLIO_SIMULATION");
    expect(boundary.summary).toMatch(/PORTFOLIO_EXTENSION|not the exact historical/i);
  });

  it("does not invent Grafana or production telemetry copy", () => {
    const text = MLOPS_ARCHITECTURE_STAGES.map((s) => s.summary).join(" ");
    expect(text).toMatch(/does not invent Grafana/i);
    expect(text).not.toMatch(/\buptime\b|\bfps\b/i);
  });

  it("only calls a stage code-verified when every node it cites is", () => {
    // `reality` is hand-authored per stage. Bind it to the corpus so a stage
    // cannot be promoted from simulation to code-verified without the nodes
    // behind it actually being code-verified.
    const nodeById = new Map(getGraph().nodes.map((node) => [node.id, node]));

    for (const stage of MLOPS_ARCHITECTURE_STAGES) {
      expect(stage.nodeIds.length, `${stage.id} cites no nodes`).toBeGreaterThan(0);

      const states = stage.nodeIds.map((id) => {
        const node = nodeById.get(id);
        expect(node, `${stage.id} cites unknown node ${id}`).toBeDefined();
        return node!.state;
      });

      if (stage.reality === "PUBLIC_CODE_VERIFIED") {
        expect(states, `${stage.id} claims PUBLIC_CODE_VERIFIED`).toEqual(
          states.map(() => "PUBLIC_CODE_VERIFIED"),
        );
      }
    }
  });
});
