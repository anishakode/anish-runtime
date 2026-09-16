import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex, MATCH_RANK, searchEvidence } from "@/lib/search";
import { levenshtein, normalizeSearchText } from "@/lib/search/normalize";

describe("normalize + levenshtein (M15)", () => {
  it("normalizes punctuation and case", () => {
    expect(normalizeSearchText("  PSI/KS · Drift! ")).toBe("psi ks drift");
  });

  it("computes bounded edit distance", () => {
    expect(levenshtein("python", "python")).toBe(0);
    expect(levenshtein("python", "pythn")).toBe(1);
    expect(levenshtein("python", "java")).toBeGreaterThan(1);
  });
});

describe("searchEvidence ranking (M15)", () => {
  const documents = buildSearchIndex(getGraph());

  it("builds an index from projects, nodes, experience, education, and profile", () => {
    expect(documents.some((d) => d.kind === "project")).toBe(true);
    expect(documents.some((d) => d.kind === "node")).toBe(true);
    expect(documents.some((d) => d.kind === "experience")).toBe(true);
    expect(documents.some((d) => d.kind === "education")).toBe(true);
    expect(documents.some((d) => d.kind === "profile")).toBe(true);
    expect(documents.length).toBeGreaterThan(20);
  });

  it("returns empty hits for empty or whitespace queries", () => {
    expect(searchEvidence("", documents)).toEqual([]);
    expect(searchEvidence("   ", documents)).toEqual([]);
  });

  it("ranks exact title ahead of weaker matches", () => {
    const hits = searchEvidence("Python", documents);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.matchKind).toBe("exact_title");
    expect(hits[0]?.document.title).toBe("Python");
    expect(MATCH_RANK[hits[0]!.matchKind]).toBe(1);
  });

  it("matches exact aliases such as cardstack", () => {
    const hits = searchEvidence("cardstack", documents);
    expect(hits.some((h) => h.matchKind === "exact_alias")).toBe(true);
    expect(
      hits.some((h) =>
        /cardstack/i.test(h.document.title + h.document.aliases.join(" ")),
      ),
    ).toBe(true);
  });

  it("matches prefixes for MLOps", () => {
    const hits = searchEvidence("mlop", documents);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.matchKind).toBe("prefix");
    expect(hits[0]?.document.title.toLowerCase()).toContain("mlops");
  });

  it("matches keyword tokens across title/summary", () => {
    const hits = searchEvidence("incident investigation", documents);
    expect(hits.length).toBeGreaterThan(0);
    expect(
      hits.some((h) => h.matchKind === "keyword" || h.matchKind === "exact_alias"),
    ).toBe(true);
  });

  it("recovers bounded typos without inventing entities", () => {
    const hits = searchEvidence("pythn", documents);
    expect(
      hits.some((h) => h.document.title === "Python" && h.matchKind === "typo"),
    ).toBe(true);
    expect(searchEvidence("zzzznotanentity", documents)).toEqual([]);
  });

  it("preserves LIMITED_EVIDENCE and NOT_DEMONSTRATED without upgrading", () => {
    const shap = searchEvidence("shap", documents).find((h) =>
      /shap/i.test(h.document.title + h.document.id),
    );
    expect(shap?.evidenceState).toBe("LIMITED_EVIDENCE");
    expect(shap?.document.evidenceState).toBe("LIMITED_EVIDENCE");

    const museum = searchEvidence("failure museum", documents).find((h) =>
      /failure museum/i.test(h.document.title),
    );
    expect(museum?.evidenceState).toBe("NOT_DEMONSTRATED");
  });

  it("never mutates document evidence states while ranking", () => {
    const before = documents.map((d) => d.evidenceState);
    searchEvidence("steward", documents);
    expect(documents.map((d) => d.evidenceState)).toEqual(before);
  });
});
