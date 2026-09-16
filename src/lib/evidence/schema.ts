import { z } from "zod";
import { EVIDENCE_STATES } from "./states";

export type { EvidenceState } from "./states";

/** Evidence strength vocabulary — never silently upgrade. */
export const EvidenceStateSchema = z.enum(EVIDENCE_STATES);

export const ProjectTierSchema = z.enum(["flagship", "supporting", "archive"]);

export const SourceTypeSchema = z.enum([
  "github_file",
  "github_repo",
  "report",
  "resume",
  "owner_confirmation",
  "project_artifact",
  "portfolio_runtime",
]);

export const EvidenceSourceSchema = z
  .object({
    id: z.string().min(1),
    type: SourceTypeSchema,
    title: z.string().min(1).optional(),
    repo: z.string().optional(),
    path: z.string().optional(),
    commitSha: z.string().min(7).optional(),
    url: z.string().url().optional(),
    note: z.string().optional(),
  })
  .superRefine((source, ctx) => {
    const isGithub = source.type === "github_file" || source.type === "github_repo";
    if (isGithub && !source.repo) {
      ctx.addIssue({
        code: "custom",
        message: "GitHub sources require repo",
        path: ["repo"],
      });
    }
    if (source.type === "github_file" && !source.path) {
      ctx.addIssue({
        code: "custom",
        message: "github_file sources require path",
        path: ["path"],
      });
    }
    if (isGithub && !source.commitSha) {
      ctx.addIssue({
        code: "custom",
        message: "GitHub sources require immutable commitSha",
        path: ["commitSha"],
      });
    }
    if (isGithub && source.commitSha && !/^[a-f0-9]{40}$/i.test(source.commitSha)) {
      ctx.addIssue({
        code: "custom",
        message: "GitHub commitSha must be a full 40-char hex SHA",
        path: ["commitSha"],
      });
    }
    if (isGithub && !source.url) {
      ctx.addIssue({
        code: "custom",
        message: "GitHub sources require url pointing at the fingerprinted revision",
        path: ["url"],
      });
    }
  });

export const EvidenceNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z
    .enum([
      "identity",
      "education",
      "experience",
      "metric",
      "skill",
      "capability",
      "project",
      "boundary",
      "artifact",
    ])
    .default("capability"),
  state: EvidenceStateSchema,
  projectId: z.string().optional(),
  experienceId: z.string().optional(),
  educationId: z.string().optional(),
  sourceIds: z.array(z.string()).default([]),
  aliases: z.array(z.string()).default([]),
  summary: z.string().optional(),
});

export const EvidenceEdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  type: z.enum([
    "demonstrates",
    "uses_skill",
    "supported_by",
    "part_of",
    "related_to",
    "bounded_by",
    "derived_from",
  ]),
});

export const PublicProfileSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  email: z.string().email(),
  positioning: z.string().min(1),
  tagline: z.string().min(1),
  proposition: z.string().min(1),
  links: z.object({
    github: z.string().url(),
    linkedin: z.string().url(),
  }),
});

export const EducationRecordSchema = z.object({
  id: z.string().min(1),
  degree: z.string().min(1),
  institution: z.string().min(1),
  detail: z.string().optional(),
  start: z.string().min(1),
  end: z.string().min(1),
  evidenceState: EvidenceStateSchema,
});

export const ExperienceRecordSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  technologies: z.array(z.string()).default([]),
  evidenceState: EvidenceStateSchema,
  impactMetricIds: z.array(z.string()).default([]),
});

export const ProjectRecordSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  tier: ProjectTierSchema,
  repo: z.string().optional(),
  evidenceState: EvidenceStateSchema,
  summary: z.string().min(1),
  themes: z.array(z.string()).default([]),
  homepage: z.string().url().optional(),
});

export const ExclusionsSchema = z.object({
  emails: z.array(z.string().email()).default([]),
  profiles: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
});

export const EvidenceGraphSchema = z
  .object({
    version: z.literal(1),
    profile: PublicProfileSchema,
    education: z.array(EducationRecordSchema),
    experience: z.array(ExperienceRecordSchema),
    projects: z.array(ProjectRecordSchema),
    nodes: z.array(EvidenceNodeSchema),
    edges: z.array(EvidenceEdgeSchema),
    sources: z.array(EvidenceSourceSchema),
    exclusions: ExclusionsSchema,
  })
  .superRefine((graph, ctx) => {
    const sourceIds = new Set(graph.sources.map((s) => s.id));
    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    const projectIds = new Set(graph.projects.map((p) => p.id));
    const experienceIds = new Set(graph.experience.map((e) => e.id));
    const educationIds = new Set(graph.education.map((e) => e.id));

    const dup = (ids: string[], label: string) => {
      const seen = new Set<string>();
      for (const id of ids) {
        if (seen.has(id)) {
          ctx.addIssue({ code: "custom", message: `Duplicate ${label} id: ${id}` });
        }
        seen.add(id);
      }
    };

    dup(
      graph.sources.map((s) => s.id),
      "source",
    );
    dup(
      graph.nodes.map((n) => n.id),
      "node",
    );
    dup(
      graph.edges.map((e) => e.id),
      "edge",
    );
    dup(
      graph.projects.map((p) => p.id),
      "project",
    );
    dup(
      graph.projects.map((p) => p.slug),
      "project slug",
    );
    dup(
      graph.education.map((e) => e.id),
      "education",
    );
    dup(
      graph.experience.map((e) => e.id),
      "experience",
    );

    for (const project of graph.projects) {
      const hasNode = graph.nodes.some((n) => n.projectId === project.id);
      if (!hasNode) {
        ctx.addIssue({
          code: "custom",
          message: `Project ${project.id} has no linked evidence nodes`,
        });
      }
    }

    const corpusText = JSON.stringify({
      profile: graph.profile,
      education: graph.education,
      experience: graph.experience,
      projects: graph.projects,
      nodes: graph.nodes,
      sources: graph.sources,
    }).toLowerCase();

    for (const email of graph.exclusions.emails) {
      if (corpusText.includes(email.toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          message: `Excluded email appears in corpus content: ${email}`,
        });
      }
    }

    for (const profile of graph.exclusions.profiles) {
      if (corpusText.includes(profile.toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          message: `Excluded profile token appears in corpus content: ${profile}`,
        });
      }
    }

    for (const node of graph.nodes) {
      for (const sid of node.sourceIds) {
        if (!sourceIds.has(sid)) {
          ctx.addIssue({
            code: "custom",
            message: `Node ${node.id} references missing source ${sid}`,
          });
        }
      }
      if (node.projectId && !projectIds.has(node.projectId)) {
        ctx.addIssue({
          code: "custom",
          message: `Node ${node.id} references missing project ${node.projectId}`,
        });
      }
      if (node.experienceId && !experienceIds.has(node.experienceId)) {
        ctx.addIssue({
          code: "custom",
          message: `Node ${node.id} references missing experience ${node.experienceId}`,
        });
      }
      if (node.educationId && !educationIds.has(node.educationId)) {
        ctx.addIssue({
          code: "custom",
          message: `Node ${node.id} references missing education ${node.educationId}`,
        });
      }
    }

    for (const edge of graph.edges) {
      if (
        !nodeIds.has(edge.from) &&
        !projectIds.has(edge.from) &&
        !experienceIds.has(edge.from)
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Edge ${edge.id} from-id not found: ${edge.from}`,
        });
      }
      if (
        !nodeIds.has(edge.to) &&
        !projectIds.has(edge.to) &&
        !experienceIds.has(edge.to)
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Edge ${edge.id} to-id not found: ${edge.to}`,
        });
      }
    }

    for (const exp of graph.experience) {
      for (const mid of exp.impactMetricIds) {
        if (!nodeIds.has(mid)) {
          ctx.addIssue({
            code: "custom",
            message: `Experience ${exp.id} impact metric missing: ${mid}`,
          });
        }
      }
    }

    if (graph.exclusions.emails.includes(graph.profile.email)) {
      ctx.addIssue({
        code: "custom",
        message: "Canonical profile email must not appear in exclusions.emails",
      });
    }
  });

export type EvidenceGraph = z.infer<typeof EvidenceGraphSchema>;

/** @deprecated Use EvidenceGraphSchema — kept name alias for M0 callers */
export const EvidenceGraphSkeletonSchema = EvidenceGraphSchema;
export type EvidenceGraphSkeleton = EvidenceGraph;
