/**
 * Journey reference catalogue (M23).
 * Only canonical session items resolve — raw query refs have no entry here by construction.
 */

import { getGraph, type EvidenceGraph } from "@/lib/evidence/queries";
import type { EvidenceState } from "@/lib/evidence/schema";
import { SESSION_ITEM_CATEGORY } from "@/lib/session/categories";

export type JourneyRef = {
  itemId: string;
  label: string;
  href: string;
  evidenceState: EvidenceState | null;
};

export type JourneyCatalog = Record<string, JourneyRef>;

const LAB_REFS: Record<string, { label: string; href: string; nodeId: string }> = {
  "lab:mlops": {
    label: "MLOps Runtime Lab",
    href: "/labs/mlops",
    nodeId: "ev.mlops.runtime-lab",
  },
  "lab:steward": {
    label: "Steward Agent Lab",
    href: "/labs/steward",
    nodeId: "ev.steward.runtime-lab",
  },
  "lab:malware": {
    label: "PDF Malware Explainability Lab",
    href: "/labs/malware",
    nodeId: "ev.malware.runtime-lab",
  },
};

const ROUTE_REFS: Record<string, { label: string; href: string }> = {
  "route:experience": { label: "Experience", href: "/experience" },
  "route:cv": { label: "CV", href: "/cv" },
};

/**
 * Build display refs for every canonical session item.
 * An item that cannot be resolved from the graph is omitted rather than guessed.
 */
export function buildJourneyCatalog(graph: EvidenceGraph = getGraph()): JourneyCatalog {
  const catalog: JourneyCatalog = {};

  for (const itemId of Object.keys(SESSION_ITEM_CATEGORY)) {
    if (itemId.startsWith("project:")) {
      const projectId = itemId.slice("project:".length);
      const project = graph.projects.find((p) => p.id === projectId);
      if (!project) continue;
      catalog[itemId] = {
        itemId,
        label: project.title,
        href: `/work/${project.slug}`,
        evidenceState: project.evidenceState,
      };
      continue;
    }

    if (itemId.startsWith("lab:")) {
      const lab = LAB_REFS[itemId];
      if (!lab) continue;
      const node = graph.nodes.find((n) => n.id === lab.nodeId);
      if (!node) continue;
      catalog[itemId] = {
        itemId,
        label: lab.label,
        href: lab.href,
        evidenceState: node.state,
      };
      continue;
    }

    if (itemId.startsWith("experience:")) {
      const experienceId = itemId.slice("experience:".length);
      const experience = graph.experience.find((e) => e.id === experienceId);
      if (!experience) continue;
      catalog[itemId] = {
        itemId,
        label: `${experience.title} · ${experience.company}`,
        href: "/experience",
        evidenceState: experience.evidenceState,
      };
      continue;
    }

    const route = ROUTE_REFS[itemId];
    if (route) {
      catalog[itemId] = { itemId, ...route, evidenceState: null };
    }
  }

  return catalog;
}
