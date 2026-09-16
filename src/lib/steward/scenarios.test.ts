import { describe, expect, it } from "vitest";
import {
  parseStewardScenarioId,
  runStewardScenario,
  STEWARD_SCENARIO_IDS,
  toolStateCounts,
} from "./scenarios";
import { STEWARD_BOUNDARY_NOTICE, STEWARD_LAB_EVIDENCE_STATE } from "./evidence";

describe("steward scenarios (M12)", () => {
  it("defines the four handoff scenarios", () => {
    expect([...STEWARD_SCENARIO_IDS]).toEqual([
      "baseline",
      "remove_renal_context",
      "allergy_conflict",
      "invalid_tool_input",
    ]);
  });

  it("parses scenario ids and falls back on invalid input", () => {
    expect(parseStewardScenarioId("allergy_conflict")).toBe("allergy_conflict");
    expect(parseStewardScenarioId("nope")).toBe("baseline");
  });

  it("keeps baseline deterministic with withheld advice and dry-run Task", () => {
    const a = runStewardScenario("baseline");
    const b = runStewardScenario("baseline");
    expect(a).toEqual(b);
    expect(a.evidenceState).toBe(STEWARD_LAB_EVIDENCE_STATE);
    expect(a.boundaryNotice).toBe(STEWARD_BOUNDARY_NOTICE);
    expect(a.withholdsTreatmentAdvice).toBe(true);
    expect(a.taskPreview?.resourceType).toBe("Task");
    expect(a.taskPreview?.status).toBe("draft");
    expect(a.outcomeSummary.toLowerCase()).not.toMatch(
      /take |prescribe |dose |mg\/|administer /,
    );
    const recommend = a.tools.find(
      (t) => t.toolName === "generate_stewardship_recommendation",
    );
    expect(recommend?.state).toBe("blocked");
  });

  it("marks missing renal context as warning and blocks recommendation", () => {
    const result = runStewardScenario("remove_renal_context");
    expect(result.context.renalFunction).toBe(false);
    expect(result.tools.find((t) => t.toolName === "get_renal_function")?.state).toBe(
      "warning",
    );
    expect(
      result.tools.find((t) => t.toolName === "generate_stewardship_recommendation")
        ?.state,
    ).toBe("blocked");
    expect(result.taskPreview).toBeNull();
  });

  it("surfaces allergy conflict as warning without treatment advice", () => {
    const result = runStewardScenario("allergy_conflict");
    expect(
      result.tools.find((t) => t.toolName === "check_patient_allergies")?.state,
    ).toBe("warning");
    expect(result.withholdsTreatmentAdvice).toBe(true);
    expect(JSON.stringify(result).toLowerCase()).not.toMatch(
      /penicillin is safe|switch to ceftriaxone|recommended dose/,
    );
  });

  it("fails closed on invalid tool input with error states", () => {
    const result = runStewardScenario("invalid_tool_input");
    const counts = toolStateCounts(result);
    // Exactly two tools error on invalid input; a soft bound would not notice
    // one of them silently starting to succeed.
    expect(counts.error).toBe(2);
    expect(result.taskPreview).toBeNull();
    expect(counts.complete).toBe(0);
  });

  it("never claims live FHIR, Gemini, or MCP runtime in boundary copy", () => {
    for (const id of STEWARD_SCENARIO_IDS) {
      const result = runStewardScenario(id);
      expect(result.boundaryNotice).toMatch(/Not medical advice/i);
      expect(result.boundaryNotice).toMatch(/No live FHIR/i);
      expect(result.boundaryNotice).not.toMatch(/production clinical system online/i);
    }
  });
});
