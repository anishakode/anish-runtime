import { describe, expect, it } from "vitest";
import { buildHistogram, histogramWithEdges } from "./histogram";
import { populationStabilityIndex, classifyPsi } from "./psi";
import { ksDStat, ksSeverity } from "./ks";

describe("mlops PSI (M5) — aligned with drift.py", () => {
  it("returns ~0 for identical distributions", () => {
    const counts = [10, 20, 30, 40];
    expect(populationStabilityIndex(counts, counts)).toBeCloseTo(0, 12);
    expect(classifyPsi(0).severity).toBe("low");
  });

  it("detects major drift for heavily shifted bins", () => {
    const expected = [40, 40, 10, 10];
    const actual = [5, 5, 45, 45];
    const psi = populationStabilityIndex(expected, actual);
    expect(psi).toBeGreaterThan(0.25);
    expect(classifyPsi(psi)).toEqual({
      severity: "high",
      message: "Major drift detected",
    });
  });

  it("rejects mismatched lengths and empty vectors", () => {
    expect(() => populationStabilityIndex([1], [1, 2])).toThrow(/same length/);
    expect(() => populationStabilityIndex([], [])).toThrow(/empty/);
  });

  it("classifies medium band at 0.10 threshold", () => {
    expect(classifyPsi(0.1).severity).toBe("medium");
    expect(classifyPsi(0.249).severity).toBe("medium");
    expect(classifyPsi(0.25).severity).toBe("high");
  });
});

describe("mlops KS (M5) — aligned with stats.py", () => {
  it("matches pinned stats.py tie-break behavior on identical samples", () => {
    const sample = [1, 2, 3, 4, 5];
    // Source advances A on ties → D = 1/n for identical length-n samples.
    expect(ksDStat(sample, sample)).toBeCloseTo(0.2, 12);
    expect(ksSeverity(0)).toBe("low");
  });

  it("grows when distributions separate", () => {
    const a = [0, 0.1, 0.2, 0.3, 0.4];
    const b = [10, 10.1, 10.2, 10.3, 10.4];
    const d = ksDStat(a, b);
    expect(d).toBeGreaterThan(0.2);
    expect(ksSeverity(d)).toBe("high");
  });

  it("rejects empty samples", () => {
    expect(() => ksDStat([], [1])).toThrow(/non-empty/);
    expect(() => ksDStat([1], [])).toThrow(/non-empty/);
  });
});

describe("mlops histogram (M5)", () => {
  it("bins values and preserves total", () => {
    const hist = buildHistogram([0, 1, 2, 3, 4, 5], 3, 0, 6);
    expect(hist.total).toBe(6);
    expect(hist.bins).toHaveLength(3);
    expect(hist.bins.reduce((s, b) => s + b.count, 0)).toBe(6);
  });

  it("aligns current counts to reference edges for PSI", () => {
    const ref = buildHistogram([0, 1, 2, 3, 4], 5, 0, 5);
    const cur = histogramWithEdges([0, 0, 4, 4], ref.edges);
    const psi = populationStabilityIndex(
      ref.bins.map((b) => b.count),
      cur.bins.map((b) => b.count),
    );
    expect(psi).toBeGreaterThan(0);
  });

  it("rejects invalid binCount", () => {
    expect(() => buildHistogram([1], 0)).toThrow(/binCount/);
  });

  it("clamps out-of-range values to the nearest edge, in both directions", () => {
    const edges = [-3, -1.8, -0.6, 0.6, 1.8, 3];

    // Below the reference floor belongs in the first bin. Putting it in the
    // last bin would report drift in the opposite direction to reality.
    expect(histogramWithEdges([-99], edges).bins.map((b) => b.count)).toEqual([
      1, 0, 0, 0, 0,
    ]);
    expect(histogramWithEdges([99], edges).bins.map((b) => b.count)).toEqual([
      0, 0, 0, 0, 1,
    ]);
    expect(histogramWithEdges([-99, 99], edges).bins.map((b) => b.count)).toEqual([
      1, 0, 0, 0, 1,
    ]);
  });

  it("bins identically to buildHistogram over the same edges", () => {
    // The two binning paths must not disagree: PSI compares a reference built
    // by one against a current built by the other.
    const values = [-5, -3, -1.2, 0, 0.6, 2.9, 3, 7];
    const reference = buildHistogram(values, 5, -3, 3);
    const aligned = histogramWithEdges(values, reference.edges);
    expect(aligned.bins.map((b) => b.count)).toEqual(reference.bins.map((b) => b.count));
  });

  it("puts an edge value in the bin it opens, not the one it closes", () => {
    const edges = [0, 1, 2];
    expect(histogramWithEdges([0], edges).bins.map((b) => b.count)).toEqual([1, 0]);
    expect(histogramWithEdges([1], edges).bins.map((b) => b.count)).toEqual([0, 1]);
    // The top edge is inclusive only because there is no bin above it.
    expect(histogramWithEdges([2], edges).bins.map((b) => b.count)).toEqual([0, 1]);
  });
});
