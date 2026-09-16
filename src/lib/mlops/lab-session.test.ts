import { describe, expect, it } from "vitest";
import {
  createLabSession,
  histogramTableRows,
  injectLabMissing,
  resetLabSession,
  shiftLabData,
} from "./lab-session";

describe("mlops lab session (M6)", () => {
  it("creates a reproducible baseline session", () => {
    const a = createLabSession(42, 100);
    const b = createLabSession(42, 100);
    expect(a.reference).toEqual(b.reference);
    expect(a.current).toEqual(b.current);
    expect(a.action).toBe("baseline");
    expect(a.evidenceState).toBe("PORTFOLIO_EXTENSION");
    expect(a.boundaryNotice).toMatch(/Not the exact historical production runtime/i);
    expect(a.metrics.psiSeverity).toBe("low");
  });

  it("SHIFT DATA raises drift metrics vs baseline", () => {
    const baseline = createLabSession(11, 300);
    const shifted = shiftLabData(baseline);
    expect(shifted.action).toBe("shift");
    expect(shifted.metrics.psi!).toBeGreaterThan(baseline.metrics.psi!);
    expect(shifted.metrics.ksD!).toBeGreaterThan(baseline.metrics.ksD!);
  });

  it("INJECT MISSING increases missingness and RESET restores baseline", () => {
    const baseline = createLabSession(5, 80);
    const missing = injectLabMissing(baseline, 0.4);
    expect(missing.action).toBe("missing");
    expect(missing.metrics.missingness.rate).toBeCloseTo(0.4);
    const reset = resetLabSession(missing);
    expect(reset.action).toBe("baseline");
    expect(reset.metrics.missingness.rate).toBe(0);
    expect(reset.reference).toEqual(baseline.reference);
  });

  it("histogram table exposes every reference bin for a11y", () => {
    const session = createLabSession(1, 50);
    const rows = histogramTableRows(session);
    expect(rows).toHaveLength(session.referenceHistogram.bins.length);
    // Seeded, so the exact counts are knowable. `expect.any(Number)` here would
    // have survived the histogram binning bug M26 found.
    expect(rows.map((row) => [row.index, row.referenceCount, row.currentCount])).toEqual([
      [0, 1, 1],
      [1, 1, 1],
      [2, 1, 1],
      [3, 10, 10],
      [4, 4, 4],
      [5, 9, 9],
      [6, 8, 8],
      [7, 10, 10],
      [8, 3, 3],
      [9, 3, 3],
    ]);
    // A fresh session has not drifted, so reference and current must agree bin
    // for bin, and the counts must account for every sample.
    expect(rows.reduce((sum, row) => sum + row.referenceCount, 0)).toBe(50);
    expect(rows.reduce((sum, row) => sum + row.currentCount, 0)).toBe(50);
  });

  it("rejects invalid session inputs", () => {
    expect(() => createLabSession(1, 1)).toThrow(/count/);
    const session = createLabSession(1, 20);
    expect(() => injectLabMissing(session, 2)).toThrow(/rate/);
  });
});
