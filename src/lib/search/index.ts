export { buildSearchIndex, type SearchDocKind, type SearchDocument } from "./index-build";
export { MATCH_RANK, searchEvidence, type MatchKind, type SearchHit } from "./rank";
export { levenshtein, normalizeSearchText, tokenize } from "./normalize";
export { createHash } from "./hash";
export {
  buildSemanticDocuments,
  buildEmbeddingText,
  semanticCanonicalId,
  type SemanticDocument,
} from "./semantic-docs";
export {
  buildLocalSemanticIndex,
  searchSemanticLocal,
  validateSemanticHits,
  type LocalSemanticIndex,
  type SemanticHit,
} from "./semantic";
export {
  DETERMINISTIC_SUFFICIENT_COUNT,
  isDeterministicInsufficient,
  retrieveEvidence,
  type EvidenceRetrieval,
  type RetrievalStatus,
} from "./retrieve";
