import { describe, expect, it } from "vitest";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";

/**
 * The legend promises specific things:
 *   PUBLIC_CODE_VERIFIED     - "backed by public code at a fingerprinted revision"
 *   PUBLIC_DOCUMENT_VERIFIED - "backed by a public document or report"
 *
 * A README is a document. Nothing enforced that, so three capability nodes
 * carried the code-verified badge while their only trace was README.md or a
 * bare repository link — the badge promised code and the trace delivered
 * prose. An external cold read of the live site caught one of them; this
 * catches the class.
 */
const graph = loadEvidenceGraph();
const sourceById = new Map(graph.sources.map((source) => [source.id, source]));

/** A file in a repository that is not its README. */
function isCodeFile(sourceId: string): boolean {
  const source = sourceById.get(sourceId);
  if (!source || source.type !== "github_file") return false;
  return !/readme/i.test(source.path ?? "");
}

describe("evidence state is backed by the kind of source it advertises", () => {
  it("resolves every sourceId to a real source", () => {
    for (const node of graph.nodes) {
      for (const id of node.sourceIds) {
        expect(sourceById.has(id), `${node.id} cites unknown source ${id}`).toBe(true);
      }
    }
  });

  it("only lets a capability or boundary claim code-verified when a code file backs it", () => {
    // `project` nodes are exempt: "this repository exists and is public" is
    // legitimately evidenced by the repository itself. A *capability* is a
    // behaviour, and a behaviour needs the file that implements it.
    const claiming = graph.nodes.filter(
      (node) => node.state === "PUBLIC_CODE_VERIFIED" && node.kind !== "project",
    );
    expect(claiming.length).toBeGreaterThan(0);

    const unbacked = claiming.filter((node) => !node.sourceIds.some(isCodeFile));
    expect(
      unbacked.map((node) => `${node.id} (${node.kind})`),
      "claim code-verification but cite no non-README code file",
    ).toEqual([]);
  });

  it("keeps the Steward boundary at document-verified, where its README puts it", () => {
    // A stated boundary is a promise written in a document, not a behaviour
    // demonstrated by code. Pinned by id so it cannot drift back up.
    const boundary = graph.nodes.find((node) => node.id === "ev.steward.safety-boundary");
    expect(boundary?.state).toBe("PUBLIC_DOCUMENT_VERIFIED");
  });

  it("points the Steward and MLOps capabilities at the code that implements them", () => {
    // Regression pins for the three repointed nodes. Without these, dropping
    // back to the repo root or the README would only be caught by the general
    // rule above, which cannot say which file was meant.
    const expected: Record<string, string> = {
      "ev.steward.a2a": "a2a-agent/steward_agent/agent.py",
      "ev.steward.fhir": "mcp-server/tools/fhir_client.py",
      "ev.mlops.monitoring": "backend/app/api/monitoring.py",
    };

    for (const [nodeId, path] of Object.entries(expected)) {
      const node = graph.nodes.find((n) => n.id === nodeId);
      expect(node, `${nodeId} is missing`).toBeDefined();
      const paths = node!.sourceIds.map((id) => sourceById.get(id)?.path);
      expect(paths, `${nodeId} no longer cites ${path}`).toContain(path);
    }
  });

  it("pins every code source to a full commit SHA, not a branch", () => {
    // A path is only checkable if the revision is immutable.
    const files = graph.sources.filter((source) => source.type === "github_file");
    expect(files.length).toBeGreaterThan(0);

    for (const source of files) {
      expect(source.commitSha, `${source.id} has no commitSha`).toMatch(
        /^[a-f0-9]{40}$/i,
      );
      expect(source.url, `${source.id} url omits its commit`).toContain(
        source.commitSha!,
      );
    }
  });
});
