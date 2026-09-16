/**
 * Bind catalogue questions to the Evidence Graph (M21).
 * Server-side: a question with no resolvable canonical evidence is dropped, not guessed.
 */

import { getGraph, type EvidenceGraph } from "@/lib/evidence/queries";
import type { EvidenceState } from "@/lib/evidence/schema";
import { INTERVIEW_CATALOG, type InterviewQuestionTemplate } from "./catalog";

export type InterviewEvidenceRef = {
  id: string;
  title: string;
  state: EvidenceState;
  sourceCount: number;
  href: string | null;
};

export type ResolvedInterviewQuestion = InterviewQuestionTemplate & {
  evidence: InterviewEvidenceRef[];
  /** Unique canonical sources behind the whole question. */
  sourceCount: number;
};

function resolveEvidence(
  ids: readonly string[],
  graph: EvidenceGraph,
): { evidence: InterviewEvidenceRef[]; sourceCount: number } {
  const evidence: InterviewEvidenceRef[] = [];
  const sourceIds = new Set<string>();

  for (const id of ids) {
    const node = graph.nodes.find((n) => n.id === id);
    if (!node) continue;
    for (const sid of node.sourceIds) sourceIds.add(sid);
    const project = node.projectId
      ? graph.projects.find((p) => p.id === node.projectId)
      : undefined;
    evidence.push({
      id: node.id,
      title: node.title,
      state: node.state,
      sourceCount: node.sourceIds.length,
      href: project ? `/work/${project.slug}` : null,
    });
  }

  return { evidence, sourceCount: sourceIds.size };
}

/** Resolve the catalogue against canonical truth; drops unbound questions. */
export function buildInterviewCatalog(
  graph: EvidenceGraph = getGraph(),
  catalog: readonly InterviewQuestionTemplate[] = INTERVIEW_CATALOG,
): ResolvedInterviewQuestion[] {
  const resolved: ResolvedInterviewQuestion[] = [];
  for (const template of catalog) {
    const { evidence, sourceCount } = resolveEvidence(template.evidenceIds, graph);
    if (evidence.length === 0) continue;
    resolved.push({ ...template, evidence, sourceCount });
  }
  return resolved;
}
