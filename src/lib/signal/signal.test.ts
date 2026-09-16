import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";
import {
  SIGNAL_GAP_NOTICE,
  SIGNAL_TOOL_NAMES,
  compareEvidenceTool,
  fetchEvidenceTool,
  fetchProjectTool,
  fetchSourcesTool,
  interpretWithSignal,
  makeSignalToolContext,
  searchEvidenceTool,
} from "@/lib/signal";

describe("Signal tool session + allowlist (M17)", () => {
  const documents = buildSearchIndex(getGraph());

  it("exposes only the five allowlisted tool names", () => {
    expect([...SIGNAL_TOOL_NAMES]).toEqual([
      "search_evidence",
      "fetch_evidence",
      "fetch_project",
      "fetch_sources",
      "compare_evidence",
    ]);
  });

  it("rejects fetch_evidence for ids not exposed by earlier tools", () => {
    const ctx = makeSignalToolContext(documents);
    const result = fetchEvidenceTool("project:invented-id", ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not exposed by earlier tools/);
    }
  });

  it("rejects fetch_project without prior exposure", () => {
    const ctx = makeSignalToolContext(documents);
    const project = getGraph().projects[0]!;
    const result = fetchProjectTool(project.id, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not exposed by earlier tools/);
    }
  });

  it("rejects fetch_sources without prior exposure", () => {
    const ctx = makeSignalToolContext(documents);
    const source = getGraph().sources[0]!;
    const result = fetchSourcesTool([source.id], ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not exposed by earlier tools/);
    }
  });

  it("search_evidence exposes ids so fetch_evidence succeeds", () => {
    const ctx = makeSignalToolContext(documents);
    const search = searchEvidenceTool("cardstack", ctx);
    expect(search.ok).toBe(true);
    if (!search.ok) return;
    const data = search.data as { results: { id: string }[] };
    expect(data.results.length).toBeGreaterThan(0);
    const firstId = data.results[0]!.id;
    const fetched = fetchEvidenceTool(firstId, ctx);
    expect(fetched.ok).toBe(true);
  });

  it("compare_evidence requires at least two exposed ids", () => {
    const ctx = makeSignalToolContext(documents);
    const search = searchEvidenceTool("cardstack", ctx);
    expect(search.ok).toBe(true);
    if (!search.ok) return;
    const data = search.data as { results: { id: string }[] };
    const first = data.results[0]?.id;
    // Pinning the actual top hit means a ranking regression fails here instead
    // of sliding through a truthiness check.
    expect(first).toBe("node:ev.exp.cardstack");
    const tooFew = compareEvidenceTool([first!], ctx);
    expect(tooFew.ok).toBe(false);
    if (!tooFew.ok) {
      expect(tooFew.error).toMatch(/at least two/);
    }
  });

  it("compare_evidence refuses unexposed ids even when length ≥ 2", () => {
    const ctx = makeSignalToolContext(documents);
    const result = compareEvidenceTool(["project:fake-a", "project:fake-b"], ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not exposed/);
    }
  });
});

describe("interpretWithSignal orchestrator (M17)", () => {
  const documents = buildSearchIndex(getGraph());

  it("returns a deterministic gap notice when nothing matches", () => {
    const result = interpretWithSignal("zzzznotanentity", documents);
    expect(result.gapNotice).toBe(SIGNAL_GAP_NOTICE);
    expect(result.evidenceIds).toEqual([]);
    expect(result.answer).toBe(SIGNAL_GAP_NOTICE);
    expect(result.mode).toBe("tool_orchestrated");
  });

  it("returns gap notice for empty query", () => {
    const result = interpretWithSignal("   ", documents);
    expect(result.gapNotice).toBe(SIGNAL_GAP_NOTICE);
    expect(result.toolTrace).toEqual([]);
  });

  it("assembles a tool-backed answer with evidence ids for known queries", () => {
    const result = interpretWithSignal("cardstack", documents);
    expect(result.gapNotice).toBeNull();
    expect(result.evidenceIds.length).toBeGreaterThan(0);
    expect(result.answer).toMatch(/Tool-backed interpretation/);
    expect(result.answer).not.toMatch(/culture fit|hiring decision|candidate score/i);
    expect(result.toolTrace.some((t) => t.tool === "search_evidence" && t.ok)).toBe(true);
    expect(result.boundaryNotice).toMatch(/allowlisted evidence tools/i);
    expect(result.composeStatus).toBe("composed");
    expect(result.composed).not.toBeNull();
  });

  it("never upgrades LIMITED_EVIDENCE on SHAP-related interpretation", () => {
    const result = interpretWithSignal("shap", documents);
    expect(result.evidence.length).toBeGreaterThan(0);
    const limited = result.evidence.filter((e) => e.evidenceState === "LIMITED_EVIDENCE");
    expect(limited.length).toBeGreaterThan(0);
    for (const card of limited) {
      expect(card.evidenceState).toBe("LIMITED_EVIDENCE");
    }
    expect(result.answer).not.toMatch(/PUBLIC_CODE_VERIFIED/);
  });

  it("does not invent evidence ids outside the search index", () => {
    const result = interpretWithSignal("mlops drift", documents);
    const indexIds = new Set(documents.map((d) => `${d.kind}:${d.id}`));

    // Without this, a regression that returned no evidence at all would make
    // the loop below iterate zero times and pass.
    expect(result.evidenceIds.length).toBeGreaterThan(0);
    for (const id of result.evidenceIds) {
      expect(indexIds.has(id), `${id} is not in the search index`).toBe(true);
    }
  });

  it("tool trace stays within the allowlist", () => {
    const result = interpretWithSignal("malware", documents);

    // Same reason: an orchestrator that stopped calling tools would otherwise
    // satisfy a test named for the allowlist.
    expect(result.toolTrace.length).toBeGreaterThan(0);
    for (const step of result.toolTrace) {
      expect(SIGNAL_TOOL_NAMES, `${step.tool} is not allowlisted`).toContain(step.tool);
    }
  });
});
