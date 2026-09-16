import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectAutopsy } from "@/components/autopsy/project-autopsy";
import { ReversibleArchitecture } from "@/components/architecture/reversible-architecture";
import { EvidenceBadge } from "@/components/evidence-badge";
import { MalwareLab } from "@/components/labs/malware-lab";
import { MlopsLab } from "@/components/labs/mlops-lab";
import { StewardLab } from "@/components/labs/steward-lab";
import { PageShell } from "@/components/page-shell";
import { ProjectEvidenceSection } from "@/components/source-trace/project-evidence-section";
import { ProjectXray } from "@/components/xray/project-xray";
import { buildMlopsArchitectureViews } from "@/lib/architecture/build-views";
import { buildMalwareAutopsyBundle } from "@/lib/autopsy/malware-bundle";
import { buildMlopsAutopsyBundle } from "@/lib/autopsy/mlops-bundle";
import { buildStewardAutopsyBundle } from "@/lib/autopsy/steward-bundle";
import {
  getGraph,
  getNodesForProject,
  getPinnedRepoLink,
  getProjectBySlug,
  getSourcesForNode,
} from "@/lib/evidence/queries";
import { toTraceSourceView } from "@/lib/evidence/source-trace";
import { buildMlopsXrayLayers } from "@/lib/xray/build-views";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getGraph().projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const nodes = getNodesForProject(project.id);
  const graph = getGraph();
  const repoLink = getPinnedRepoLink(project, graph);
  const nodeViews = nodes.map((node) => ({
    id: node.id,
    title: node.title,
    summary: node.summary,
    state: node.state,
    sources: getSourcesForNode(node, graph).map(toTraceSourceView),
  }));
  const isMlops = project.slug === "mlops-governance-dashboard";
  const isSteward = project.slug === "steward-ai";
  const isMalware = project.slug === "explainable-pdf-malware-detection";
  const architectureStages = isMlops ? buildMlopsArchitectureViews(graph) : [];
  const xrayLayers = isMlops ? buildMlopsXrayLayers(graph) : [];
  const autopsyBundle = isMlops
    ? buildMlopsAutopsyBundle(graph)
    : isSteward
      ? buildStewardAutopsyBundle(graph)
      : isMalware
        ? buildMalwareAutopsyBundle(graph)
        : null;

  return (
    <PageShell title={project.title} description={project.summary}>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <EvidenceBadge state={project.evidenceState} />
        <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
          {project.tier}
        </span>
        {repoLink ? (
          <a
            className="text-sm underline underline-offset-4"
            href={repoLink.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {repoLink.label}
          </a>
        ) : null}
      </div>

      {autopsyBundle && isMlops ? (
        <ProjectAutopsy
          bundle={autopsyBundle}
          runPanel={<MlopsLab />}
          xrayPanel={
            <ProjectXray
              layers={xrayLayers}
              causalPanel={<ReversibleArchitecture stages={architectureStages} />}
            />
          }
          evidencePanel={<ProjectEvidenceSection nodes={nodeViews} />}
        />
      ) : autopsyBundle && isSteward ? (
        <ProjectAutopsy
          bundle={autopsyBundle}
          runPanel={<StewardLab />}
          xrayPanel={
            <p className="text-sm text-[var(--muted)]">
              Steward Project X-Ray / Reversible Architecture deferred — Agent Lab RUN is
              the M12 inspection surface. Prototype status stays visible on STORY /
              DECISIONS / EVIDENCE.
            </p>
          }
          evidencePanel={<ProjectEvidenceSection nodes={nodeViews} />}
        />
      ) : autopsyBundle && isMalware ? (
        <ProjectAutopsy
          bundle={autopsyBundle}
          runPanel={<MalwareLab />}
          xrayPanel={
            <p className="text-sm text-[var(--muted)]">
              Malware Project X-Ray remains report/study framing — Explainability Lab RUN
              is the M13 inspection surface. LIMITED_EVIDENCE SHAP detail stays honest on
              EVIDENCE.
            </p>
          }
          evidencePanel={<ProjectEvidenceSection nodes={nodeViews} />}
        />
      ) : (
        <ProjectEvidenceSection nodes={nodeViews} />
      )}

      <p className="mt-10 text-sm">
        {isMlops ? (
          <>
            <Link href="/labs/mlops" className="underline underline-offset-4">
              Open dedicated MLOps Runtime Lab
            </Link>
            <span className="mx-2 text-[var(--muted)]">·</span>
          </>
        ) : null}
        {isSteward ? (
          <>
            <Link href="/labs/steward" className="underline underline-offset-4">
              Open dedicated Steward Agent Lab
            </Link>
            <span className="mx-2 text-[var(--muted)]">·</span>
          </>
        ) : null}
        {isMalware ? (
          <>
            <Link href="/labs/malware" className="underline underline-offset-4">
              Open dedicated PDF Malware Explainability Lab
            </Link>
            <span className="mx-2 text-[var(--muted)]">·</span>
          </>
        ) : null}
        <Link href="/work" className="underline underline-offset-4">
          ← All work
        </Link>
      </p>
    </PageShell>
  );
}
