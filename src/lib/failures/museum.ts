/**
 * Failure Museum projection — Evidence Graph boundary + empty exhibit set (M14).
 */

import { getGraph } from "@/lib/evidence/queries";
import type { EvidenceState } from "@/lib/evidence/schema";
import { CANONICAL_FAILURE_EXHIBITS, listPublishedExhibits } from "./exhibits";
import { FAILURE_PUBLICATION_REQUIREMENTS } from "./gate";
import type { FailureExhibit } from "./schema";

export const FAILURE_MUSEUM_BOUNDARY_NODE_ID = "ev.boundary.failure-museum-empty";

export type FailureMuseumView = {
  empty: boolean;
  publishedCount: number;
  exhibits: FailureExhibit[];
  boundaryNodeId: string;
  title: string;
  summary: string;
  state: EvidenceState;
  publicationRequirements: readonly string[];
};

export function getFailureMuseum(
  exhibits: readonly FailureExhibit[] = CANONICAL_FAILURE_EXHIBITS,
): FailureMuseumView {
  const graph = getGraph();
  const boundary = graph.nodes.find((n) => n.id === FAILURE_MUSEUM_BOUNDARY_NODE_ID);
  if (!boundary) {
    throw new Error(
      `getFailureMuseum: missing boundary node ${FAILURE_MUSEUM_BOUNDARY_NODE_ID}`,
    );
  }

  const published = listPublishedExhibits(exhibits);
  const empty = published.length === 0;

  return {
    empty,
    publishedCount: published.length,
    exhibits: published,
    boundaryNodeId: boundary.id,
    title: boundary.title,
    summary:
      boundary.summary ??
      "No artifact-grade failure exhibits published yet. Empty truthful museum preferred over fabricated stories.",
    state: boundary.state,
    publicationRequirements: FAILURE_PUBLICATION_REQUIREMENTS,
  };
}
