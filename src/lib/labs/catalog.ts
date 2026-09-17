/**
 * Canonical Runtime Lab registry.
 *
 * One list, shared by the `/labs` index and the M23 journey catalog. The lab
 * set previously existed only as a private constant inside
 * `src/lib/ending/catalog.ts`, so adding the index would have created a second
 * copy — the same duplicate-source defect the architecture scrubber had.
 *
 * Labels are the only local strings. Summary and evidence state are read from
 * the graph node, so the index cannot describe a lab more favourably than the
 * corpus does, and every lab renders its `PORTFOLIO_EXTENSION` badge.
 */

import { getGraph, type EvidenceGraph } from "@/lib/evidence/queries";
import type { EvidenceState } from "@/lib/evidence/schema";

export const RUNTIME_LABS = [
  {
    itemId: "lab:mlops",
    label: "MLOps Runtime Lab",
    href: "/labs/mlops",
    nodeId: "ev.mlops.runtime-lab",
    /** What the visitor operates, in verbs — not a claim about the system. */
    action: "Shift a distribution, break the system, watch the recovery",
  },
  {
    itemId: "lab:steward",
    label: "Steward Agent Lab",
    href: "/labs/steward",
    nodeId: "ev.steward.runtime-lab",
    action: "Walk an agent through tool states on synthetic patient context",
  },
  {
    itemId: "lab:malware",
    label: "PDF Malware Explainability Lab",
    href: "/labs/malware",
    nodeId: "ev.malware.runtime-lab",
    action: "Toggle static features and read the attribution that follows",
  },
] as const;

export type RuntimeLab = (typeof RUNTIME_LABS)[number];

export type RuntimeLabView = {
  itemId: string;
  label: string;
  href: string;
  nodeId: string;
  action: string;
  summary: string;
  evidenceState: EvidenceState;
};

/**
 * Resolve each lab against the graph.
 *
 * A lab is omitted when its node is missing, and equally when that node carries
 * no summary — `summary` is optional on an evidence node, and a lab card with a
 * blank description would be the page inventing the gap away. `labs.test.ts`
 * pins the count to the registry, so either omission fails the build rather
 * than quietly shrinking the index.
 */
export function buildRuntimeLabViews(
  graph: EvidenceGraph = getGraph(),
): RuntimeLabView[] {
  const views: RuntimeLabView[] = [];

  for (const lab of RUNTIME_LABS) {
    const node = graph.nodes.find((n) => n.id === lab.nodeId);
    if (!node?.summary) continue;
    views.push({
      itemId: lab.itemId,
      label: lab.label,
      href: lab.href,
      nodeId: lab.nodeId,
      action: lab.action,
      summary: node.summary,
      evidenceState: node.state,
    });
  }

  return views;
}
