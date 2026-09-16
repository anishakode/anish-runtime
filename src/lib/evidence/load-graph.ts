import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EvidenceGraphSchema, type EvidenceGraph } from "./schema";

const evidenceDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../content/evidence",
);

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(join(evidenceDir, name), "utf8"));
}

/**
 * Load and validate the canonical Evidence Graph from content fragments.
 * This is the factual authority for the portfolio rebuild.
 */
export function loadEvidenceGraph(): EvidenceGraph {
  const base = readJson("graph.json") as Record<string, unknown>;
  const sources = readJson("sources.json");
  const nodes = readJson("nodes.json");
  const edges = readJson("edges.json");

  return EvidenceGraphSchema.parse({
    ...base,
    sources,
    nodes,
    edges,
  });
}

export function getEvidenceStats(graph: EvidenceGraph = loadEvidenceGraph()) {
  return {
    version: graph.version,
    projects: graph.projects.length,
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    sources: graph.sources.length,
    education: graph.education.length,
    experience: graph.experience.length,
    byTier: {
      flagship: graph.projects.filter((p) => p.tier === "flagship").length,
      supporting: graph.projects.filter((p) => p.tier === "supporting").length,
      archive: graph.projects.filter((p) => p.tier === "archive").length,
    },
  };
}
