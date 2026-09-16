/**
 * Failure Museum exhibit schema (M14).
 * Proof outranks narrative — incomplete exhibits cannot publish.
 */

import { z } from "zod";
import { EvidenceStateSchema } from "@/lib/evidence/schema";

export const FailureArtifactKindSchema = z.enum([
  "github_file",
  "github_repo",
  "report",
  "project_artifact",
]);

export const FailureArtifactSchema = z
  .object({
    id: z.string().min(1),
    kind: FailureArtifactKindSchema,
    title: z.string().min(1),
    repo: z.string().min(1).optional(),
    path: z.string().min(1).optional(),
    commitSha: z
      .string()
      .regex(/^[a-f0-9]{40}$/i, "commitSha must be a full 40-char hex SHA")
      .optional(),
    url: z.string().url().optional(),
    note: z.string().optional(),
  })
  .superRefine((artifact, ctx) => {
    const isGithub = artifact.kind === "github_file" || artifact.kind === "github_repo";
    if (isGithub && !artifact.repo) {
      ctx.addIssue({
        code: "custom",
        message: "GitHub artifacts require repo",
        path: ["repo"],
      });
    }
    if (artifact.kind === "github_file" && !artifact.path) {
      ctx.addIssue({
        code: "custom",
        message: "github_file artifacts require path",
        path: ["path"],
      });
    }
    if (isGithub && !artifact.commitSha) {
      ctx.addIssue({
        code: "custom",
        message: "GitHub artifacts require immutable commitSha",
        path: ["commitSha"],
      });
    }
    if (isGithub && !artifact.url) {
      ctx.addIssue({
        code: "custom",
        message: "GitHub artifacts require url at the fingerprinted revision",
        path: ["url"],
      });
    }
    if (
      (artifact.kind === "report" || artifact.kind === "project_artifact") &&
      !artifact.url
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${artifact.kind} artifacts require a public url`,
        path: ["url"],
      });
    }
  });

export const FailureClaimedMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  /** Must reference an artifact id on the same exhibit. */
  artifactId: z.string().min(1),
});

export const FailureExhibitSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    projectSlug: z.string().min(1).optional(),
    evidenceState: EvidenceStateSchema,
    artifacts: z.array(FailureArtifactSchema).default([]),
    claimedMetrics: z.array(FailureClaimedMetricSchema).default([]),
    publicationStatus: z.enum(["draft", "published"]),
  })
  .superRefine((exhibit, ctx) => {
    if (exhibit.publicationStatus !== "published") return;

    if (exhibit.artifacts.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Published exhibits require at least one artifact-grade source",
        path: ["artifacts"],
      });
    }

    if (
      exhibit.evidenceState === "NOT_DEMONSTRATED" ||
      exhibit.evidenceState === "PORTFOLIO_EXTENSION"
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Published exhibits cannot use NOT_DEMONSTRATED or PORTFOLIO_EXTENSION as proof state",
        path: ["evidenceState"],
      });
    }

    const artifactIds = new Set(exhibit.artifacts.map((a) => a.id));
    for (const [index, metric] of exhibit.claimedMetrics.entries()) {
      if (!artifactIds.has(metric.artifactId)) {
        ctx.addIssue({
          code: "custom",
          message: `claimedMetrics[${index}] artifactId is not on this exhibit`,
          path: ["claimedMetrics", index, "artifactId"],
        });
      }
    }
  });

export type FailureArtifact = z.infer<typeof FailureArtifactSchema>;
export type FailureClaimedMetric = z.infer<typeof FailureClaimedMetricSchema>;
export type FailureExhibit = z.infer<typeof FailureExhibitSchema>;
