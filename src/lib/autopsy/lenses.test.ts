import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import {
  AUTOPSY_LENS_IDS,
  DEFAULT_AUTOPSY_LENS,
  autopsyLensFromHash,
  parseAutopsyLensId,
} from "./lenses";
import { buildMlopsAutopsyBundle } from "./mlops-bundle";

describe("autopsy lenses (M10)", () => {
  it("defines the six handoff lenses with STORY as default", () => {
    expect([...AUTOPSY_LENS_IDS]).toEqual([
      "story",
      "run",
      "xray",
      "decisions",
      "failures",
      "evidence",
    ]);
    expect(DEFAULT_AUTOPSY_LENS).toBe("story");
  });

  it("parses lens ids and falls back on invalid input", () => {
    expect(parseAutopsyLensId("xray")).toBe("xray");
    expect(parseAutopsyLensId("nope")).toBe("story");
    expect(parseAutopsyLensId(null, "evidence")).toBe("evidence");
  });

  it("maps deep-link hashes to lenses (X-Ray / architecture open X-RAY)", () => {
    expect(autopsyLensFromHash("#project-autopsy")).toBeNull();
    expect(autopsyLensFromHash("#project-xray")).toBe("xray");
    expect(autopsyLensFromHash("#reversible-architecture")).toBe("xray");
    expect(autopsyLensFromHash("#steward-lab")).toBe("run");
    expect(autopsyLensFromHash("#malware-lab")).toBe("run");
    expect(autopsyLensFromHash("autopsy-panel-failures")).toBe("failures");
    expect(autopsyLensFromHash("#not-a-lens")).toBeNull();
  });

  it("builds MLOps story/decisions from the Evidence Graph only", () => {
    const bundle = buildMlopsAutopsyBundle(getGraph());
    expect(bundle.story.title).toBe("MLOps Governance Dashboard");
    expect(bundle.story.themes).toContain("PSI");
    expect(bundle.decisions.length).toBeGreaterThanOrEqual(3);
    for (const decision of bundle.decisions) {
      expect(decision.sources.length).toBeGreaterThan(0);
      for (const source of decision.sources) {
        expect(getGraph().sources.some((s) => s.id === source.id)).toBe(true);
      }
    }
  });

  it("pins every decision state, so none can be upgraded silently", () => {
    // These states are hand-authored and render straight into a badge. The
    // Steward and malware bundles pin theirs; MLOps was the omission.
    const bundle = buildMlopsAutopsyBundle(getGraph());

    expect(
      bundle.decisions.map((decision) => [decision.id, decision.evidenceState]),
    ).toEqual([
      // Both detectors exist in the pinned public source files.
      ["dec.mlops.dual-detectors", "PUBLIC_CODE_VERIFIED"],
      ["dec.mlops.audit-policy-split", "PUBLIC_CODE_VERIFIED"],
      // The browser lab is not the production runtime, and must never claim to be.
      ["dec.mlops.lab-boundary", "PORTFOLIO_EXTENSION"],
    ]);
  });

  it("keeps FAILURES empty and NOT_DEMONSTRATED (no fabricated exhibits)", () => {
    const bundle = buildMlopsAutopsyBundle(getGraph());
    expect(bundle.failures.empty).toBe(true);
    expect(bundle.failures.state).toBe("NOT_DEMONSTRATED");
    expect(bundle.failures.summary).toMatch(/Empty truthful museum/i);
    expect(bundle.failures.summary).not.toMatch(/outage theatre|invented failure/i);
  });
});
