import { createHash } from "node:crypto";
import { z } from "zod";
import type { EvidenceGraph } from "./schema";
import {
  EvidenceEdgeSchema,
  EvidenceNodeSchema,
  EvidenceStateSchema,
  ProjectRecordSchema,
  PublicProfileSchema,
  EducationRecordSchema,
  ExperienceRecordSchema,
  SourceTypeSchema,
} from "./schema";
import { loadEvidenceGraph } from "./load-graph";

/** Manifest schema id — derived projection, not the repo graph. */
export const PUBLIC_EVIDENCE_SCHEMA_ID = "anish-runtime.evidence.public";
export const PUBLIC_EVIDENCE_SCHEMA_VERSION = 1 as const;

export const PublicSourceProjectionSchema = z.object({
  id: z.string().min(1),
  type: SourceTypeSchema,
  title: z.string().optional(),
  repo: z.string().optional(),
  path: z.string().optional(),
  commitSha: z.string().optional(),
  url: z.string().url().optional(),
  note: z.string().optional(),
  fingerprint: z.string().min(16),
});

export const PublicEvidenceManifestSchema = z
  .object({
    schema: z.literal(PUBLIC_EVIDENCE_SCHEMA_ID),
    schemaVersion: z.literal(PUBLIC_EVIDENCE_SCHEMA_VERSION),
    authority: z.literal(
      "Repository Evidence Graph is authoritative. This file is a derived public projection.",
    ),
    graphVersion: z.literal(1),
    profile: PublicProfileSchema,
    education: z.array(EducationRecordSchema),
    experience: z.array(ExperienceRecordSchema),
    projects: z.array(ProjectRecordSchema),
    nodes: z.array(EvidenceNodeSchema),
    edges: z.array(EvidenceEdgeSchema),
    metrics: z.array(EvidenceNodeSchema),
    sources: z.array(PublicSourceProjectionSchema),
    stats: z.object({
      projects: z.number().int().nonnegative(),
      nodes: z.number().int().nonnegative(),
      edges: z.number().int().nonnegative(),
      sources: z.number().int().nonnegative(),
      metrics: z.number().int().nonnegative(),
      byTier: z.object({
        flagship: z.number().int().nonnegative(),
        supporting: z.number().int().nonnegative(),
        archive: z.number().int().nonnegative(),
      }),
    }),
  })
  .superRefine((manifest, ctx) => {
    const blob = JSON.stringify(manifest).toLowerCase();
    // Hard exclusions from the canonical graph must never appear in the public projection.
    // We load them from the live graph at refine time via closure — callers must pass check separately
    // when validating offline; buildPublicEvidenceManifest always runs exclusionScan.
    if (blob.includes("anishakode2002@gmail.com")) {
      ctx.addIssue({
        code: "custom",
        message: "Public manifest must not contain obsolete email",
      });
    }
    if (blob.includes("sricons-conflict") || blob.includes("sricons")) {
      ctx.addIssue({
        code: "custom",
        message: "Public manifest must not contain excluded profile tokens",
      });
    }
    for (const source of manifest.sources) {
      if (
        (source.type === "github_file" || source.type === "github_repo") &&
        (!source.commitSha || !/^[a-f0-9]{40}$/i.test(source.commitSha))
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Public GitHub source ${source.id} missing full commitSha fingerprint`,
        });
      }
    }
  });

export type PublicEvidenceManifest = z.infer<typeof PublicEvidenceManifestSchema>;

export function fingerprintSource(source: {
  type: string;
  repo?: string;
  path?: string;
  commitSha?: string;
  url?: string;
}): string {
  const payload = JSON.stringify({
    type: source.type,
    repo: source.repo ?? null,
    path: source.path ?? null,
    commitSha: source.commitSha ?? null,
    url: source.url ?? null,
  });
  return createHash("sha256").update(payload).digest("hex");
}

/**
 * Derive the public Evidence Manifest from the canonical graph.
 * Repository fragments remain authoritative.
 */
export function buildPublicEvidenceManifest(
  graph: EvidenceGraph = loadEvidenceGraph(),
): PublicEvidenceManifest {
  const sources = graph.sources.map((source) => ({
    id: source.id,
    type: source.type,
    title: source.title,
    repo: source.repo,
    path: source.path,
    commitSha: source.commitSha,
    url: source.url,
    note: source.note,
    fingerprint: fingerprintSource(source),
  }));

  const metrics = graph.nodes.filter((n) => n.kind === "metric");

  const manifest = {
    schema: PUBLIC_EVIDENCE_SCHEMA_ID,
    schemaVersion: PUBLIC_EVIDENCE_SCHEMA_VERSION,
    authority:
      "Repository Evidence Graph is authoritative. This file is a derived public projection." as const,
    graphVersion: 1 as const,
    profile: graph.profile,
    education: graph.education,
    experience: graph.experience,
    projects: graph.projects,
    nodes: graph.nodes,
    edges: graph.edges,
    metrics,
    sources,
    stats: {
      projects: graph.projects.length,
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      sources: sources.length,
      metrics: metrics.length,
      byTier: {
        flagship: graph.projects.filter((p) => p.tier === "flagship").length,
        supporting: graph.projects.filter((p) => p.tier === "supporting").length,
        archive: graph.projects.filter((p) => p.tier === "archive").length,
      },
    },
  };

  assertManifestExclusions(manifest, graph);
  return PublicEvidenceManifestSchema.parse(manifest);
}

function assertManifestExclusions(manifest: unknown, graph: EvidenceGraph): void {
  const blob = JSON.stringify(manifest).toLowerCase();
  for (const email of graph.exclusions.emails) {
    if (blob.includes(email.toLowerCase())) {
      throw new Error(`Public manifest leaked excluded email: ${email}`);
    }
  }
  for (const profile of graph.exclusions.profiles) {
    if (blob.includes(profile.toLowerCase())) {
      throw new Error(`Public manifest leaked excluded profile: ${profile}`);
    }
  }
}

/** Re-export for consumers that only need the state vocabulary on the wire. */
export { EvidenceStateSchema };
