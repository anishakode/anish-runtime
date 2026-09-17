import { describe, expect, it } from "vitest";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";
import {
  COMPILATION_STEPS,
  DEFAULT_JOURNEY,
  JOURNEY_OPTIONS,
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
    expect(stepDurationMs("20s")).toBeGreaterThan(0);
  });

  it("offers exactly two presets, and they differ in more than pacing", () => {
    expect(JOURNEY_OPTIONS.map((o) => o.id)).toEqual(["20s", "2min"]);

    // The guard this file previously lacked: a third preset was carried for
    // three milestones whose settled layout was identical to 2 MIN. Two presets
    // that agree on every layout field are one preset with two labels.
    const plans = JOURNEY_OPTIONS.map((o) => settledJourneyPlan(o.id));
    const shapes = plans.map((p) =>
      [p.flagshipLimit, p.showConstellation, p.primaryHref, p.primaryLabel].join("|"),
    );
    expect(new Set(shapes).size).toBe(JOURNEY_OPTIONS.length);
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
