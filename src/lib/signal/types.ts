/**
 * Shared Signal types (safe for client imports — no graph/fs).
 */

import type { EvidenceState } from "@/lib/evidence/schema";
import type { ComposeStatus, ComposedView } from "./compose-types";
import type { UiPlan } from "./ui-plan-types";

export const SIGNAL_TOOL_NAMES = [
  "search_evidence",
  "fetch_evidence",
  "fetch_project",
  "fetch_sources",
  "compare_evidence",
] as const;

export type SignalToolName = (typeof SIGNAL_TOOL_NAMES)[number];

export type SignalToolResult =
  | { ok: true; tool: SignalToolName; data: unknown }
  | { ok: false; tool: SignalToolName; error: string };

export type SignalEvidenceCard = {
  id: string;
  title: string;
  kind: string;
  evidenceState: EvidenceState;
  summary: string;
  href: string;
};

export const SIGNAL_GAP_NOTICE =
  "No canonical evidence matched this request. Signal will not invent professional facts.";

export type SignalInterpretation = {
  intent: string;
  answer: string;
  evidenceIds: string[];
  evidence: SignalEvidenceCard[];
  gapNotice: string | null;
  toolTrace: SignalToolResult[];
  mode: "tool_orchestrated";
  /** Honesty: assembled from allowlisted evidence tools only — not a freeform LLM chat. */
  boundaryNotice: string;
  /** M18 compose outcome — never a partial generative UI. */
  composeStatus: ComposeStatus;
  uiPlan: UiPlan | null;
  composed: ComposedView | null;
  fallbackReason: string | null;
};
