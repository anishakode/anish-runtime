import Link from "next/link";
import { EvidenceBadge } from "@/components/evidence-badge";
import type { Project } from "@/lib/evidence/queries";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="measure-rule border-b py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="eyebrow">{project.tier}</p>
          <h3 className="text-xl font-semibold tracking-tight">
            <Link href={`/work/${project.slug}`} className="hover:underline">
              {project.title}
            </Link>
          </h3>
        </div>
        <EvidenceBadge state={project.evidenceState} />
      </div>
      <p className="mt-3 max-w-prose text-[var(--muted)]">{project.summary}</p>
      {project.themes.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {project.themes.map((theme) => (
            <li key={theme} className="chip">
              {theme}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
