import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/evidence/queries";

export function TierSection({
  id,
  label,
  projects,
}: {
  id: string;
  label: string;
  projects: Project[];
}) {
  return (
    <section aria-labelledby={id} className="mb-12 last:mb-0">
      <h2 id={id} className="eyebrow mb-2">
        {label}
      </h2>
      {projects.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No {label.toLowerCase()} projects.</p>
      ) : (
        projects.map((project) => <ProjectCard key={project.id} project={project} />)
      )}
    </section>
  );
}
