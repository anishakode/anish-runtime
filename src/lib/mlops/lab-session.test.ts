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
    expect(rows[0]).toEqual(
      expect.objectContaining({
        index: 0,
        referenceCount: expect.any(Number),
        currentCount: expect.any(Number),
      }),
    );
  });

  it("rejects invalid session inputs", () => {
    expect(() => createLabSession(1, 1)).toThrow(/count/);
    const session = createLabSession(1, 20);
    expect(() => injectLabMissing(session, 2)).toThrow(/rate/);
  });
});
