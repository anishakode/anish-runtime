import { describe, expect, it } from "vitest";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";
import {
  buildPublicEvidenceManifest,
  fingerprintSource,
  PUBLIC_EVIDENCE_SCHEMA_ID,
  PUBLIC_EVIDENCE_SCHEMA_VERSION,
  PublicEvidenceManifestSchema,
} from "@/lib/evidence/public-manifest";

describe("public evidence manifest (M3.5)", () => {
  const graph = loadEvidenceGraph();
  const manifest = buildPublicEvidenceManifest(graph);

  it("is a derived projection with schema markers", () => {
    expect(manifest.schema).toBe(PUBLIC_EVIDENCE_SCHEMA_ID);
    expect(manifest.schemaVersion).toBe(PUBLIC_EVIDENCE_SCHEMA_VERSION);
    expect(manifest.authority).toMatch(/derived public projection/i);
    expect(manifest.graphVersion).toBe(1);
    expect(() => PublicEvidenceManifestSchema.parse(manifest)).not.toThrow();
  });

  it("mirrors canonical graph scale without inventing nodes", () => {
    expect(manifest.projects).toHaveLength(graph.projects.length);
    expect(manifest.nodes).toHaveLength(graph.nodes.length);
    expect(manifest.edges).toHaveLength(graph.edges.length);
    expect(manifest.sources).toHaveLength(graph.sources.length);
    expect(manifest.stats.byTier.flagship).toBe(3);
    expect(manifest.metrics.every((m) => m.kind === "metric")).toBe(true);
  });

  it("fingerprints every public source and keeps GitHub SHAs", () => {
    for (const source of manifest.sources) {
      expect(source.fingerprint).toMatch(/^[a-f0-9]{64}$/);
      const original = graph.sources.find((s) => s.id === source.id);
      expect(original).toBeDefined();
      expect(source.fingerprint).toBe(fingerprintSource(original!));
      if (source.type === "github_file" || source.type === "github_repo") {
        expect(source.commitSha).toMatch(/^[a-f0-9]{40}$/i);
        expect(source.url).toContain(source.commitSha!);
      }
    }
  });

  it("does not leak excluded identity into the public projection", () => {
    const blob = JSON.stringify(manifest);
    expect(blob).not.toContain("anishakode2002@gmail.com");
    expect(blob.toLowerCase()).not.toContain("sricons");
    expect(manifest.profile.email).toBe("anishakode3101@gmail.com");
  });

  it("fails closed if an excluded email is injected into profile copy", () => {
    const poisoned = structuredClone(graph);
    poisoned.profile.proposition = `Reach me at ${graph.exclusions.emails[0]}`;
    expect(() => buildPublicEvidenceManifest(poisoned)).toThrow(/excluded email/i);
  });
});
