import { describe, expect, it } from "vitest";
import { getEvidenceStats, loadEvidenceGraph } from "@/lib/evidence/load-graph";

describe("canonical Evidence Graph (M1)", () => {
  const graph = loadEvidenceGraph();
  const stats = getEvidenceStats(graph);

  it("loads a validated graph with expected scale", () => {
    expect(graph.version).toBe(1);
    expect(graph.projects).toHaveLength(10);
    expect(stats.byTier.flagship).toBe(3);
    expect(stats.byTier.supporting).toBe(3);
    expect(stats.byTier.archive).toBe(4);
    expect(graph.nodes.length).toBeGreaterThanOrEqual(35);
    expect(graph.edges.length).toBeGreaterThanOrEqual(35);
    expect(graph.sources.length).toBeGreaterThanOrEqual(18);
  });

  it("keeps canonical email and exclusions coherent", () => {
    expect(graph.profile.email).toBe("anishakode3101@gmail.com");
    expect(graph.exclusions.emails).toContain("anishakode2002@gmail.com");
    expect(graph.exclusions.emails).not.toContain(graph.profile.email);
    expect(graph.exclusions.profiles).toContain("sricons-conflict");
  });

  it("marks Cardstack metrics as owner-confirmed only", () => {
    for (const id of [
      "ev.cardstack.api-defects",
      "ev.cardstack.audit-failures",
      "ev.cardstack.incident-speed",
    ]) {
      const node = graph.nodes.find((n) => n.id === id);
      expect(node?.state).toBe("OWNER_CONFIRMED_PROFESSIONAL");
    }
  });

  it("labels MLOps runtime lab as portfolio extension", () => {
    const lab = graph.nodes.find((n) => n.id === "ev.mlops.runtime-lab");
    expect(lab?.state).toBe("PORTFOLIO_EXTENSION");
    const stewardLab = graph.nodes.find((n) => n.id === "ev.steward.runtime-lab");
    expect(stewardLab?.state).toBe("PORTFOLIO_EXTENSION");
    const malwareLab = graph.nodes.find((n) => n.id === "ev.malware.runtime-lab");
    expect(malwareLab?.state).toBe("PORTFOLIO_EXTENSION");
  });

  it("keeps malware SHAP detail limited", () => {
    const shap = graph.nodes.find((n) => n.id === "ev.malware.shap-limited");
    expect(shap?.state).toBe("LIMITED_EVIDENCE");
  });

  it("fingerprints flagship GitHub sources with commit SHAs", () => {
    const drift = graph.sources.find((s) => s.id === "src.mlops.drift-py");
    expect(drift?.commitSha).toMatch(/^[a-f0-9]{40}$/i);
    expect(drift?.path).toBe("backend/app/utils/drift.py");
  });

  it("keeps unique project slugs and requires nodes per project", () => {
    const slugs = graph.projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const project of graph.projects) {
      expect(graph.nodes.some((n) => n.projectId === project.id)).toBe(true);
    }
  });

  it("retains boundary honesty nodes even if UI-deferred", () => {
    expect(graph.nodes.some((n) => n.id === "ev.boundary.failure-museum-empty")).toBe(
      true,
    );
    expect(graph.nodes.some((n) => n.id === "ev.boundary.no-fit-scores")).toBe(true);
    expect(graph.nodes.find((n) => n.id === "ev.boundary.no-fit-scores")?.state).toBe(
      "NOT_DEMONSTRATED",
    );
  });

  it("requires every GitHub source to be SHA-pinned with url", () => {
    const github = graph.sources.filter(
      (s) => s.type === "github_file" || s.type === "github_repo",
    );
    expect(github.length).toBeGreaterThan(0);
    for (const source of github) {
      expect(source.commitSha).toMatch(/^[a-f0-9]{40}$/i);
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.url).toContain(source.commitSha!);
    }
  });
});
