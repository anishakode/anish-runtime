import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { buildStewardAutopsyBundle } from "./steward-bundle";

describe("steward autopsy bundle (M12)", () => {
  it("builds story/decisions from the Evidence Graph only", () => {
    const bundle = buildStewardAutopsyBundle(getGraph());
    expect(bundle.projectSlug).toBe("steward-ai");
    expect(bundle.story.title).toBe("Steward_AI");
    expect(bundle.decisions.map((d) => d.id)).toEqual([
      "dec.steward.mcp-tools",
      "dec.steward.safety-boundary",
      "dec.steward.lab-boundary",
    ]);
    for (const decision of bundle.decisions) {
      expect(decision.sources.length).toBeGreaterThan(0);
      expect(decision.sources.every((s) => s.id.startsWith("src."))).toBe(true);
    }
  });

  it("keeps FAILURES empty and NOT_DEMONSTRATED", () => {
    const bundle = buildStewardAutopsyBundle(getGraph());
    expect(bundle.failures.empty).toBe(true);
    expect(bundle.failures.state).toBe("NOT_DEMONSTRATED");
  });

  it("includes PORTFOLIO_EXTENSION lab-boundary decision", () => {
    const bundle = buildStewardAutopsyBundle(getGraph());
    const lab = bundle.decisions.find((d) => d.id === "dec.steward.lab-boundary");
    expect(lab?.evidenceState).toBe("PORTFOLIO_EXTENSION");
  });
});
