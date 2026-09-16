import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";
import { EVIDENCE_STATES } from "@/lib/evidence/states";
import {
  EVIDENCE_STRENGTH,
  FREEZE_SCHEMA_ID,
  FREEZE_SCHEMA_VERSION,
  assertStrengthCoversAllStates,
  buildClaimSet,
  buildFreezeManifest,
  corpusDigest,
  isStrengthening,
  ownerOnlyClaims,
  verifyFreeze,
  type ChangeControlEntry,
  type Claim,
  type FreezeManifest,
} from "@/lib/freeze";

const graph = loadEvidenceGraph();
const claims = buildClaimSet(graph);

function freeze(of: Claim[] = claims): FreezeManifest {
  return buildFreezeManifest(of, {
    status: "PENDING_OWNER_CONFIRMATION",
    frozenAt: "2026-09-16",
  });
}

/** A deep copy so a mutation in one test cannot leak into another. */
function edited(mutate: (claims: Claim[]) => void): Claim[] {
  const copy = claims.map((claim) => ({ ...claim, evidence: [...claim.evidence] }));
  mutate(copy);
  return copy;
}

describe("claim projection (M25)", () => {
  it("claims every public surface the handoff lists", () => {
    const kinds = new Set(claims.map((claim) => claim.kind));
    for (const kind of [
      "identity",
      "education",
      "experience",
      "impact_metric",
      "project",
      "evidence_node",
      "source",
      "exclusion",
      "corpus",
    ]) {
      expect(kinds, `no ${kind} claims`).toContain(kind);
    }
  });

  it("gives every claim a unique id", () => {
    const ids = claims.map((claim) => claim.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every project, source, and non-metric node exactly once", () => {
    const count = (kind: string) => claims.filter((c) => c.kind === kind).length;
    expect(count("project")).toBe(graph.projects.length);
    expect(count("source")).toBe(graph.sources.length);
    expect(count("impact_metric")).toBe(
      graph.nodes.filter((n) => n.kind === "metric").length,
    );
    expect(count("evidence_node")).toBe(
      graph.nodes.filter((n) => n.kind !== "metric").length,
    );
  });

  it("claims the identity facts a reader would hold Anish to", () => {
    const statements = claims
      .filter((claim) => claim.kind === "identity")
      .map((claim) => claim.statement);
    expect(statements).toContain(`name is "${graph.profile.name}"`);
    expect(statements).toContain(`email is "${graph.profile.email}"`);
    expect(statements).toContain(`location is "${graph.profile.location}"`);
    expect(statements).toContain(`github is "${graph.profile.links.github}"`);
  });

  it("records the commit pin as part of a source claim", () => {
    const pinned = graph.sources.find((source) => source.commitSha);
    const claim = claims.find((c) => c.id === `source:${pinned!.id}`);
    expect(claim?.statement).toContain(pinned!.commitSha);
  });

  it("says plainly when a source has no commit pin", () => {
    const unpinned = graph.sources.filter((source) => !source.commitSha);
    for (const source of unpinned) {
      const claim = claims.find((c) => c.id === `source:${source.id}`);
      expect(claim?.statement).toContain("no commit pin");
    }
    // Only owner/résumé/portfolio-runtime sources may be unpinned.
    for (const source of unpinned) {
      expect(["owner_confirmation", "resume", "portfolio_runtime"]).toContain(
        source.type,
      );
    }
  });

  it("digests the meaning, not the key order", () => {
    const reordered = buildClaimSet({
      ...graph,
      projects: [...graph.projects].reverse(),
      nodes: [...graph.nodes].reverse(),
    });
    expect(corpusDigest(reordered)).toBe(corpusDigest(claims));
  });

  it("changes the digest when a claim's substance changes", () => {
    const weaker = buildClaimSet({
      ...graph,
      projects: graph.projects.map((project, index) =>
        index === 0 ? { ...project, summary: "Something else entirely." } : project,
      ),
    });
    expect(corpusDigest(weaker)).not.toBe(corpusDigest(claims));
  });

  it("names the claims that rest on the owner's word alone", () => {
    const ownerOnly = ownerOnlyClaims(claims);
    const ids = ownerOnly.map((claim) => claim.id);
    // Cardstack impact metrics are the canonical example: proprietary, unverifiable.
    expect(ids).toContain("impact_metric:ev.cardstack.api-defects");
    // A public repository claim must never appear in that list.
    expect(ids).not.toContain("project:proj.mlops-governance");
  });
});

describe("evidence strength ranking (M25)", () => {
  it("ranks every state in the vocabulary", () => {
    expect(() => assertStrengthCoversAllStates()).not.toThrow();
    expect(Object.keys(EVIDENCE_STRENGTH).sort()).toEqual([...EVIDENCE_STATES].sort());
  });

  it("treats verified as stronger than owner-confirmed, résumé, and limited", () => {
    expect(isStrengthening("LIMITED_EVIDENCE", "PUBLIC_CODE_VERIFIED")).toBe(true);
    expect(isStrengthening("RESUME_DOCUMENTED", "PUBLIC_DOCUMENT_VERIFIED")).toBe(true);
    expect(isStrengthening("NOT_DEMONSTRATED", "PORTFOLIO_EXTENSION")).toBe(true);
  });

  it("treats weakening and no change as allowed directions", () => {
    expect(isStrengthening("PUBLIC_CODE_VERIFIED", "LIMITED_EVIDENCE")).toBe(false);
    expect(isStrengthening("PORTFOLIO_EXTENSION", "NOT_DEMONSTRATED")).toBe(false);
    expect(isStrengthening("RESUME_DOCUMENTED", "RESUME_DOCUMENTED")).toBe(false);
  });
});

describe("freeze verification (M25)", () => {
  it("passes when nothing has moved", () => {
    const result = verifyFreeze(claims, freeze());
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.currentDigest).toBe(freeze().corpusDigest);
  });

  it("fails when a claim's wording changes", () => {
    const manifest = freeze();
    const changed = edited((all) => {
      const target = all.find((c) => c.id === "project:proj.mlops-governance")!;
      target.statement = "MLOps Governance Dashboard — used in production at scale";
      target.digest = "deadbeefdeadbeef";
    });

    const result = verifyFreeze(changed, manifest);
    expect(result.ok).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].kind).toBe("CHANGED");
    expect(result.violations[0].claimId).toBe("project:proj.mlops-governance");
  });

  it("reports a stronger evidence state as STRENGTHENED, not a plain change", () => {
    const manifest = freeze();
    const upgraded = edited((all) => {
      const target = all.find((c) => c.id === "evidence_node:ev.malware.shap-limited")!;
      target.evidenceState = "PUBLIC_CODE_VERIFIED";
      target.digest = "0000111122223333";
    });

    const result = verifyFreeze(upgraded, manifest);
    expect(result.ok).toBe(false);
    expect(result.violations[0].kind).toBe("STRENGTHENED");
    expect(result.violations[0].detail).toContain("LIMITED_EVIDENCE");
    expect(result.violations[0].detail).toContain("PUBLIC_CODE_VERIFIED");
  });

  it("fails when a frozen claim disappears", () => {
    const manifest = freeze();
    const removed = claims.filter((c) => c.id !== "identity:email");

    const result = verifyFreeze(removed, manifest);
    expect(result.ok).toBe(false);
    expect(result.violations[0].kind).toBe("REMOVED");
    expect(result.violations[0].claimId).toBe("identity:email");
  });

  it("fails when a new public claim appears outside the freeze", () => {
    const manifest = freeze();
    const added: Claim[] = [
      ...claims,
      {
        id: "project:proj.invented",
        kind: "project",
        statement: "Invented Project (flagship) — shipped to millions",
        evidenceState: "PUBLIC_CODE_VERIFIED",
        evidence: [],
        digest: "abcabcabcabcabca",
      },
    ];

    const result = verifyFreeze(added, manifest);
    expect(result.ok).toBe(false);
    expect(result.violations[0].kind).toBe("ADDED");
    expect(result.violations[0].detail).toContain("Invented Project");
  });

  it("accepts a change that change control records", () => {
    const manifest = freeze();
    const before = manifest.claims["identity:location"].digest;
    const moved = edited((all) => {
      const target = all.find((c) => c.id === "identity:location")!;
      target.statement = 'location is "London, UK"';
      target.digest = "1111222233334444";
    });

    manifest.changeControl = [
      {
        date: "2026-09-20",
        claimId: "identity:location",
        from: before,
        to: "1111222233334444",
        owner: "Anish Akode",
        reason: "Relocated.",
      },
    ];

    const result = verifyFreeze(moved, manifest);
    expect(result.ok).toBe(true);
    expect(result.accepted).toEqual(["identity:location changed (Relocated.)"]);
  });

  it("refuses a change-control entry that does not match the actual change", () => {
    const manifest = freeze();
    const moved = edited((all) => {
      const target = all.find((c) => c.id === "identity:location")!;
      target.digest = "1111222233334444";
    });

    manifest.changeControl = [
      {
        date: "2026-09-20",
        claimId: "identity:location",
        from: "some-other-digest",
        to: "1111222233334444",
        owner: "Anish Akode",
        reason: "Backdated entry that does not describe this edit.",
      },
    ];

    expect(verifyFreeze(moved, manifest).ok).toBe(false);
  });

  it("refuses a strengthening that records no new evidence", () => {
    const manifest = freeze();
    const id = "evidence_node:ev.malware.shap-limited";
    const before = manifest.claims[id].digest;
    const upgraded = edited((all) => {
      const target = all.find((c) => c.id === id)!;
      target.evidenceState = "PUBLIC_CODE_VERIFIED";
      target.digest = "5555666677778888";
    });

    const entry: ChangeControlEntry = {
      date: "2026-09-20",
      claimId: id,
      from: before,
      to: "5555666677778888",
      owner: "Anish Akode",
      reason: "Looks stronger now.",
    };
    manifest.changeControl = [entry];

    // A reason is not evidence.
    const withoutProof = verifyFreeze(upgraded, manifest);
    expect(withoutProof.ok).toBe(false);
    expect(withoutProof.violations[0].kind).toBe("STRENGTHENED");
    expect(withoutProof.violations[0].detail).toContain("not the evidence");

    // Naming the wrong transition is not evidence either.
    manifest.changeControl = [
      {
        ...entry,
        strengthening: {
          from: "RESUME_DOCUMENTED",
          to: "PUBLIC_CODE_VERIFIED",
          newEvidence: ["src.malware.repo"],
        },
      },
    ];
    expect(verifyFreeze(upgraded, manifest).ok).toBe(false);

    // With the real transition and a source, it is allowed.
    manifest.changeControl = [
      {
        ...entry,
        strengthening: {
          from: "LIMITED_EVIDENCE",
          to: "PUBLIC_CODE_VERIFIED",
          newEvidence: ["src.malware.repo"],
        },
      },
    ];
    expect(verifyFreeze(upgraded, manifest).ok).toBe(true);
  });

  it("allows weakening without ceremony but still records it", () => {
    const manifest = freeze();
    const id = "project:proj.fraud-detection";
    const before = manifest.claims[id].digest;
    const weakened = edited((all) => {
      const target = all.find((c) => c.id === id)!;
      target.evidenceState = "LIMITED_EVIDENCE";
      target.digest = "9999888877776666";
    });

    // Still a change, so it is still refused until recorded …
    expect(verifyFreeze(weakened, manifest).ok).toBe(false);

    // … but recording it needs no strengthening proof.
    manifest.changeControl = [
      {
        date: "2026-09-20",
        claimId: id,
        from: before,
        to: "9999888877776666",
        owner: "Anish Akode",
        reason: "Repository archived; downgrading the claim.",
      },
    ];
    expect(verifyFreeze(weakened, manifest).ok).toBe(true);
  });

  it("rejects a manifest it cannot read", () => {
    const manifest = freeze();
    expect(verifyFreeze(claims, { ...manifest, schema: "something-else" }).ok).toBe(
      false,
    );
    expect(verifyFreeze(claims, { ...manifest, schemaVersion: 99 }).ok).toBe(false);
  });
});

describe("committed freeze manifest (M25)", () => {
  const manifest = JSON.parse(
    readFileSync(join(process.cwd(), "content", "evidence", "freeze.json"), "utf8"),
  ) as FreezeManifest;

  it("matches the live corpus", () => {
    const result = verifyFreeze(claims, manifest);
    expect(result.violations).toEqual([]);
    expect(manifest.corpusDigest).toBe(corpusDigest(claims));
  });

  it("is a manifest this code can read", () => {
    expect(manifest.schema).toBe(FREEZE_SCHEMA_ID);
    expect(manifest.schemaVersion).toBe(FREEZE_SCHEMA_VERSION);
    expect(Object.keys(manifest.claims)).toHaveLength(claims.length);
  });

  it("states honestly whether the owner has confirmed the corpus", () => {
    expect(["PENDING_OWNER_CONFIRMATION", "OWNER_CONFIRMED"]).toContain(manifest.status);
  });
});
