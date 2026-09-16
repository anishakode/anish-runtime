import { loadEvidenceGraph } from "./load-graph";
import type { EvidenceGraph } from "./schema";

export type { EvidenceGraph };
export type Project = EvidenceGraph["projects"][number];
export type EvidenceNode = EvidenceGraph["nodes"][number];
export type Experience = EvidenceGraph["experience"][number];
export type Education = EvidenceGraph["education"][number];

export { displayHostPath, evidenceStateLabel } from "./format";

export function getGraph(): EvidenceGraph {
  return loadEvidenceGraph();
}

export function getProjectsByTier(graph: EvidenceGraph = getGraph()) {
  return {
    flagship: graph.projects.filter((p) => p.tier === "flagship"),
    supporting: graph.projects.filter((p) => p.tier === "supporting"),
    archive: graph.projects.filter((p) => p.tier === "archive"),
  };
}

export function getProjectBySlug(
  slug: string,
  graph: EvidenceGraph = getGraph(),
): Project | undefined {
  return graph.projects.find((p) => p.slug === slug);
}

export function getNodesForProject(
  projectId: string,
  graph: EvidenceGraph = getGraph(),
): EvidenceNode[] {
  return graph.nodes.filter((n) => n.projectId === projectId);
}

export function getSourcesForNode(node: EvidenceNode, graph: EvidenceGraph = getGraph()) {
  return graph.sources.filter((s) => node.sourceIds.includes(s.id));
}

export function getExperience(graph: EvidenceGraph = getGraph()) {
  return graph.experience;
}

export function getEducation(graph: EvidenceGraph = getGraph()) {
  return graph.education;
}

export function getNodesByIds(ids: string[], graph: EvidenceGraph = getGraph()) {
  return ids
    .map((id) => graph.nodes.find((n) => n.id === id))
    .filter((n): n is EvidenceNode => Boolean(n));
}

export function getProfile(graph: EvidenceGraph = getGraph()) {
  return graph.profile;
}

/** Prefer SHA-pinned GitHub evidence URL over floating default branch. */
export function getPinnedRepoLink(
  project: Project,
  graph: EvidenceGraph = getGraph(),
): { href: string; label: string; pinned: boolean } | null {
  if (!project.repo) return null;

  const repoSource = graph.sources.find(
    (s) => s.type === "github_repo" && s.repo === project.repo && s.url && s.commitSha,
  );
  if (repoSource?.url && repoSource.commitSha) {
    return {
      href: repoSource.url,
      label: `${project.repo} @${repoSource.commitSha.slice(0, 7)}`,
      pinned: true,
    };
  }

  const fileSource = graph.sources.find(
    (s) => s.type === "github_file" && s.repo === project.repo && s.url && s.commitSha,
  );
  if (fileSource?.url && fileSource.commitSha) {
    return {
      href: fileSource.url,
      label: `${project.repo} @${fileSource.commitSha.slice(0, 7)}`,
      pinned: true,
    };
  }

  return {
    href: `https://github.com/${project.repo}`,
    label: `${project.repo} (default branch — unpinned)`,
    pinned: false,
  };
}

export function getSourcesForIds(ids: string[], graph: EvidenceGraph = getGraph()) {
  return ids
    .map((id) => graph.sources.find((s) => s.id === id))
    .filter((s): s is EvidenceGraph["sources"][number] => Boolean(s));
}
