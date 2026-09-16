import { describe, expect, it } from "vitest";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";
import {
  COMPILATION_STEPS,
  DEFAULT_JOURNEY,
  deriveCapabilities,
  flagshipSummaries,
  journeyLabel,
  settledJourneyPlan,
  stepDurationMs,
} from "./runtime-model";

describe("home runtime model (M4)", () => {
  it("defaults journey to 2 MIN and exposes four compilation steps", () => {
    expect(DEFAULT_JOURNEY).toBe("2min");
    expect(journeyLabel("2min")).toBe("2 MIN");
    expect(COMPILATION_STEPS.map((s) => s.label)).toEqual([
      "Identity located",
      "Capabilities mapped",
      "Evidence attached",
      "Projects connected",
    ]);
  });

  it("paces compilation faster for 20 SEC than 2 MIN", () => {
    expect(stepDurationMs("20s")).toBeLessThan(stepDurationMs("2min"));
    expect(stepDurationMs("explore")).toBeGreaterThan(0);
  });

  it("differentiates settled journeys without inventing evidence", () => {
    expect(settledJourneyPlan("20s")).toMatchObject({
      flagshipLimit: 1,
      showConstellation: false,
      primaryHref: "/cv",
    });
    expect(settledJourneyPlan("2min")).toMatchObject({
      flagshipLimit: 3,
      showConstellation: true,
      primaryHref: "/work",
      primaryLabel: "View work",
    });
    expect(settledJourneyPlan("explore").primaryLabel).toBe("Browse all work");
  });

  it("derives capabilities only from graph positioning and flagship themes", () => {
    const graph = loadEvidenceGraph();
    const caps = deriveCapabilities(graph, 8);
    expect(caps.length).toBeGreaterThan(0);
    expect(caps.length).toBeLessThanOrEqual(8);
    expect(caps).toEqual(expect.arrayContaining(["AI", "ML", "Software Engineering"]));
    expect(caps.join(" ")).not.toMatch(/kubernetes|prometheus|uptime/i);
  });

  it("lists exactly the flagship projects from the graph", () => {
    const graph = loadEvidenceGraph();
    const flagships = flagshipSummaries(graph);
    expect(flagships).toHaveLength(3);
    expect(flagships.map((f) => f.slug).sort()).toEqual(
      [
        "explainable-pdf-malware-detection",
        "mlops-governance-dashboard",
        "steward-ai",
      ].sort(),
    );
  });
});
