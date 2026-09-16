/**
 * Combined evidence retrieval: deterministic first, semantic fallback second (M16).
 */

import { searchEvidence, type SearchHit } from "./rank";
import type { SearchDocument } from "./index-build";
import { buildSemanticDocuments, type SemanticDocument } from "./semantic-docs";
import {
  buildLocalSemanticIndex,
  searchSemanticLocal,
  validateSemanticHits,
  type SemanticHit,
} from "./semantic";

/** Deterministic results below this count are treated as insufficient. */
export const DETERMINISTIC_SUFFICIENT_COUNT = 2;

export type RetrievalStatus =
  "deterministic_only" | "semantic_appended" | "semantic_failed_fallback" | "empty";

export type EvidenceRetrieval = {
  deterministic: SearchHit[];
  semantic: SemanticHit[];
  status: RetrievalStatus;
  /** True when semantic layer was attempted. */
  semanticAttempted: boolean;
};

export function isDeterministicInsufficient(hits: readonly SearchHit[]): boolean {
  return hits.length < DETERMINISTIC_SUFFICIENT_COUNT;
}

/**
 * Retrieve evidence for ASK RUNTIME.
 * Semantic similarity broadens intent only — never upgrades evidence strength.
 */
export function retrieveEvidence(
  query: string,
  documents: readonly SearchDocument[],
  options: { forceSemanticFailure?: boolean } = {},
): EvidenceRetrieval {
  const deterministic = searchEvidence(query, documents);
  if (!query.trim()) {
    return {
      deterministic: [],
      semantic: [],
      status: "empty",
      semanticAttempted: false,
    };
  }

  if (!isDeterministicInsufficient(deterministic)) {
    return {
      deterministic,
      semantic: [],
      status: "deterministic_only",
      semanticAttempted: false,
    };
  }

  const semanticDocs = buildSemanticDocuments(documents);
  const index = buildLocalSemanticIndex(semanticDocs);
  const exclude = new Set(
    deterministic.map((h) => `${h.document.kind}:${h.document.id}`),
  );

  const result = searchSemanticLocal(query, index, {
    forceFailure: options.forceSemanticFailure,
    excludeIds: exclude,
  });

  if (!result.ok) {
    return {
      deterministic,
      semantic: [],
      status: deterministic.length === 0 ? "empty" : "semantic_failed_fallback",
      semanticAttempted: true,
    };
  }

  const semantic = validateSemanticHits(result.hits, semanticDocs);
  if (semantic.length === 0 && deterministic.length === 0) {
    return {
      deterministic,
      semantic: [],
      status: "empty",
      semanticAttempted: true,
    };
  }

  return {
    deterministic,
    semantic,
    status: semantic.length > 0 ? "semantic_appended" : "deterministic_only",
    semanticAttempted: true,
  };
}

export type { SemanticDocument, SemanticHit };
