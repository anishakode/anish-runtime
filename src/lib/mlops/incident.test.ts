import { describe, expect, it } from "vitest";
import { breakTheSystem, createIncidentRun, recoverIncident } from "./incident";

describe("mlops incident (M7)", () => {
  it("BREAK THE SYSTEM shifts data, enters incident, and builds a labeled debug path", () => {
    const idle = createIncidentRun(42, 200);
    const broken = breakTheSystem(idle);
    expect(broken.phase).toBe("investigating");
    expect(broken.monitor).toBe("incident");
    expect(broken.session.action).toBe("shift");
    expect(broken.session.metrics.psi!).toBeGreaterThan(idle.session.metrics.psi!);
    expect(broken.alertFired).toBe(true);
    expect(broken.trace.some((e) => e.kind === "simulated_notify")).toBe(true);
    expect(broken.trace.some((e) => e.title === "BREAK THE SYSTEM")).toBe(true);
    expect(broken.debugSteps.length).toBeGreaterThanOrEqual(5);
    expect(broken.debugSteps.some((s) => s.kind === "code_verified")).toBe(true);
    expect(JSON.stringify(broken.trace)).not.toMatch(/slack\.com|mailto:/i);
  });

  it("RECOVER resets distributions and returns monitor to healthy", () => {
    const broken = breakTheSystem(createIncidentRun(7, 120));
    const recovered = recoverIncident(broken);
    expect(recovered.phase).toBe("recovered");
    expect(recovered.monitor).toBe("healthy");
    expect(recovered.session.action).toBe("baseline");
    expect(recovered.session.metrics.missingness.rate).toBe(0);
    expect(recovered.trace.at(-1)?.title).toMatch(/Recovery complete/i);
  });

  it("is deterministic for the same seed", () => {
    const a = breakTheSystem(createIncidentRun(99, 80));
    const b = breakTheSystem(createIncidentRun(99, 80));
    expect(a.session.metrics.psi).toBe(b.session.metrics.psi);
    expect(a.debugSteps.map((s) => s.id)).toEqual(b.debugSteps.map((s) => s.id));
  });
});
