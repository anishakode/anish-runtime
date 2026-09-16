/**
 * Deterministic evidence search index — built only from the Evidence Graph (M15).
 */

import type { EvidenceGraph, EvidenceState } from "@/lib/evidence/schema";
import { normalizeSearchText, tokenize } from "./normalize";

export type SearchDocKind = "profile" | "project" | "node" | "experience" | "education";

export type SearchDocument = {
  id: string;
  kind: SearchDocKind;
  title: string;
  aliases: string[];
  summary: string;
  evidenceState: EvidenceState;
  href: string;
  /** Precomputed normalized title for exact/prefix matching. */
  titleNorm: string;
  aliasNorms: string[];
  tokens: string[];
};

function uniqueTokens(...parts: string[]): string[] {
  const set = new Set<string>();
  for (const part of parts) {
    for (const token of tokenize(part)) set.add(token);
  }
  return [...set];
}

function doc(input: {
  id: string;
  kind: SearchDocKind;
  title: string;
  aliases?: string[];
  summary?: string;
  evidenceState: EvidenceState;
  href: string;
}): SearchDocument {
  const aliases = input.aliases ?? [];
  const summary = input.summary ?? "";
  return {
    id: input.id,
    kind: input.kind,
    title: input.title,
    aliases,
    summary,
    evidenceState: input.evidenceState,
    href: input.href,
    titleNorm: normalizeSearchText(input.title),
    aliasNorms: aliases.map(normalizeSearchText).filter(Boolean),
    tokens: uniqueTokens(input.title, summary, ...aliases),
  };
}

/** Build a flat, serializable search index from the canonical graph. */
export function buildSearchIndex(graph: EvidenceGraph): SearchDocument[] {
  const docs: SearchDocument[] = [];

  docs.push(
    doc({
      id: "profile",
      kind: "profile",
      title: graph.profile.name,
      aliases: ["anish", "anish akode", "profile", "identity"],
      summary: `${graph.profile.positioning} ${graph.profile.tagline}`,
      evidenceState: "RESUME_DOCUMENTED",
      href: "/about",
    }),
  );

  for (const project of graph.projects) {
    docs.push(
      doc({
        id: project.id,
        kind: "project",
        title: project.title,
        aliases: [project.slug, ...(project.themes ?? [])],
        summary: project.summary,
        evidenceState: project.evidenceState,
        href: `/work/${project.slug}`,
      }),
    );
  }

  for (const node of graph.nodes) {
    let href = "/work";
    if (node.projectId) {
      const project = graph.projects.find((p) => p.id === node.projectId);
      if (project) href = `/work/${project.slug}`;
    } else if (node.experienceId) {
      href = "/experience";
    } else if (node.educationId) {
      href = "/about";
    } else if (node.kind === "identity") {
      href = "/about";
    } else if (node.kind === "boundary") {
      href = node.id.includes("failure") ? "/failures" : "/work";
    }

    docs.push(
      doc({
        id: node.id,
        kind: "node",
        title: node.title,
        aliases: node.aliases ?? [],
        summary: node.summary,
        evidenceState: node.state,
        href,
      }),
    );
  }

  for (const exp of graph.experience) {
    docs.push(
      doc({
        id: exp.id,
        kind: "experience",
        title: `${exp.title} — ${exp.company}`,
        aliases: [exp.company, exp.title],
        summary: exp.technologies.join(" "),
        evidenceState: exp.evidenceState,
        href: "/experience",
      }),
    );
  }

  for (const edu of graph.education) {
    docs.push(
      doc({
        id: edu.id,
        kind: "education",
        title: `${edu.degree} — ${edu.institution}`,
        aliases: [edu.institution, edu.degree],
        summary: edu.detail ?? "",
        evidenceState: edu.evidenceState,
        href: "/about",
      }),
    );
  }

  return docs;
}
