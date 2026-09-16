/**
 * Deterministic evidence ranking (M15).
 * Exact → alias → prefix → keyword → bounded typo.
 * Relevance never upgrades evidenceState.
 */

import { levenshtein, normalizeSearchText, tokenize } from "./normalize";
import type { SearchDocument } from "./index-build";

export const MATCH_RANK = {
  exact_title: 1,
  exact_alias: 2,
  prefix: 3,
  keyword: 4,
  typo: 5,
} as const;

export type MatchKind = keyof typeof MATCH_RANK;

export type SearchHit = {
  document: SearchDocument;
  matchKind: MatchKind;
  /** Copied from document — search must not mutate or upgrade this. */
  evidenceState: SearchDocument["evidenceState"];
};

const MAX_HITS = 12;
const TYPO_MIN_TOKEN_LEN = 4;
const TYPO_MAX_DISTANCE = 1;

function bestMatch(
  queryNorm: string,
  queryTokens: string[],
  doc: SearchDocument,
): MatchKind | null {
  if (!queryNorm) return null;

  if (doc.titleNorm === queryNorm) return "exact_title";
  if (doc.aliasNorms.includes(queryNorm)) return "exact_alias";

  if (
    doc.titleNorm.startsWith(queryNorm) ||
    doc.aliasNorms.some((alias) => alias.startsWith(queryNorm))
  ) {
    return "prefix";
  }

  if (
    queryTokens.length > 0 &&
    queryTokens.every((token) => doc.tokens.includes(token))
  ) {
    return "keyword";
  }

  // Bounded typo recovery: each query token (len≥4) must be exact or distance≤1 vs a doc token.
  if (queryTokens.length > 0) {
    const ok = queryTokens.every((qToken) => {
      if (doc.tokens.includes(qToken)) return true;
      if (qToken.length < TYPO_MIN_TOKEN_LEN) return false;
      return doc.tokens.some(
        (dToken) =>
          dToken.length >= TYPO_MIN_TOKEN_LEN &&
          levenshtein(qToken, dToken) <= TYPO_MAX_DISTANCE,
      );
    });
    if (ok) return "typo";
  }

  return null;
}

/**
 * Rank evidence documents for a visitor query.
 * Returns hits sorted by match quality; evidence states are pass-through only.
 */
export function searchEvidence(
  query: string,
  documents: readonly SearchDocument[],
  limit: number = MAX_HITS,
): SearchHit[] {
  const queryNorm = normalizeSearchText(query);
  if (!queryNorm) return [];
  const queryTokens = tokenize(query);

  const hits: SearchHit[] = [];
  for (const document of documents) {
    const matchKind = bestMatch(queryNorm, queryTokens, document);
    if (!matchKind) continue;
    hits.push({
      document,
      matchKind,
      evidenceState: document.evidenceState,
    });
  }

  hits.sort((a, b) => {
    const rankDiff = MATCH_RANK[a.matchKind] - MATCH_RANK[b.matchKind];
    if (rankDiff !== 0) return rankDiff;
    return a.document.title.localeCompare(b.document.title);
  });

  return hits.slice(0, Math.max(0, limit));
}
