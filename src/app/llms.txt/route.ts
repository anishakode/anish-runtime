import { getEvidenceStats, loadEvidenceGraph } from "@/lib/evidence/load-graph";
import {
  PUBLIC_EVIDENCE_SCHEMA_ID,
  PUBLIC_EVIDENCE_SCHEMA_VERSION,
} from "@/lib/evidence/public-manifest";

export const dynamic = "force-static";

export function GET() {
  const graph = loadEvidenceGraph();
  const stats = getEvidenceStats(graph);
  const { profile, projects, experience, education } = graph;

  const lines = [
    `# ANISH // RUNTIME`,
    ``,
    `> ${profile.tagline}`,
    ``,
    `${profile.name} — ${profile.positioning}`,
    `${profile.proposition}`,
    `Location: ${profile.location}`,
    ``,
    `## Contact`,
    `- Email: ${profile.email}`,
    `- GitHub: ${profile.links.github}`,
    `- LinkedIn: ${profile.links.linkedin}`,
    ``,
    `## Evidence corpus`,
    `- Version: ${stats.version}`,
    `- Projects: ${stats.projects} (flagship ${stats.byTier.flagship}, supporting ${stats.byTier.supporting}, archive ${stats.byTier.archive})`,
    `- Nodes: ${stats.nodes}`,
    `- Edges: ${stats.edges}`,
    `- Sources: ${stats.sources}`,
    ``,
    `## Machine-readable`,
    `- /evidence.json — derived public Evidence Manifest (schema ${PUBLIC_EVIDENCE_SCHEMA_ID} v${PUBLIC_EVIDENCE_SCHEMA_VERSION})`,
    `- Repository Evidence Graph remains authoritative; /evidence.json is a projection.`,
    ``,
    `## Human routes`,
    `- / — home`,
    `- /work — projects by tier`,
    `- /work/{slug} — project evidence`,
    `- /labs — Runtime Labs index (PORTFOLIO_EXTENSION; optional)`,
    `- /labs/mlops — MLOps Runtime Lab (PORTFOLIO_EXTENSION; optional)`,
    `- /labs/steward — Steward Agent Lab (PORTFOLIO_EXTENSION; optional)`,
    `- /labs/malware — PDF Malware Explainability Lab (PORTFOLIO_EXTENSION; optional)`,
    `- /failures — Failure Museum (artifact gate; may be empty)`,
    `- ASK RUNTIME (⌘/Ctrl+K) — deterministic evidence search + semantic fallback (not chat; optional)`,
    `- /fork — Fork Anish temporary evidence branch (no fit score; optional)`,
    `- /interview — Interview My Work: session evidence → up to 3 questions (no answer key; optional)`,
    `- /surface — Under the Surface: five architecture layers with reality labels + bounded runtime trace`,
    `- /ending — Ending Signal: replay of this session's canonical evidence (no profile, no inference)`,
    `- /experience`,
    `- /about`,
    `- /cv`,
    `- /contact`,
    ``,
    `## Projects`,
    ...projects.map(
      (p) =>
        `- ${p.title} [${p.tier}] (${p.evidenceState})${p.repo ? ` — https://github.com/${p.repo}` : ""}: ${p.summary}`,
    ),
    ``,
    `## Experience`,
    ...experience.map(
      (e) => `- ${e.title} @ ${e.company} (${e.start}–${e.end}) [${e.evidenceState}]`,
    ),
    ``,
    `## Education`,
    ...education.map(
      (e) =>
        `- ${e.degree}, ${e.institution} (${e.start}–${e.end})${e.detail ? ` — ${e.detail}` : ""}`,
    ),
    ``,
    `## Truth policy`,
    `- Repository Evidence Graph is authoritative.`,
    `- AI must not invent professional facts.`,
    `- Evidence states must not be silently upgraded.`,
    `- /evidence.json is a derived projection.`,
    ``,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
