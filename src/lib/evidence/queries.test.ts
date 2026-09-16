import { describe, expect, it } from "vitest";
import {
  displayHostPath,
  getPinnedRepoLink,
  getProjectBySlug,
  getProjectsByTier,
  getProfile,
  getSourcesForIds,
  getNodesForProject,
} from "@/lib/evidence/queries";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";

describe("evidence queries — strict contracts", () => {
  it("resolves profile and exact project slug map", () => {
    const profile = getProfile();
    expect(profile.name).toBe("Anish Akode");
    expect(profile.email).toBe("anishakode3101@gmail.com");
    expect(getProjectBySlug("mlops-governance-dashboard")?.title).toBe(
      "MLOps Governance Dashboard",
    );
    const tiers = getProjectsByTier();
    expect(tiers.flagship.map((p) => p.slug).sort()).toEqual(
      [
        "explainable-pdf-malware-detection",
        "mlops-governance-dashboard",
        "steward-ai",
      ].sort(),
    );
    expect(tiers.supporting).toHaveLength(3);
    expect(tiers.archive).toHaveLength(4);
  });

  it("returns undefined for unknown slugs (404 contract)", () => {
    expect(getProjectBySlug("not-a-real-project")).toBeUndefined();
    expect(getProjectBySlug("")).toBeUndefined();
  });

  it("pins flagship repo links to fingerprinted tree URLs", () => {
    const project = getProjectBySlug("mlops-governance-dashboard");
    expect(project).toBeDefined();
    const link = getPinnedRepoLink(project!);
    expect(link).toEqual(
      expect.objectContaining({
        pinned: true,
        href: expect.stringMatching(
          /^https:\/\/github\.com\/anishakode\/MLOps-Governance-Dashboard\/tree\/[a-f0-9]{40}$/i,
        ),
        label: expect.stringMatching(/MLOps-Governance-Dashboard @[a-f0-9]{7}/i),
      }),
    );
    expect(link!.href.includes("tree/main") || link!.href.endsWith("/")).toBe(false);
  });

  it("marks missing fingerprints as unpinned (must not silently claim proof)", () => {
    const graph = loadEvidenceGraph();
    const fake = {
      ...graph.projects[0],
      id: "proj.fake-unpinned",
      slug: "fake-unpinned",
      repo: "anishakode/definitely-not-a-fingerprinted-repo",
    };
    const link = getPinnedRepoLink(fake, graph);
    expect(link?.pinned).toBe(false);
    expect(link?.label).toMatch(/unpinned/i);
    expect(link?.href).toBe(
      "https://github.com/anishakode/definitely-not-a-fingerprinted-repo",
    );
  });

  it("surfaces owner-confirmation notes for Cardstack metrics", () => {
    const graph = loadEvidenceGraph();
    const metric = graph.nodes.find((n) => n.id === "ev.cardstack.api-defects");
    expect(metric?.state).toBe("OWNER_CONFIRMED_PROFESSIONAL");
    const sources = getSourcesForIds(metric!.sourceIds, graph);
    expect(sources.some((s) => s.type === "owner_confirmation")).toBe(true);
    expect(sources.some((s) => s.note?.includes("Proprietary"))).toBe(true);
  });

  it("loads evidence nodes for every project slug used in routes", () => {
    const graph = loadEvidenceGraph();
    for (const project of graph.projects) {
      const nodes = getNodesForProject(project.id, graph);
      expect(nodes.length, `project ${project.slug} has nodes`).toBeGreaterThan(0);
    }
  });

  it("derives contact display paths from profile URLs only", () => {
    const profile = getProfile();
    expect(displayHostPath(profile.links.github)).toBe("github.com/anishakode");
    expect(displayHostPath(profile.links.linkedin)).toBe("linkedin.com/in/anishakode");
    expect(displayHostPath("not-a-url")).toBe("not-a-url");
  });
});
