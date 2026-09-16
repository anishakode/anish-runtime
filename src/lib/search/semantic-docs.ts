/**
 * Derived semantic evidence documents (M16).
 * Disposable vector text — not a second source of truth.
 */

import { createHash } from "./hash";
import type { SearchDocument } from "./index-build";

export type SemanticDocument = {
  /** Stable key: `${kind}:${id}` resolving to a live SearchDocument. */
  canonicalId: string;
  searchDocId: string;
  kind: SearchDocument["kind"];
  title: string;
  summary: string;
  evidenceState: SearchDocument["evidenceState"];
  href: string;
  /** Text used for embedding — derived only from canonical fields. */
  embeddingText: string;
  /** Hash of embeddingText — reject stale vector rows that no longer match. */
  contentHash: string;
};

export function semanticCanonicalId(doc: SearchDocument): string {
  return `${doc.kind}:${doc.id}`;
}

export function buildEmbeddingText(doc: SearchDocument): string {
  const aliases = doc.aliases.join(" ");
  return [doc.title, aliases, doc.summary, doc.kind].filter(Boolean).join("\n");
}

/** Derive one semantic document per search/index entity. */
export function buildSemanticDocuments(
  documents: readonly SearchDocument[],
): SemanticDocument[] {
  return documents.map((doc) => {
    const embeddingText = buildEmbeddingText(doc);
    return {
      canonicalId: semanticCanonicalId(doc),
      searchDocId: doc.id,
      kind: doc.kind,
      title: doc.title,
      summary: doc.summary,
      evidenceState: doc.evidenceState,
      href: doc.href,
      embeddingText,
      contentHash: createHash(embeddingText),
    };
  });
}
