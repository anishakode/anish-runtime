/**
 * Local TF-IDF vector index for semantic fallback (M16).
 * No browser API keys. Provider failure → empty hits (caller falls back).
 */

import { tokenize } from "./normalize";
import type { SemanticDocument } from "./semantic-docs";

export type SemanticVectorRow = {
  canonicalId: string;
  contentHash: string;
  values: number[];
};

export type LocalSemanticIndex = {
  provider: "local-tfidf";
  vocab: string[];
  idf: number[];
  rows: SemanticVectorRow[];
  byId: Record<string, SemanticDocument>;
};

export type SemanticHit = {
  document: SemanticDocument;
  score: number;
  /** Always semantic — relevance, not proof. */
  matchKind: "semantic";
  evidenceState: SemanticDocument["evidenceState"];
};

export type SemanticSearchOptions = {
  /** Simulate provider/infrastructure failure. */
  forceFailure?: boolean;
  limit?: number;
  minScore?: number;
  /** Exclude canonical ids already shown by deterministic search. */
  excludeIds?: ReadonlySet<string>;
};

const DEFAULT_LIMIT = 8;
const DEFAULT_MIN_SCORE = 0.08;

function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}

function buildVocab(docs: readonly SemanticDocument[]): string[] {
  const set = new Set<string>();
  for (const doc of docs) {
    for (const token of tokenize(doc.embeddingText)) set.add(token);
  }
  return [...set].sort();
}

function vectorize(
  tokens: string[],
  vocabIndex: Map<string, number>,
  idf: number[],
): number[] {
  const tf = termFreq(tokens);
  const values = new Array<number>(vocabIndex.size).fill(0);
  const maxTf = Math.max(1, ...tf.values());
  for (const [token, count] of tf) {
    const idx = vocabIndex.get(token);
    if (idx === undefined) continue;
    values[idx] = (count / maxTf) * (idf[idx] ?? 0);
  }
  return values;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Build a disposable local vector index from derived semantic documents. */
export function buildLocalSemanticIndex(
  documents: readonly SemanticDocument[],
): LocalSemanticIndex {
  const vocab = buildVocab(documents);
  const vocabIndex = new Map(vocab.map((term, i) => [term, i]));
  const df = new Array<number>(vocab.length).fill(0);
  const tokenized = documents.map((doc) => tokenize(doc.embeddingText));

  for (const tokens of tokenized) {
    const unique = new Set(tokens);
    for (const token of unique) {
      const idx = vocabIndex.get(token);
      if (idx !== undefined) df[idx] = (df[idx] ?? 0) + 1;
    }
  }

  const nDocs = Math.max(1, documents.length);
  const idf = df.map((count) => Math.log((nDocs + 1) / ((count ?? 0) + 1)) + 1);

  const byId: Record<string, SemanticDocument> = {};
  const rows: SemanticVectorRow[] = documents.map((doc, i) => {
    byId[doc.canonicalId] = doc;
    return {
      canonicalId: doc.canonicalId,
      contentHash: doc.contentHash,
      values: vectorize(tokenized[i] ?? [], vocabIndex, idf),
    };
  });

  return { provider: "local-tfidf", vocab, idf, rows, byId };
}

/**
 * Semantic search against the local index.
 * Results must still pass live hash checks via `validateSemanticHits`.
 */
export function searchSemanticLocal(
  query: string,
  index: LocalSemanticIndex,
  options: SemanticSearchOptions = {},
): { ok: true; hits: SemanticHit[] } | { ok: false; reason: string } {
  if (options.forceFailure) {
    return { ok: false, reason: "vector provider failure (forced)" };
  }

  const tokens = tokenize(query);
  if (tokens.length === 0) return { ok: true, hits: [] };

  const vocabIndex = new Map(index.vocab.map((term, i) => [term, i]));
  const queryVec = vectorize(tokens, vocabIndex, index.idf);
  const exclude = options.excludeIds ?? new Set<string>();
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  const limit = options.limit ?? DEFAULT_LIMIT;

  const scored: SemanticHit[] = [];
  for (const row of index.rows) {
    if (exclude.has(row.canonicalId)) continue;
    const live = index.byId[row.canonicalId];
    if (!live) continue;
    const score = cosine(queryVec, row.values);
    if (score < minScore) continue;
    scored.push({
      document: live,
      score,
      matchKind: "semantic",
      evidenceState: live.evidenceState,
    });
  }

  scored.sort(
    (a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title),
  );
  return { ok: true, hits: scored.slice(0, limit) };
}

/**
 * Keep only hits whose contentHash still matches the live derived document.
 * Unknown / stale vector rows are discarded.
 */
export function validateSemanticHits(
  hits: readonly SemanticHit[],
  liveDocuments: readonly SemanticDocument[],
): SemanticHit[] {
  const live = new Map(liveDocuments.map((d) => [d.canonicalId, d]));
  const kept: SemanticHit[] = [];
  for (const hit of hits) {
    const current = live.get(hit.document.canonicalId);
    if (!current) continue;
    if (current.contentHash !== hit.document.contentHash) continue;
    // Rehydrate from live document so evidenceState cannot drift.
    kept.push({
      ...hit,
      document: current,
      evidenceState: current.evidenceState,
    });
  }
  return kept;
}
