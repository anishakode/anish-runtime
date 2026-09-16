/** Client-safe compose view types (M18) — no graph/fs imports. */

import type { EvidenceState } from "@/lib/evidence/schema";

export const COMPOSE_FALLBACK_NOTICE =
  "UI plan failed validation or rehydration. Showing tool-backed text only — no partial generative interface.";

export type ComposeStatus = "composed" | "fallback" | "gap";

export type RehydratedEvidenceItem = {
  id: string;
  title: string;
  kind: string;
  evidenceState: EvidenceState;
  summary: string;
  href: string;
};

export type RehydratedBlock =
  | {
      type: "EvidenceMap";
      emphasis?: string;
      items: RehydratedEvidenceItem[];
    }
  | {
      type: "ProjectCard";
      emphasis?: string;
      projectId: string;
      title: string;
      slug: string;
      tier: string;
      evidenceState: EvidenceState;
      summary: string;
      href: string;
      themes: string[];
    }
  | {
      type: "ArchitectureStrip";
      emphasis?: string;
      projectId: string;
      label: string;
      stages: { id: string; title: string; reality: string }[];
      href: string;
    }
  | {
      type: "MetricBlock";
      emphasis?: string;
      nodeId: string;
      title: string;
      evidenceState: EvidenceState;
      summary: string;
      href: string;
    }
  | {
      type: "SourceBadge";
      emphasis?: string;
      sourceId: string;
      title: string;
      typeLabel: string;
      commitSha: string | null;
      url: string | null;
      path: string | null;
    }
  | {
      type: "Timeline";
      emphasis?: string;
      items: {
        experienceId: string;
        company: string;
        title: string;
        start: string;
        end: string;
        evidenceState: EvidenceState;
        href: string;
      }[];
    }
  | {
      type: "Comparison";
      emphasis?: string;
      items: RehydratedEvidenceItem[];
      note: string;
    }
  | {
      type: "GapNotice";
      emphasis?: string;
      message: string;
    }
  | {
      type: "ExperienceCard";
      emphasis?: string;
      experienceId: string;
      company: string;
      title: string;
      location: string;
      start: string;
      end: string;
      evidenceState: EvidenceState;
      href: string;
      technologies: string[];
    }
  | {
      type: "SkillEvidence";
      emphasis?: string;
      nodeId: string;
      title: string;
      evidenceState: EvidenceState;
      summary: string;
      href: string;
    };

export type ComposedView = {
  layout: "stack" | "grid";
  blocks: RehydratedBlock[];
};
