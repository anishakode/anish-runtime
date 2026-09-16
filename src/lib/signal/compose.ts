/**
 * Adaptive Evidence Composer (M18).
 * Software owns facts — rehydrate ui_plan IDs from the Evidence Graph.
 * Invalid plan or failed rehydration → full fallback (no partial UI).
 */

import {
  ARCHITECTURE_PRODUCT_LABEL,
  MLOPS_ARCHITECTURE_STAGES,
} from "@/lib/architecture/stages";
import type { EvidenceGraph } from "@/lib/evidence/schema";
import type {
  ComposedView,
  RehydratedBlock,
  RehydratedEvidenceItem,
} from "./compose-types";
import type { SignalEvidenceCard } from "./types";
import {
  assertPlanHasNoFactualAuthority,
  validateUiPlan,
  type UiPlan,
  type UiPlanBlock,
} from "./ui-plan";

export type {
  ComposeStatus,
  ComposedView,
  RehydratedBlock,
  RehydratedEvidenceItem,
} from "./compose-types";
export { COMPOSE_FALLBACK_NOTICE } from "./compose-types";

export type ComposeResult =
  | {
      status: "composed";
      plan: UiPlan;
      composed: ComposedView;
      fallbackReason: null;
    }
  | {
      status: "fallback";
      plan: null;
      composed: null;
      fallbackReason: string;
    }
  | {
      status: "gap";
      plan: UiPlan;
      composed: ComposedView;
      fallbackReason: null;
    };

function resolveEvidenceItem(
  evidenceId: string,
  graph: EvidenceGraph,
): RehydratedEvidenceItem | null {
  const [kind, ...rest] = evidenceId.split(":");
  const id = rest.join(":");
  if (!kind || !id) return null;

  if (kind === "project") {
    const project = graph.projects.find((p) => p.id === id);
    if (!project) return null;
    return {
      id: evidenceId,
      title: project.title,
      kind: "project",
      evidenceState: project.evidenceState,
      summary: project.summary,
      href: `/work/${project.slug}`,
    };
  }
  if (kind === "node") {
    const node = graph.nodes.find((n) => n.id === id);
    if (!node) return null;
    const slug = node.projectId
      ? graph.projects.find((p) => p.id === node.projectId)?.slug
      : undefined;
    return {
      id: evidenceId,
      title: node.title,
      kind: "node",
      evidenceState: node.state,
      summary: node.summary ?? "",
      href: slug ? `/work/${slug}` : "/work",
    };
  }
  if (kind === "experience") {
    const exp = graph.experience.find((e) => e.id === id);
    if (!exp) return null;
    return {
      id: evidenceId,
      title: `${exp.title} · ${exp.company}`,
      kind: "experience",
      evidenceState: exp.evidenceState,
      summary: `${exp.start} – ${exp.end}`,
      href: "/experience",
    };
  }
  if (kind === "education") {
    const edu = graph.education.find((e) => e.id === id);
    if (!edu) return null;
    return {
      id: evidenceId,
      title: edu.degree,
      kind: "education",
      evidenceState: edu.evidenceState,
      summary: edu.institution,
      href: "/about",
    };
  }
  if (kind === "profile") {
    return {
      id: evidenceId,
      title: graph.profile.name,
      kind: "profile",
      evidenceState: "RESUME_DOCUMENTED",
      summary: graph.profile.positioning,
      href: "/about",
    };
  }
  return null;
}

function rehydrateBlock(
  block: UiPlanBlock,
  graph: EvidenceGraph,
): RehydratedBlock | { error: string } {
  switch (block.type) {
    case "EvidenceMap": {
      const items: RehydratedEvidenceItem[] = [];
      for (const id of block.evidenceIds) {
        const item = resolveEvidenceItem(id, graph);
        if (!item) return { error: `unknown evidence id: ${id}` };
        items.push(item);
      }
      return { type: "EvidenceMap", emphasis: block.emphasis, items };
    }
    case "ProjectCard": {
      const project = graph.projects.find((p) => p.id === block.projectId);
      if (!project) return { error: `unknown projectId: ${block.projectId}` };
      return {
        type: "ProjectCard",
        emphasis: block.emphasis,
        projectId: project.id,
        title: project.title,
        slug: project.slug,
        tier: project.tier,
        evidenceState: project.evidenceState,
        summary: project.summary,
        href: `/work/${project.slug}`,
        themes: project.themes ?? [],
      };
    }
    case "ArchitectureStrip": {
      if (block.projectId !== "proj.mlops-governance") {
        return {
          error: `ArchitectureStrip only supported for proj.mlops-governance (got ${block.projectId})`,
        };
      }
      const project = graph.projects.find((p) => p.id === block.projectId);
      if (!project) return { error: `unknown projectId: ${block.projectId}` };
      return {
        type: "ArchitectureStrip",
        emphasis: block.emphasis,
        projectId: project.id,
        label: ARCHITECTURE_PRODUCT_LABEL,
        stages: MLOPS_ARCHITECTURE_STAGES.map((s) => ({
          id: s.id,
          title: s.title,
          reality: s.reality,
        })),
        href: `/work/${project.slug}#reversible-architecture`,
      };
    }
    case "MetricBlock": {
      const node = graph.nodes.find((n) => n.id === block.nodeId);
      if (!node) return { error: `unknown nodeId: ${block.nodeId}` };
      if (node.kind !== "metric") {
        return { error: `MetricBlock requires metric node (got ${node.kind})` };
      }
      const slug = node.projectId
        ? graph.projects.find((p) => p.id === node.projectId)?.slug
        : undefined;
      return {
        type: "MetricBlock",
        emphasis: block.emphasis,
        nodeId: node.id,
        title: node.title,
        evidenceState: node.state,
        summary: node.summary ?? "",
        href: slug ? `/work/${slug}` : "/experience",
      };
    }
    case "SourceBadge": {
      const source = graph.sources.find((s) => s.id === block.sourceId);
      if (!source) return { error: `unknown sourceId: ${block.sourceId}` };
      return {
        type: "SourceBadge",
        emphasis: block.emphasis,
        sourceId: source.id,
        title: source.title ?? source.id,
        typeLabel: source.type,
        commitSha: source.commitSha ?? null,
        url: source.url ?? null,
        path: source.path ?? null,
      };
    }
    case "Timeline": {
      const items = [];
      for (const experienceId of block.experienceIds) {
        const exp = graph.experience.find((e) => e.id === experienceId);
        if (!exp) return { error: `unknown experienceId: ${experienceId}` };
        items.push({
          experienceId: exp.id,
          company: exp.company,
          title: exp.title,
          start: exp.start,
          end: exp.end,
          evidenceState: exp.evidenceState,
          href: "/experience",
        });
      }
      return { type: "Timeline", emphasis: block.emphasis, items };
    }
    case "Comparison": {
      const items: RehydratedEvidenceItem[] = [];
      for (const id of block.evidenceIds) {
        const item = resolveEvidenceItem(id, graph);
        if (!item) return { error: `unknown evidence id: ${id}` };
        items.push(item);
      }
      return {
        type: "Comparison",
        emphasis: block.emphasis,
        items,
        note: "Comparison lists canonical states only — Signal does not score fit or upgrade proof.",
      };
    }
    case "GapNotice":
      return {
        type: "GapNotice",
        emphasis: block.emphasis,
        message:
          "No canonical evidence matched this request. Signal will not invent professional facts.",
      };
    case "ExperienceCard": {
      const exp = graph.experience.find((e) => e.id === block.experienceId);
      if (!exp) return { error: `unknown experienceId: ${block.experienceId}` };
      return {
        type: "ExperienceCard",
        emphasis: block.emphasis,
        experienceId: exp.id,
        company: exp.company,
        title: exp.title,
        location: exp.location,
        start: exp.start,
        end: exp.end,
        evidenceState: exp.evidenceState,
        href: "/experience",
        technologies: exp.technologies ?? [],
      };
    }
    case "SkillEvidence": {
      const node = graph.nodes.find((n) => n.id === block.nodeId);
      if (!node) return { error: `unknown nodeId: ${block.nodeId}` };
      if (node.kind !== "skill" && node.kind !== "capability") {
        return {
          error: `SkillEvidence requires skill/capability node (got ${node.kind})`,
        };
      }
      const slug = node.projectId
        ? graph.projects.find((p) => p.id === node.projectId)?.slug
        : undefined;
      return {
        type: "SkillEvidence",
        emphasis: block.emphasis,
        nodeId: node.id,
        title: node.title,
        evidenceState: node.state,
        summary: node.summary ?? "",
        href: slug ? `/work/${slug}` : "/work",
      };
    }
    default:
      return { error: "unsupported block type" };
  }
}

/** Rehydrate a validated plan. Any block failure → full fallback. */
export function rehydrateUiPlan(
  plan: UiPlan,
  graph: EvidenceGraph,
): { ok: true; composed: ComposedView } | { ok: false; error: string } {
  const blocks: RehydratedBlock[] = [];
  for (const block of plan.blocks) {
    const result = rehydrateBlock(block, graph);
    if ("error" in result) return { ok: false, error: result.error };
    blocks.push(result);
  }
  return { ok: true, composed: { layout: plan.layout, blocks } };
}

/**
 * Deterministic planner: build a constrained ui_plan from tool-exposed evidence.
 * Passes IDs + layout only — no factual strings.
 */
export function planUiFromEvidence(
  evidence: readonly SignalEvidenceCard[],
  graph: EvidenceGraph,
  options?: { gap?: boolean },
): UiPlan {
  if (options?.gap || evidence.length === 0) {
    return {
      version: 1,
      layout: "stack",
      blocks: [{ type: "GapNotice", emphasis: "primary" }],
    };
  }

  const blocks: UiPlanBlock[] = [];
  const evidenceIds = evidence.map((e) => e.id).slice(0, 8);
  blocks.push({
    type: "EvidenceMap",
    evidenceIds,
    emphasis: "primary",
  });

  const projectIds = new Set<string>();
  const experienceIds = new Set<string>();
  const metricNodeIds: string[] = [];
  const skillNodeIds: string[] = [];
  const sourceIds: string[] = [];

  for (const card of evidence) {
    if (card.kind === "project") {
      projectIds.add(card.id.replace(/^project:/, ""));
    }
    if (card.kind === "experience") {
      experienceIds.add(card.id.replace(/^experience:/, ""));
    }
    if (card.kind === "node") {
      const nodeId = card.id.replace(/^node:/, "");
      const node = graph.nodes.find((n) => n.id === nodeId);
      if (!node) continue;
      if (node.projectId) projectIds.add(node.projectId);
      if (node.experienceId) experienceIds.add(node.experienceId);
      if (node.kind === "metric") metricNodeIds.push(node.id);
      if (node.kind === "skill" || node.kind === "capability") {
        skillNodeIds.push(node.id);
      }
      for (const sid of node.sourceIds ?? []) {
        if (sourceIds.length < 3 && !sourceIds.includes(sid)) sourceIds.push(sid);
      }
    }
  }

  for (const projectId of projectIds) {
    blocks.push({ type: "ProjectCard", projectId, emphasis: "secondary" });
    if (projectId === "proj.mlops-governance") {
      blocks.push({
        type: "ArchitectureStrip",
        projectId,
        emphasis: "muted",
      });
    }
  }

  for (const experienceId of experienceIds) {
    blocks.push({ type: "ExperienceCard", experienceId, emphasis: "secondary" });
  }

  if (experienceIds.size > 0) {
    blocks.push({
      type: "Timeline",
      experienceIds: [...experienceIds].slice(0, 4),
      emphasis: "muted",
    });
  }

  for (const nodeId of metricNodeIds.slice(0, 3)) {
    blocks.push({ type: "MetricBlock", nodeId, emphasis: "secondary" });
  }
  for (const nodeId of skillNodeIds.slice(0, 3)) {
    blocks.push({ type: "SkillEvidence", nodeId, emphasis: "muted" });
  }
  for (const sourceId of sourceIds.slice(0, 3)) {
    blocks.push({ type: "SourceBadge", sourceId, emphasis: "muted" });
  }

  if (evidenceIds.length >= 2) {
    blocks.push({
      type: "Comparison",
      evidenceIds: evidenceIds.slice(0, 3),
      emphasis: "muted",
    });
  }

  const layout = projectIds.size >= 2 ? "grid" : "stack";
  return {
    version: 1,
    layout,
    blocks: blocks.slice(0, 16),
  };
}

/** Validate + rehydrate. Never returns a partial composed view. */
export function composeFromPlan(rawPlan: unknown, graph: EvidenceGraph): ComposeResult {
  const validated = validateUiPlan(rawPlan);
  if (!validated.ok) {
    return {
      status: "fallback",
      plan: null,
      composed: null,
      fallbackReason: validated.error,
    };
  }
  const clean = assertPlanHasNoFactualAuthority(validated.plan);
  if (!clean.ok) {
    return {
      status: "fallback",
      plan: null,
      composed: null,
      fallbackReason: clean.error,
    };
  }
  const rehydrated = rehydrateUiPlan(clean.plan, graph);
  if (!rehydrated.ok) {
    return {
      status: "fallback",
      plan: null,
      composed: null,
      fallbackReason: rehydrated.error,
    };
  }
  const isGap =
    clean.plan.blocks.length === 1 && clean.plan.blocks[0]?.type === "GapNotice";
  return {
    status: isGap ? "gap" : "composed",
    plan: clean.plan,
    composed: rehydrated.composed,
    fallbackReason: null,
  };
}

export function composeFromEvidence(
  evidence: readonly SignalEvidenceCard[],
  graph: EvidenceGraph,
  options?: { gap?: boolean },
): ComposeResult {
  const plan = planUiFromEvidence(evidence, graph, options);
  return composeFromPlan(plan, graph);
}
