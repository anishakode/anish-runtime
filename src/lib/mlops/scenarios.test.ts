import { describe, expect, it } from "vitest";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";
import { missingnessRate, rangeQuality } from "./quality";
import { transitionMonitor } from "./state-machine";
import { createAlertCooldown, canFireAlert, tryFireAlert } from "./alert";
import { runScenario } from "./scenarios";
import {
  MLOPS_BOUNDARY_NOTICE,
  MLOPS_LAB_EVIDENCE_STATE,
  MLOPS_SOURCE_TRACE,
} from "./evidence";

describe("mlops quality (M5)", () => {
  it("computes missingness including NaN", () => {
    expect(missingnessRate([1, null, undefined, Number.NaN, 2])).toEqual({
      total: 5,
      missing: 3,
      rate: 0.6,
    });
    expect(missingnessRate([])).toEqual({ total: 0, missing: 0, rate: 0 });
  });

  it("measures range quality and rejects inverted bounds", () => {
    const report = rangeQuality([0, 1, 2, 9], 0, 2);
    expect(report.inRange).toBe(3);
    expect(report.outOfRange).toBe(1);
    expect(report.rateInRange).toBeCloseTo(0.75);
    expect(() => rangeQuality([1], 5, 1)).toThrow(/min must be/);
  });
});

describe("mlops state machine (M5)", () => {
  it("routes medium drift to watching and high drift to detected", () => {
    expect(
      transitionMonitor("healthy", { type: "observe_drift", severity: "medium" }),
    ).toBe("watching");
    expect(
      transitionMonitor("healthy", { type: "observe_drift", severity: "high" }),
    ).toBe("drift_detected");
  });

  it("supports incident → recovering → healthy", () => {
    let state = transitionMonitor("drift_detected", { type: "raise_incident" });
    expect(state).toBe("incident");
    state = transitionMonitor(state, { type: "begin_recovery" });
    expect(state).toBe("recovering");
    state = transitionMonitor(state, { type: "recover_ok" });
    expect(state).toBe("healthy");
  });

  it("rejects illegal transitions", () => {
    expect(() => transitionMonitor("healthy", { type: "raise_incident" })).toThrow(
      /invalid raise_incident/,
    );
  });
});

describe("mlops alert cooldown (M5)", () => {
  it("fires then suppresses until cooldown elapses", () => {
    let state = createAlertCooldown(5);
    const first = tryFireAlert(state, 0);
    expect(first.fired).toBe(true);
    expect(first.reason).toBe("simulated_alert_recorded");
    state = first.state;
    expect(canFireAlert(state, 3)).toBe(false);
    const blocked = tryFireAlert(state, 3);
    expect(blocked.fired).toBe(false);
    expect(blocked.reason).toBe("cooldown_active");
    const later = tryFireAlert(state, 5);
    expect(later.fired).toBe(true);
  });

  it("rejects negative cooldown", () => {
    expect(() => createAlertCooldown(-1)).toThrow(/cooldownTicks/);
  });
});

describe("mlops scenarios (M5)", () => {
  it("labels every scenario as PORTFOLIO_EXTENSION with boundary notice", () => {
    const result = runScenario({ kind: "baseline", seed: 1 });
    expect(result.evidenceState).toBe(MLOPS_LAB_EVIDENCE_STATE);
    expect(result.boundaryNotice).toBe(MLOPS_BOUNDARY_NOTICE);
    expect(result.boundaryNotice).toMatch(/Not the exact historical production runtime/i);
  });

  it("is deterministic for the same seed and kind", () => {
    const a = runScenario({ kind: "drift", seed: 99, count: 80 });
    const b = runScenario({ kind: "drift", seed: 99, count: 80 });
    expect(a.psi).toBe(b.psi);
    expect(a.ksD).toBe(b.ksD);
    expect(a.reference).toEqual(b.reference);
  });

  it("baseline stays low severity while drift elevates metrics", () => {
    const baseline = runScenario({ kind: "baseline", seed: 11, count: 300 });
    const drift = runScenario({ kind: "drift", seed: 11, count: 300, shift: 0.5 });
    expect(baseline.psiSeverity).toBe("low");
    expect(baseline.ksSeverity).toBe("low");
    expect(drift.psi!).toBeGreaterThan(baseline.psi!);
    expect(drift.ksD!).toBeGreaterThan(baseline.ksD!);
  });

  it("missing scenario raises missingness; range scenario drops in-range rate", () => {
    const missing = runScenario({
      kind: "missing",
      seed: 3,
      count: 100,
      missingRate: 0.4,
    });
    expect(missing.missingness.rate).toBeCloseTo(0.4);
    const range = runScenario({ kind: "range", seed: 3, count: 70 });
    expect(range.range.rateInRange).toBeLessThan(1);
  });

  it("rejects invalid inputs", () => {
    expect(() => runScenario({ kind: "baseline", count: 1 })).toThrow(/count/);
    expect(() => runScenario({ kind: "missing", missingRate: 2 })).toThrow(/missingRate/);
  });

  it("Source Trace IDs match the Evidence Graph MLOps anchors", () => {
    expect(MLOPS_SOURCE_TRACE.psiSourcePath).toBe("backend/app/utils/drift.py");
    expect(MLOPS_SOURCE_TRACE.ksSourcePath).toBe("backend/app/utils/stats.py");
    expect(MLOPS_SOURCE_TRACE.runtimeLabNodeId).toBe("ev.mlops.runtime-lab");
    expect(MLOPS_SOURCE_TRACE.commitSha).toMatch(/^[a-f0-9]{40}$/);

    const graph = loadEvidenceGraph();
    const lab = graph.nodes.find((n) => n.id === MLOPS_SOURCE_TRACE.runtimeLabNodeId);
    expect(lab?.state).toBe("PORTFOLIO_EXTENSION");
    const psiSource = graph.sources.find((s) => s.id === MLOPS_SOURCE_TRACE.psiSourceId);
    expect(psiSource?.commitSha).toBe(MLOPS_SOURCE_TRACE.commitSha);
    expect(psiSource?.path).toBe(MLOPS_SOURCE_TRACE.psiSourcePath);
  });
});
