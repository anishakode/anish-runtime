import { createHash } from "node:crypto";
import type { EvidenceGraph } from "@/lib/evidence/schema";
import type { EvidenceState } from "@/lib/evidence/states";

/**
 * Claim projection for the evidence freeze (M25).
 *
 * Handoff §44 asks what will be *publicly claimed* at launch. That is not the same
 * as the whole graph: a claim is anything a reader could hold Anish to — a fact, a
 * number, a tier, an evidence state, a fingerprint, an exclusion. Each one is
 * projected into a stable shape and hashed, so a freeze can detect a changed claim
 * without storing a second copy of the corpus.
 *
 * Every claim carries `evidence`: the source ids that answer "where is the
 * evidence?". A claim with an empty list is answerable only by the owner, and the
 * ledger reports it as such rather than implying proof.
 */

export type ClaimKind =
  | "identity"
  | "education"
  | "experience"
  | "impact_metric"
  | "project"
  | "evidence_node"
  | "source"
  | "exclusion"
  | "corpus";

export type Claim = {
  id: string;
  kind: ClaimKind;
  /** What is being claimed, in words, so the ledger is readable without the graph. */
  statement: string;
  evidenceState: EvidenceState | null;
  evidence: string[];
  /** Hash of the claim's meaning — changes when any projected field changes. */
  digest: string;
};

/** Stable stringify: key order can never change a digest. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export function digestOf(value: unknown): string {
  return createHash("sha256").update(canonical(value)).digest("hex").slice(0, 16);
}

/**
 * Ids are namespaced by kind because the same graph id is claimed in more than one
 * way — a metric node is both an impact claim and an evidence node.
 */
function claim(
  rawId: string,
  kind: ClaimKind,
  statement: string,
  evidenceState: EvidenceState | null,
  evidence: string[],
  payload: unknown,
): Claim {
  const id = `${kind}:${rawId}`;
  return {
    id,
    kind,
    statement,
    evidenceState,
    evidence: [...evidence].sort(),
    digest: digestOf({ id, kind, statement, evidenceState, payload }),
  };
}

export function buildClaimSet(graph: EvidenceGraph): Claim[] {
  const claims: Claim[] = [];
  const { profile } = graph;

  // Identity — the facts only the owner can vouch for.
  const identityNode = graph.nodes.find((n) => n.kind === "identity");
  const identityEvidence = identityNode?.sourceIds ?? [];
  const identityState = identityNode?.state ?? null;

  for (const [field, value] of [
    ["name", profile.name] as const,
    ["location", profile.location],
    ["email", profile.email],
    ["positioning", profile.positioning],
    ["tagline", profile.tagline],
    ["proposition", profile.proposition],
    ["github", profile.links.github],
    ["linkedin", profile.links.linkedin],
  ] as const) {
    claims.push(
      claim(
        field,
        "identity",
        `${field} is "${value}"`,
        identityState,
        identityEvidence,
        value,
      ),
    );
  }

  for (const entry of graph.education) {
    claims.push(
      claim(
        entry.id,
        "education",
        `${entry.degree}, ${entry.institution} (${entry.start}–${entry.end})${
          entry.detail ? ` — ${entry.detail}` : ""
        }`,
        entry.evidenceState,
        graph.nodes.find((n) => n.educationId === entry.id)?.sourceIds ?? [],
        entry,
      ),
    );
  }

  for (const role of graph.experience) {
    claims.push(
      claim(
        role.id,
        "experience",
        `${role.title} at ${role.company} (${role.start}–${role.end}), ${role.technologies.length} technologies`,
        role.evidenceState,
        graph.nodes.find((n) => n.experienceId === role.id && n.kind === "experience")
          ?.sourceIds ?? [],
        role,
      ),
    );
  }

  // Impact metrics are claims about professional outcomes and get their own kind:
  // they are the numbers a reader is most likely to challenge.
  for (const node of graph.nodes.filter((n) => n.kind === "metric")) {
    claims.push(
      claim(node.id, "impact_metric", node.title, node.state, node.sourceIds, {
        title: node.title,
        state: node.state,
        experienceId: node.experienceId ?? null,
      }),
    );
  }

  for (const project of graph.projects) {
    claims.push(
      claim(
        project.id,
        "project",
        `${project.title} (${project.tier}) — ${project.summary}`,
        project.evidenceState,
        graph.sources.filter((s) => s.repo === project.repo).map((s) => s.id),
        {
          slug: project.slug,
          title: project.title,
          tier: project.tier,
          repo: project.repo,
          evidenceState: project.evidenceState,
          summary: project.summary,
        },
      ),
    );
  }

  // Metric nodes are already claimed above as impact metrics.
  for (const node of graph.nodes.filter((n) => n.kind !== "metric")) {
    claims.push(
      claim(node.id, "evidence_node", node.title, node.state, node.sourceIds, {
        title: node.title,
        kind: node.kind,
        state: node.state,
        sourceIds: [...node.sourceIds].sort(),
        summary: node.summary ?? null,
      }),
    );
  }

  // A fingerprint is a claim: "this evidence is at this commit, at this path".
  for (const source of graph.sources) {
    claims.push(
      claim(
        source.id,
        "source",
        `${source.type}: ${source.title}${
          source.commitSha ? ` @ ${source.commitSha}` : " (no commit pin)"
        }`,
        null,
        [source.id],
        {
          type: source.type,
          repo: source.repo ?? null,
          path: source.path ?? null,
          url: source.url ?? null,
          commitSha: source.commitSha ?? null,
        },
      ),
    );
  }

  for (const email of graph.exclusions.emails) {
    claims.push(
      claim(
        `email.${email}`,
        "exclusion",
        `${email} is excluded from the public corpus`,
        null,
        [],
        email,
      ),
    );
  }
  for (const profileId of graph.exclusions.profiles) {
    claims.push(
      claim(
        `profile.${profileId}`,
        "exclusion",
        `profile "${profileId}" must not be introduced`,
        null,
        [],
        profileId,
      ),
    );
  }
  graph.exclusions.notes.forEach((note, index) => {
    claims.push(claim(`note.${index}`, "exclusion", note, null, [], note));
  });

  // Counts are claimed publicly through /evidence.json and the landing runtime.
  claims.push(
    claim(
      "counts",
      "corpus",
      `${graph.projects.length} projects · ${graph.nodes.length} nodes · ${graph.edges.length} edges · ${graph.sources.length} sources`,
      null,
      [],
      {
        projects: graph.projects.length,
        nodes: graph.nodes.length,
        edges: graph.edges.length,
        sources: graph.sources.length,
      },
    ),
  );

  return claims.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** One digest over every claim — the corpus fingerprint recorded at freeze. */
export function corpusDigest(claims: Claim[]): string {
  return digestOf(claims.map((c) => [c.id, c.digest]));
}
