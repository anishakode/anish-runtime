/**
 * Constrained Signal ui_plan (M18).
 * Planner may pass component type + IDs + layout/emphasis only — never factual copy.
 */

import { z } from "zod";

export const UI_PLAN_COMPONENT_TYPES = [
  "EvidenceMap",
  "ProjectCard",
  "ArchitectureStrip",
  "MetricBlock",
  "SourceBadge",
  "Timeline",
  "Comparison",
  "GapNotice",
  "ExperienceCard",
  "SkillEvidence",
] as const;

export type UiPlanComponentType = (typeof UI_PLAN_COMPONENT_TYPES)[number];

export const UiPlanLayoutSchema = z.enum(["stack", "grid"]);
export const UiPlanEmphasisSchema = z.enum(["primary", "secondary", "muted"]);

const EvidenceIdSchema = z
  .string()
  .min(1)
  .regex(
    /^(profile|project|node|experience|education):.+/,
    "evidence id must be kind:id",
  );

const EvidenceMapBlockSchema = z
  .object({
    type: z.literal("EvidenceMap"),
    evidenceIds: z.array(EvidenceIdSchema).min(1).max(12),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const ProjectCardBlockSchema = z
  .object({
    type: z.literal("ProjectCard"),
    projectId: z.string().min(1),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const ArchitectureStripBlockSchema = z
  .object({
    type: z.literal("ArchitectureStrip"),
    projectId: z.string().min(1),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const MetricBlockSchema = z
  .object({
    type: z.literal("MetricBlock"),
    nodeId: z.string().min(1),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const SourceBadgeBlockSchema = z
  .object({
    type: z.literal("SourceBadge"),
    sourceId: z.string().min(1),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const TimelineBlockSchema = z
  .object({
    type: z.literal("Timeline"),
    experienceIds: z.array(z.string().min(1)).min(1).max(8),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const ComparisonBlockSchema = z
  .object({
    type: z.literal("Comparison"),
    evidenceIds: z.array(EvidenceIdSchema).min(2).max(6),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const GapNoticeBlockSchema = z
  .object({
    type: z.literal("GapNotice"),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const ExperienceCardBlockSchema = z
  .object({
    type: z.literal("ExperienceCard"),
    experienceId: z.string().min(1),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

const SkillEvidenceBlockSchema = z
  .object({
    type: z.literal("SkillEvidence"),
    nodeId: z.string().min(1),
    emphasis: UiPlanEmphasisSchema.optional(),
  })
  .strict();

export const UiPlanBlockSchema = z.discriminatedUnion("type", [
  EvidenceMapBlockSchema,
  ProjectCardBlockSchema,
  ArchitectureStripBlockSchema,
  MetricBlockSchema,
  SourceBadgeBlockSchema,
  TimelineBlockSchema,
  ComparisonBlockSchema,
  GapNoticeBlockSchema,
  ExperienceCardBlockSchema,
  SkillEvidenceBlockSchema,
]);

export const UiPlanSchema = z
  .object({
    version: z.literal(1),
    layout: UiPlanLayoutSchema,
    blocks: z.array(UiPlanBlockSchema).min(1).max(16),
  })
  .strict();

export type UiPlan = z.infer<typeof UiPlanSchema>;
export type UiPlanBlock = z.infer<typeof UiPlanBlockSchema>;

export type UiPlanValidation = { ok: true; plan: UiPlan } | { ok: false; error: string };

/** Validate a raw planner payload. Failure → full compose fallback (never partial). */
export function validateUiPlan(input: unknown): UiPlanValidation {
  const parsed = UiPlanSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.length ? issue.path.join(".") : "ui_plan";
    return {
      ok: false,
      error: `${path}: ${issue?.message ?? "invalid ui_plan"}`,
    };
  }
  return { ok: true, plan: parsed.data };
}

/** Reject plans that smuggle factual strings under unknown keys (strict already) or free text fields. */
export function assertPlanHasNoFactualAuthority(plan: UiPlan): UiPlanValidation {
  const forbiddenKeys = [
    "title",
    "summary",
    "evidenceState",
    "href",
    "metric",
    "html",
    "react",
    "copy",
    "label",
    "value",
  ];
  const raw = JSON.stringify(plan);
  for (const key of forbiddenKeys) {
    // Keys appear as "\"title\":" in JSON — planner must not include them.
    if (raw.includes(`"${key}"`)) {
      return {
        ok: false,
        error: `ui_plan must not include factual field "${key}" — software rehydrates facts`,
      };
    }
  }
  return { ok: true, plan };
}
