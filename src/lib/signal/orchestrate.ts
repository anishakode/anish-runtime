/**
 * Bounded Signal orchestrator (M17) + Adaptive Evidence Composer (M18).
 * Explicit INTERPRET WITH SIGNAL — tool-backed answers; UI via constrained ui_plan.
 */

import type { SearchDocument } from "@/lib/search";
import type { EvidenceState } from "@/lib/evidence/schema";
import { COMPOSE_FALLBACK_NOTICE, composeFromEvidence } from "./compose";
import {
  compareEvidenceTool,
  fetchEvidenceTool,
  fetchProjectTool,
  fetchSourcesTool,
  makeSignalToolContext,
  searchEvidenceTool,
  type SignalEvidenceCard,
  type SignalToolResult,
} from "./tools";
import { SIGNAL_GAP_NOTICE, type SignalInterpretation } from "./types";

export { SIGNAL_GAP_NOTICE };
export type { SignalInterpretation };

function emptyCompose(): Pick<
  SignalInterpretation,
  "composeStatus" | "uiPlan" | "composed" | "fallbackReason"
> {
  return {
    composeStatus: "gap",
    uiPlan: null,
    composed: null,
    fallbackReason: null,
  };
}

/**
 * Run a single-pass tool orchestrator:
 * search → fetch top evidence → optional project/sources → optional compare → compose ui_plan.
 */
export function interpretWithSignal(
  query: string,
  documents: SearchDocument[],
): SignalInterpretation {
  const intent = query.trim();
  const ctx = makeSignalToolContext(documents);
  const toolTrace: SignalToolResult[] = [];

  const boundaryNotice =
    "Signal is optional and read-only. Answers are assembled only from allowlisted evidence tools. The UI is rehydrated from the Evidence Graph — evidence states are never upgraded.";

  if (!intent) {
    const compose = composeFromEvidence([], ctx.graph, { gap: true });
    return {
      intent: "",
      answer: SIGNAL_GAP_NOTICE,
      evidenceIds: [],
      evidence: [],
      gapNotice: SIGNAL_GAP_NOTICE,
      toolTrace,
      mode: "tool_orchestrated",
      boundaryNotice,
      composeStatus: compose.status,
      uiPlan: compose.plan,
      composed: compose.composed,
      fallbackReason: compose.fallbackReason,
    };
  }

  const search = searchEvidenceTool(intent, ctx);
  toolTrace.push(search);
  if (!search.ok) {
    return {
      intent,
      answer: SIGNAL_GAP_NOTICE,
      evidenceIds: [],
      evidence: [],
      gapNotice: SIGNAL_GAP_NOTICE,
      toolTrace,
      mode: "tool_orchestrated",
      boundaryNotice,
      ...emptyCompose(),
    };
  }

  const data = search.data as {
    count: number;
    results: SignalEvidenceCard[];
  };
  const results = Array.isArray(data.results) ? data.results : [];

  if (results.length === 0) {
    const compose = composeFromEvidence([], ctx.graph, { gap: true });
    return {
      intent,
      answer: SIGNAL_GAP_NOTICE,
      evidenceIds: [],
      evidence: [],
      gapNotice: SIGNAL_GAP_NOTICE,
      toolTrace,
      mode: "tool_orchestrated",
      boundaryNotice,
      composeStatus: compose.status,
      uiPlan: compose.plan,
      composed: compose.composed,
      fallbackReason: compose.fallbackReason,
    };
  }

  const top = results.slice(0, 5);
  for (const card of top) {
    toolTrace.push(fetchEvidenceTool(card.id, ctx));
    if (card.kind === "project") {
      toolTrace.push(fetchProjectTool(card.id.replace(/^project:/, ""), ctx));
    }
    if (card.kind === "node") {
      const nodeId = card.id.replace(/^node:/, "");
      const node = ctx.graph.nodes.find((n) => n.id === nodeId);
      if (node?.sourceIds?.length) {
        toolTrace.push(fetchSourcesTool(node.sourceIds.slice(0, 3), ctx));
      }
      if (node?.projectId) {
        toolTrace.push(fetchProjectTool(node.projectId, ctx));
      }
    }
  }

  if (top.length >= 2) {
    toolTrace.push(
      compareEvidenceTool(
        top.slice(0, 3).map((c) => c.id),
        ctx,
      ),
    );
  }

  const lines = top.map(
    (card) =>
      `• ${card.title} [${formatState(card.evidenceState)}] — ${card.summary || card.kind}`,
  );

  const answer = [
    `Tool-backed interpretation for: “${intent}”.`,
    `Found ${results.length} canonical evidence item(s). Top matches:`,
    ...lines,
    "States shown are graph truth. Signal does not invent claims beyond these tools.",
  ].join("\n");

  const compose = composeFromEvidence(top, ctx.graph);
  const fallbackNote =
    compose.status === "fallback"
      ? `\n\n${COMPOSE_FALLBACK_NOTICE}${compose.fallbackReason ? ` (${compose.fallbackReason})` : ""}`
      : "";

  return {
    intent,
    answer: answer + fallbackNote,
    evidenceIds: top.map((c) => c.id),
    evidence: top,
    gapNotice: null,
    toolTrace,
    mode: "tool_orchestrated",
    boundaryNotice,
    composeStatus: compose.status,
    uiPlan: compose.plan,
    composed: compose.composed,
    fallbackReason: compose.fallbackReason,
  };
}

function formatState(state: EvidenceState): string {
  return state.replaceAll("_", " ");
}
