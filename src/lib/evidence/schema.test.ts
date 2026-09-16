import { describe, expect, it } from "vitest";
import { EvidenceGraphSchema } from "@/lib/evidence/schema";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";

function cloneGraph() {
  return structuredClone(loadEvidenceGraph());
}

function expectRejects(graph: unknown, messagePart: string) {
  const result = EvidenceGraphSchema.safeParse(graph);
  expect(result.success).toBe(false);
  if (result.success) return;
  const messages = result.error.issues.map((i) => i.message).join(" | ");
  expect(messages).toMatch(new RegExp(messagePart, "i"));
}

describe("EvidenceGraphSchema — fail-first contracts", () => {
  it("accepts the canonical corpus", () => {
    const parsed = EvidenceGraphSchema.parse(loadEvidenceGraph());
    expect(parsed.projects).toHaveLength(10);
  });

  it("rejects duplicate project slugs", () => {
    const graph = cloneGraph();
    graph.projects[1].slug = graph.projects[0].slug;
    expectRejects(graph, "Duplicate project slug");
  });

  it("rejects duplicate education ids", () => {
    const graph = cloneGraph();
    expect(graph.education.length).toBeGreaterThanOrEqual(2);
    graph.education[1].id = graph.education[0].id;
    expectRejects(graph, "Duplicate education");
  });

  it("rejects duplicate experience ids", () => {
    const graph = cloneGraph();
    graph.experience.push({ ...graph.experience[0], id: graph.experience[0].id });
    expectRejects(graph, "Duplicate experience");
  });

  it("rejects GitHub sources with short commitSha", () => {
    const graph = cloneGraph();
    const github = graph.sources.find((s) => s.type === "github_repo");
    expect(github).toBeDefined();
    github!.commitSha = "abc1234";
    expectRejects(graph, "40-char");
  });

  it("rejects GitHub sources missing url", () => {
    const graph = cloneGraph();
    const github = graph.sources.find((s) => s.type === "github_file");
    expect(github).toBeDefined();
    delete github!.url;
    expectRejects(graph, "require url");
  });

  it("rejects GitHub sources missing commitSha", () => {
    const graph = cloneGraph();
    const github = graph.sources.find((s) => s.type === "github_repo");
    expect(github).toBeDefined();
    delete github!.commitSha;
    expectRejects(graph, "commitSha");
  });

  it("rejects projects with no linked nodes", () => {
    const graph = cloneGraph();
    graph.projects.push({
      id: "proj.orphan-test",
      slug: "orphan-test-unique",
      title: "Orphan",
      tier: "archive",
      evidenceState: "LIMITED_EVIDENCE",
      summary: "Should fail validation",
      themes: [],
    });
    expectRejects(graph, "no linked evidence nodes");
  });

  it("rejects node referencing missing source", () => {
    const graph = cloneGraph();
    graph.nodes[0].sourceIds = ["src.does-not-exist"];
    expectRejects(graph, "missing source");
  });

  it("rejects excluded email reintroduced in corpus text", () => {
    const graph = cloneGraph();
    const banned = graph.exclusions.emails[0];
    expect(banned).toBeTruthy();
    graph.profile.proposition = `Contact legacy ${banned}`;
    expectRejects(graph, "Excluded email");
  });

  it("rejects excluded profile token reintroduced in corpus text", () => {
    const graph = cloneGraph();
    const banned = graph.exclusions.profiles[0];
    expect(banned).toBeTruthy();
    graph.projects[0].summary = `Related to ${banned} somehow`;
    expectRejects(graph, "Excluded profile");
  });

  it("rejects canonical email listed in exclusions", () => {
    const graph = cloneGraph();
    graph.exclusions.emails.push(graph.profile.email);
    expectRejects(graph, "must not appear in exclusions");
  });
});
