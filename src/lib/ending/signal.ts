/**
 * Ending Signal (M23) — reads existing session state only.
 * No third tracking system: inputs are the M19 interaction trail and the M22 bounded trace.
 */

import { RUNTIME_ACTION_LABEL, type RuntimeTraceEntry } from "@/lib/runtime-trace";
import { distinctEvents, evaluateSessionSignal } from "@/lib/session";
import type { SessionTraceEvent } from "@/lib/session";
import type { JourneyCatalog, JourneyRef } from "./catalog";

export const ENDING_HEADING = "YOUR PATH THROUGH ANISH";
export const ENDING_SESSION_DISCLAIMER = "This describes this session, not you.";
export const ENDING_UNTESTABLE_LINE = "There's one thing left you can't test here.";
export const ENDING_UNTESTABLE_ANSWER = "Working with me.";
export const ENDING_LAST_NODE = "The last unresolved node is the human.";

export const JOURNEY_DENSITIES = ["SHALLOW", "STANDARD", "DEEP"] as const;

export type JourneyDensity = (typeof JOURNEY_DENSITIES)[number];

/** Thresholds are explicit so a quiet session can never be inflated. */
export const DEEP_MIN_NODES = 6;
export const DEEP_MIN_ACTIONS = 3;
export const STANDARD_MIN_NODES = 3;

export const DENSITY_SUMMARY: Record<JourneyDensity, string> = {
  SHALLOW: "A short visit. Nothing here is padded to look like more than it was.",
  STANDARD: "A working pass through the evidence.",
  DEEP: "A thorough inspection — you ran things, not just read them.",
};

export const WHY_SIGNAL_INPUTS = [
  "Canonical evidence you opened in this tab (distinct items only)",
  "Sanitised runtime actions from the bounded trace",
  "The deterministic lean, only when one clearly led",
] as const;

export const WHY_SIGNAL_EXCLUDED = [
  "Employer identity",
  "Location inference",
  "Demographic inference",
  "Outside browsing history",
  "Raw job description text",
  "Raw Signal queries",
  "Persistent behaviour profiles",
] as const;

export type JourneyNode = JourneyRef & { reason: string; order: number };

export type JourneyAction = {
  id: string;
  label: string;
  status: string;
  detail: string | null;
};

export type JourneyThread = {
  label: string;
  share: number;
  supportingCount: number;
};

export type JourneyIntegrity = {
  canonicalNodesRepresented: number;
  sanitisedActionsRepresented: number;
  externalTrackingUsed: number;
  persistentProfilesCreated: number;
  inferredPersonalTraits: number;
  fabricatedInteractions: number;
};

export type EndingSignal = {
  density: JourneyDensity;
  densitySummary: string;
  nodes: JourneyNode[];
  actions: JourneyAction[];
  challenges: JourneyAction[];
  thread: JourneyThread | null;
  /** Non-canonical inputs that were deliberately discarded. */
  discardedRefs: string[];
  integrity: JourneyIntegrity;
  why: { inputs: readonly string[]; excluded: readonly string[] };
};

export function classifyDensity(nodeCount: number, actionCount: number): JourneyDensity {
  if (nodeCount >= DEEP_MIN_NODES && actionCount >= DEEP_MIN_ACTIONS) return "DEEP";
  if (nodeCount >= STANDARD_MIN_NODES || actionCount >= 1) return "STANDARD";
  return "SHALLOW";
}

function toAction(entry: RuntimeTraceEntry): JourneyAction {
  return {
    id: entry.id,
    label: RUNTIME_ACTION_LABEL[entry.action],
    status: entry.status,
    detail: entry.note,
  };
}

export function buildEndingSignal(
  catalog: JourneyCatalog,
  events: readonly SessionTraceEvent[],
  traceEntries: readonly RuntimeTraceEntry[],
): EndingSignal {
  const nodes: JourneyNode[] = [];
  const discardedRefs: string[] = [];

  for (const event of distinctEvents(events)) {
    const ref = catalog[event.itemId];
    if (!ref) {
      discardedRefs.push(event.itemId);
      continue;
    }
    nodes.push({ ...ref, reason: event.reason, order: nodes.length + 1 });
  }

  const challenges = traceEntries
    .filter((entry) => entry.action === "CHALLENGE_COMPLETED")
    .map(toAction);
  const actions = traceEntries
    .filter((entry) => entry.action !== "CHALLENGE_COMPLETED")
    .map(toAction);

  const signal = evaluateSessionSignal(events);
  const thread: JourneyThread | null = signal.detected
    ? {
        label: signal.leadingLabel,
        share: signal.share,
        supportingCount: signal.supportingCount,
      }
    : null;

  const actionCount = actions.length + challenges.length;
  const density = classifyDensity(nodes.length, actionCount);

  return {
    density,
    densitySummary: DENSITY_SUMMARY[density],
    nodes,
    actions,
    challenges,
    thread,
    discardedRefs,
    integrity: {
      canonicalNodesRepresented: nodes.length,
      sanitisedActionsRepresented: actionCount,
      externalTrackingUsed: 0,
      persistentProfilesCreated: 0,
      inferredPersonalTraits: 0,
      fabricatedInteractions: 0,
    },
    why: { inputs: WHY_SIGNAL_INPUTS, excluded: WHY_SIGNAL_EXCLUDED },
  };
}
