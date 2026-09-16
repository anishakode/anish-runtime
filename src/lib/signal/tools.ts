/**
 * Allowlisted read-only Signal tools (M17).
 * Software handles truth — tools only read the Evidence Graph / search index.
 */

import { getGraph } from "@/lib/evidence/queries";
import type { EvidenceGraph } from "@/lib/evidence/schema";
import { buildSearchIndex, retrieveEvidence, type SearchDocument } from "@/lib/search";
import { SignalToolSession } from "./session";
import type { SignalEvidenceCard, SignalToolName, SignalToolResult } from "./types";
import { SIGNAL_TOOL_NAMES } from "./types";

export { SIGNAL_TOOL_NAMES };
export type { SignalEvidenceCard, SignalToolName, SignalToolResult };

export type SignalToolContext = {
  session: SignalToolSession;
  documents: SearchDocument[];
  graph: EvidenceGraph;
};

function asEvidenceCard(doc: SearchDocument): SignalEvidenceCard {
  return {
    id: `${doc.kind}:${doc.id}`,
    title: doc.title,
    kind: doc.kind,
    evidenceState: doc.evidenceState,
    summary: doc.summary,
    href: doc.href,
  };
}

export function makeSignalToolContext(
  documents?: SearchDocument[],
  graph: EvidenceGraph = getGraph(),
): SignalToolContext {
  return {
    session: new SignalToolSession(),
    documents: documents ?? buildSearchIndex(graph),
    graph,
  };
}

export function searchEvidenceTool(
  query: string,
  ctx: SignalToolContext,
): SignalToolResult {
  const retrieval = retrieveEvidence(query, ctx.documents);
  const cards: SignalEvidenceCard[] = [];
  const seen = new Set<string>();

  for (const hit of retrieval.deterministic) {
    const card = asEvidenceCard(hit.document);
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    cards.push(card);
  }
  for (const hit of retrieval.semantic) {
    const doc = ctx.documents.find(
      (d) => d.kind === hit.document.kind && d.id === hit.document.searchDocId,
    );
    if (!doc) continue;
    const card = asEvidenceCard(doc);
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    cards.push(card);
  }

  ctx.session.expose(
    "evidence",
    cards.map((c) => c.id),
  );
  for (const card of cards) {
    if (card.kind === "project") {
      ctx.session.expose("project", [card.id.replace(/^project:/, "")]);
    }
    if (card.kind === "node") {
      const node = ctx.graph.nodes.find((n) => n.id === card.id.replace(/^node:/, ""));
      if (node?.projectId) ctx.session.expose("project", [node.projectId]);
      if (node?.sourceIds?.length) ctx.session.expose("source", node.sourceIds);
    }
  }

  return {
    ok: true,
    tool: "search_evidence",
    data: {
      query,
      count: cards.length,
      results: cards,
      retrievalStatus: retrieval.status,
    },
  };
}

export function fetchEvidenceTool(
  evidenceId: string,
  ctx: SignalToolContext,
): SignalToolResult {
  if (!ctx.session.isExposed("evidence", evidenceId)) {
    return {
      ok: false,
      tool: "fetch_evidence",
      error: `evidence id not exposed by earlier tools: ${evidenceId}`,
    };
  }
  const [kind, ...rest] = evidenceId.split(":");
  const id = rest.join(":");
  const doc = ctx.documents.find((d) => d.kind === kind && d.id === id);
  if (!doc) {
    return {
      ok: false,
      tool: "fetch_evidence",
      error: `unknown evidence id: ${evidenceId}`,
    };
  }
  if (doc.kind === "node") {
    const node = ctx.graph.nodes.find((n) => n.id === doc.id);
    if (node?.sourceIds?.length) ctx.session.expose("source", node.sourceIds);
    if (node?.projectId) ctx.session.expose("project", [node.projectId]);
  }
  return { ok: true, tool: "fetch_evidence", data: asEvidenceCard(doc) };
}

export function fetchProjectTool(
  projectRef: string,
  ctx: SignalToolContext,
): SignalToolResult {
  const project =
    ctx.graph.projects.find((p) => p.id === projectRef) ??
    ctx.graph.projects.find((p) => p.slug === projectRef);
  if (!project) {
    return { ok: false, tool: "fetch_project", error: `unknown project: ${projectRef}` };
  }
  if (
    !ctx.session.isExposed("project", project.id) &&
    !ctx.session.isExposed("evidence", `project:${project.id}`)
  ) {
    return {
      ok: false,
      tool: "fetch_project",
      error: `project id not exposed by earlier tools: ${project.id}`,
    };
  }
  ctx.session.expose("project", [project.id]);
  ctx.session.expose("evidence", [`project:${project.id}`]);
  const nodes = ctx.graph.nodes.filter((n) => n.projectId === project.id);
  for (const node of nodes) {
    ctx.session.expose("evidence", [`node:${node.id}`]);
    if (node.sourceIds?.length) ctx.session.expose("source", node.sourceIds);
  }
  return {
    ok: true,
    tool: "fetch_project",
    data: {
      id: project.id,
      slug: project.slug,
      title: project.title,
      tier: project.tier,
      evidenceState: project.evidenceState,
      summary: project.summary,
      href: `/work/${project.slug}`,
      nodeIds: nodes.map((n) => n.id),
    },
  };
}

export function fetchSourcesTool(
  sourceIds: readonly string[],
  ctx: SignalToolContext,
): SignalToolResult {
  const out = [];
  for (const id of sourceIds) {
    if (!ctx.session.isExposed("source", id)) {
      return {
        ok: false,
        tool: "fetch_sources",
        error: `source id not exposed by earlier tools: ${id}`,
      };
    }
    const source = ctx.graph.sources.find((s) => s.id === id);
    if (!source) {
      return { ok: false, tool: "fetch_sources", error: `unknown source id: ${id}` };
    }
    out.push({
      id: source.id,
      type: source.type,
      title: source.title,
      repo: source.repo,
      path: source.path,
      commitSha: source.commitSha,
      url: source.url,
      note: source.note,
    });
  }
  return { ok: true, tool: "fetch_sources", data: { sources: out } };
}

export function compareEvidenceTool(
  evidenceIds: readonly string[],
  ctx: SignalToolContext,
): SignalToolResult {
  if (evidenceIds.length < 2) {
    return {
      ok: false,
      tool: "compare_evidence",
      error: "compare_evidence requires at least two exposed evidence ids",
    };
  }
  const cards: SignalEvidenceCard[] = [];
  for (const id of evidenceIds) {
    if (!ctx.session.isExposed("evidence", id)) {
      return {
        ok: false,
        tool: "compare_evidence",
        error: `evidence id not exposed by earlier tools: ${id}`,
      };
    }
    const [kind, ...rest] = id.split(":");
    const rawId = rest.join(":");
    const doc = ctx.documents.find((d) => d.kind === kind && d.id === rawId);
    if (!doc) {
      return { ok: false, tool: "compare_evidence", error: `unknown evidence id: ${id}` };
    }
    cards.push(asEvidenceCard(doc));
  }
  return {
    ok: true,
    tool: "compare_evidence",
    data: {
      compared: cards.map((c) => ({
        id: c.id,
        title: c.title,
        evidenceState: c.evidenceState,
        kind: c.kind,
      })),
      note: "Comparison lists canonical states only — Signal does not score fit or upgrade proof.",
    },
  };
}

export function invokeSignalTool(
  name: SignalToolName,
  args: Record<string, unknown>,
  ctx: SignalToolContext,
): SignalToolResult {
  switch (name) {
    case "search_evidence":
      return searchEvidenceTool(String(args.query ?? ""), ctx);
    case "fetch_evidence":
      return fetchEvidenceTool(String(args.evidenceId ?? ""), ctx);
    case "fetch_project":
      return fetchProjectTool(String(args.projectId ?? args.slug ?? ""), ctx);
    case "fetch_sources":
      return fetchSourcesTool(
        Array.isArray(args.sourceIds) ? args.sourceIds.map(String) : [],
        ctx,
      );
    case "compare_evidence":
      return compareEvidenceTool(
        Array.isArray(args.evidenceIds) ? args.evidenceIds.map(String) : [],
        ctx,
      );
    default:
      return { ok: false, tool: name, error: "tool not allowlisted" };
  }
}
