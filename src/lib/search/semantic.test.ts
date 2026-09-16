import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import {
  buildLocalSemanticIndex,
  buildSearchIndex,
  buildSemanticDocuments,
  DETERMINISTIC_SUFFICIENT_COUNT,
  isDeterministicInsufficient,
  retrieveEvidence,
  searchEvidence,
  searchSemanticLocal,
  validateSemanticHits,
} from "@/lib/search";

describe("semantic documents + vectors (M16)", () => {
  const documents = buildSearchIndex(getGraph());
  const semanticDocs = buildSemanticDocuments(documents);

  it("derives a semantic document for every search entity with a content hash", () => {
    expect(semanticDocs.length).toBe(documents.length);
    expect(semanticDocs.every((d) => d.contentHash.length === 16)).toBe(true);
    expect(semanticDocs.every((d) => d.embeddingText.includes(d.title))).toBe(true);
  });

  it("returns semantic hits for natural-language intent queries", () => {
    const index = buildLocalSemanticIndex(semanticDocs);
    const result = searchSemanticLocal(
      "how does the portfolio explain pdf malware without executing it",
      index,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.hits.length).toBeGreaterThan(0);
    expect(
      result.hits.some(
        (h) =>
          /malware/i.test(h.document.title) || /malware/i.test(h.document.embeddingText),
      ),
    ).toBe(true);
    expect(result.hits.every((h) => h.matchKind === "semantic")).toBe(true);
  });

  it("discards stale vector rows whose contentHash no longer matches", () => {
    const index = buildLocalSemanticIndex(semanticDocs);
    const result = searchSemanticLocal("drift monitoring psi", index);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.hits.length).toBeGreaterThan(0);

    const stale = result.hits.map((hit) => ({
      ...hit,
      document: { ...hit.document, contentHash: "deadbeefdeadbeef" },
    }));
    expect(validateSemanticHits(stale, semanticDocs)).toEqual([]);
  });

  it("discards unknown canonical ids", () => {
    const ghost = {
      document: {
        ...semanticDocs[0]!,
        canonicalId: "node:does-not-exist",
      },
      score: 0.9,
      matchKind: "semantic" as const,
      evidenceState: semanticDocs[0]!.evidenceState,
    };
    expect(validateSemanticHits([ghost], semanticDocs)).toEqual([]);
  });

  it("fails closed when the vector provider fails", () => {
    const index = buildLocalSemanticIndex(semanticDocs);
    const result = searchSemanticLocal("anything", index, { forceFailure: true });
    expect(result.ok).toBe(false);
  });
});

describe("retrieveEvidence orchestration (M16)", () => {
  const documents = buildSearchIndex(getGraph());

  it("keeps strong deterministic matches without invoking semantic noise", () => {
    const result = retrieveEvidence("Python", documents);
    expect(result.deterministic.length).toBeGreaterThanOrEqual(
      DETERMINISTIC_SUFFICIENT_COUNT,
    );
    expect(isDeterministicInsufficient(result.deterministic)).toBe(false);
    expect(result.semanticAttempted).toBe(false);
    expect(result.semantic).toEqual([]);
    expect(result.status).toBe("deterministic_only");
  });

  it("appends semantic hits when deterministic results are insufficient", () => {
    const weak = retrieveEvidence(
      "systems that watch model drift and explain pdf risk signals",
      documents,
    );
    expect(weak.semanticAttempted).toBe(true);
    // Either semantic appended or empty after attempt — never invents new states.
    if (weak.semantic.length > 0) {
      expect(weak.status).toBe("semantic_appended");
      expect(
        weak.semantic.every((h) => h.evidenceState === h.document.evidenceState),
      ).toBe(true);
    }
  });

  it("falls back to deterministic-only when semantic infrastructure fails", () => {
    const deterministic = searchEvidence("zzzznotanentity xyz", documents);
    expect(deterministic.length).toBe(0);
    const result = retrieveEvidence("zzzznotanentity xyz", documents, {
      forceSemanticFailure: true,
    });
    expect(result.semanticAttempted).toBe(true);
    expect(result.semantic).toEqual([]);
    expect(result.status).toBe("empty");
  });

  it("preserves LIMITED_EVIDENCE through semantic rehydration", () => {
    const result = retrieveEvidence(
      "limited shap model internals explainability detail",
      documents,
    );
    const shapHit = [...result.deterministic, ...result.semantic].find((h) =>
      /shap/i.test(h.document.title),
    );
    expect(shapHit).toBeDefined();
    expect(shapHit?.evidenceState).toBe("LIMITED_EVIDENCE");
  });
});
