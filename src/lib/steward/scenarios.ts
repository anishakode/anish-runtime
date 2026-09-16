/**
 * Deterministic Steward Agent Lab scenarios (M12).
 * Synthetic context + tool-state inspection — never live clinical systems.
 */

import {
  STEWARD_BOUNDARY_NOTICE,
  STEWARD_LAB_EVIDENCE_STATE,
  STEWARD_SOURCE_TRACE,
} from "./evidence";

export const STEWARD_SCENARIO_IDS = [
  "baseline",
  "remove_renal_context",
  "allergy_conflict",
  "invalid_tool_input",
] as const;

export type StewardScenarioId = (typeof STEWARD_SCENARIO_IDS)[number];

export const STEWARD_SCENARIO_LABEL: Record<StewardScenarioId, string> = {
  baseline: "Baseline (complete context)",
  remove_renal_context: "Remove renal context",
  allergy_conflict: "Allergy conflict",
  invalid_tool_input: "Invalid tool input",
};

export type StewardToolState = "complete" | "warning" | "blocked" | "error";

export const STEWARD_TOOL_STATE_LABEL: Record<StewardToolState, string> = {
  complete: "complete",
  warning: "warning",
  blocked: "blocked",
  error: "error",
};

export type StewardToolStep = {
  id: string;
  toolName: string;
  state: StewardToolState;
  detail: string;
};

export type StewardSyntheticContext = {
  patientLabel: string;
  activeAntibiotics: boolean;
  cultureResults: boolean;
  allergies: boolean;
  renalFunction: boolean;
  notes: string[];
};

export type StewardTaskPreview = {
  resourceType: "Task";
  status: "draft";
  intent: "order";
  description: string;
  note: string;
};

export type StewardScenarioResult = {
  scenarioId: StewardScenarioId;
  label: string;
  context: StewardSyntheticContext;
  tools: StewardToolStep[];
  outcomeSummary: string;
  withholdsTreatmentAdvice: true;
  taskPreview: StewardTaskPreview | null;
  evidenceState: typeof STEWARD_LAB_EVIDENCE_STATE;
  boundaryNotice: typeof STEWARD_BOUNDARY_NOTICE;
  sourceTrace: typeof STEWARD_SOURCE_TRACE;
};

function isScenarioId(value: string): value is StewardScenarioId {
  return (STEWARD_SCENARIO_IDS as readonly string[]).includes(value);
}

export function parseStewardScenarioId(
  value: string | null | undefined,
  fallback: StewardScenarioId = "baseline",
): StewardScenarioId {
  if (value && isScenarioId(value)) return value;
  return fallback;
}

/**
 * Pure deterministic scenario runner. Same input → same tool states + outcome.
 */
export function runStewardScenario(scenarioId: StewardScenarioId): StewardScenarioResult {
  const label = STEWARD_SCENARIO_LABEL[scenarioId];

  if (scenarioId === "baseline") {
    return {
      scenarioId,
      label,
      context: {
        patientLabel: "Synthetic patient A (demo bundle shaped)",
        activeAntibiotics: true,
        cultureResults: true,
        allergies: true,
        renalFunction: true,
        notes: ["All inspectable context fields present for the baseline path."],
      },
      tools: [
        {
          id: "tool.active-abx",
          toolName: "get_active_antibiotics",
          state: "complete",
          detail: "Synthetic active antibiotic list loaded for inspection.",
        },
        {
          id: "tool.cultures",
          toolName: "get_culture_results",
          state: "complete",
          detail: "Synthetic culture / sensitivity profile loaded.",
        },
        {
          id: "tool.allergies",
          toolName: "check_patient_allergies",
          state: "complete",
          detail: "Allergy cross-check ran on synthetic records.",
        },
        {
          id: "tool.renal",
          toolName: "get_renal_function",
          state: "complete",
          detail: "Synthetic renal labs present for dose-context inspection.",
        },
        {
          id: "tool.recommend",
          toolName: "generate_stewardship_recommendation",
          state: "blocked",
          detail:
            "Recommendation generation intentionally blocked — this lab withholds treatment advice.",
        },
        {
          id: "tool.task",
          toolName: "create_stewardship_task",
          state: "complete",
          detail: "Dry-run FHIR Task preview only — nothing is posted to a server.",
        },
      ],
      outcomeSummary:
        "Baseline path proves tool orchestration with complete synthetic context. Treatment advice is withheld; Task remains a dry-run preview.",
      withholdsTreatmentAdvice: true,
      taskPreview: {
        resourceType: "Task",
        status: "draft",
        intent: "order",
        description:
          "DRY-RUN preview: stewardship documentation task would be drafted here.",
        note: "Not sent to any FHIR endpoint. Portfolio simulation only.",
      },
      evidenceState: STEWARD_LAB_EVIDENCE_STATE,
      boundaryNotice: STEWARD_BOUNDARY_NOTICE,
      sourceTrace: STEWARD_SOURCE_TRACE,
    };
  }

  if (scenarioId === "remove_renal_context") {
    return {
      scenarioId,
      label,
      context: {
        patientLabel: "Synthetic patient B (renal omitted)",
        activeAntibiotics: true,
        cultureResults: true,
        allergies: true,
        renalFunction: false,
        notes: ["Renal function intentionally removed to show missing-context handling."],
      },
      tools: [
        {
          id: "tool.active-abx",
          toolName: "get_active_antibiotics",
          state: "complete",
          detail: "Synthetic active antibiotic list loaded.",
        },
        {
          id: "tool.cultures",
          toolName: "get_culture_results",
          state: "complete",
          detail: "Synthetic culture profile loaded.",
        },
        {
          id: "tool.allergies",
          toolName: "check_patient_allergies",
          state: "complete",
          detail: "Allergy cross-check ran.",
        },
        {
          id: "tool.renal",
          toolName: "get_renal_function",
          state: "warning",
          detail: "Renal context missing — dose-sensitive paths cannot be completed.",
        },
        {
          id: "tool.recommend",
          toolName: "generate_stewardship_recommendation",
          state: "blocked",
          detail:
            "Blocked: incomplete renal context + treatment advice withheld by policy.",
        },
        {
          id: "tool.task",
          toolName: "create_stewardship_task",
          state: "blocked",
          detail: "Task preview suppressed while recommendation remains blocked.",
        },
      ],
      outcomeSummary:
        "Missing renal context surfaces as a warning and blocks recommendation/task paths. No treatment advice is produced.",
      withholdsTreatmentAdvice: true,
      taskPreview: null,
      evidenceState: STEWARD_LAB_EVIDENCE_STATE,
      boundaryNotice: STEWARD_BOUNDARY_NOTICE,
      sourceTrace: STEWARD_SOURCE_TRACE,
    };
  }

  if (scenarioId === "allergy_conflict") {
    return {
      scenarioId,
      label,
      context: {
        patientLabel: "Synthetic patient C (allergy conflict)",
        activeAntibiotics: true,
        cultureResults: true,
        allergies: true,
        renalFunction: true,
        notes: [
          "Allergy flag conflicts with a class that a naive de-escalation might prefer.",
        ],
      },
      tools: [
        {
          id: "tool.active-abx",
          toolName: "get_active_antibiotics",
          state: "complete",
          detail: "Synthetic active antibiotic list loaded.",
        },
        {
          id: "tool.cultures",
          toolName: "get_culture_results",
          state: "complete",
          detail: "Synthetic culture profile loaded.",
        },
        {
          id: "tool.allergies",
          toolName: "check_patient_allergies",
          state: "warning",
          detail:
            "Allergy conflict flagged against a candidate class — requires human review.",
        },
        {
          id: "tool.renal",
          toolName: "get_renal_function",
          state: "complete",
          detail: "Synthetic renal labs present.",
        },
        {
          id: "tool.recommend",
          toolName: "generate_stewardship_recommendation",
          state: "blocked",
          detail:
            "Blocked: allergy conflict + lab policy withholds treatment advice entirely.",
        },
        {
          id: "tool.task",
          toolName: "create_stewardship_task",
          state: "blocked",
          detail: "No dry-run Task while recommendation is blocked.",
        },
      ],
      outcomeSummary:
        "Allergy conflict is visible as a warning and blocks automated recommendation. Clinician judgment is not replaced.",
      withholdsTreatmentAdvice: true,
      taskPreview: null,
      evidenceState: STEWARD_LAB_EVIDENCE_STATE,
      boundaryNotice: STEWARD_BOUNDARY_NOTICE,
      sourceTrace: STEWARD_SOURCE_TRACE,
    };
  }

  // invalid_tool_input
  return {
    scenarioId,
    label,
    context: {
      patientLabel: "Synthetic patient D (invalid input)",
      activeAntibiotics: true,
      cultureResults: false,
      allergies: true,
      renalFunction: true,
      notes: ["Malformed synthetic patient_id / tool argument injected on purpose."],
    },
    tools: [
      {
        id: "tool.active-abx",
        toolName: "get_active_antibiotics",
        state: "error",
        detail: "Invalid tool input rejected — no FHIR call attempted.",
      },
      {
        id: "tool.cultures",
        toolName: "get_culture_results",
        state: "error",
        detail: "Upstream input invalid; culture fetch aborted.",
      },
      {
        id: "tool.allergies",
        toolName: "check_patient_allergies",
        state: "blocked",
        detail: "Skipped after invalid input error.",
      },
      {
        id: "tool.renal",
        toolName: "get_renal_function",
        state: "blocked",
        detail: "Skipped after invalid input error.",
      },
      {
        id: "tool.recommend",
        toolName: "generate_stewardship_recommendation",
        state: "blocked",
        detail: "Blocked: invalid input path — no recommendation, no advice.",
      },
      {
        id: "tool.task",
        toolName: "create_stewardship_task",
        state: "blocked",
        detail: "No Task preview on error paths.",
      },
    ],
    outcomeSummary:
      "Invalid tool input fails closed with explicit error states. No live network call and no treatment advice.",
    withholdsTreatmentAdvice: true,
    taskPreview: null,
    evidenceState: STEWARD_LAB_EVIDENCE_STATE,
    boundaryNotice: STEWARD_BOUNDARY_NOTICE,
    sourceTrace: STEWARD_SOURCE_TRACE,
  };
}

export function toolStateCounts(
  result: StewardScenarioResult,
): Record<StewardToolState, number> {
  const counts: Record<StewardToolState, number> = {
    complete: 0,
    warning: 0,
    blocked: 0,
    error: 0,
  };
  for (const tool of result.tools) {
    counts[tool.state] += 1;
  }
  return counts;
}
