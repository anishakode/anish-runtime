import { EvidenceBadge } from "@/components/evidence-badge";
import { PageShell } from "@/components/page-shell";
import { PrintButton } from "@/components/print-button";
import {
  getEducation,
  getExperience,
  getNodesByIds,
  getProfile,
  getProjectsByTier,
  getSourcesForIds,
} from "@/lib/evidence/queries";

export const metadata = {
  title: "CV",
  alternates: { canonical: "/cv" },
  description: "Printable CV generated from the Evidence Graph.",
};

export default function CvPage() {
  const profile = getProfile();
  const experience = getExperience();
  const education = getEducation();
  const { flagship, supporting } = getProjectsByTier();
  const projects = [...flagship, ...supporting];

  return (
    <PageShell
      title="CV"
      description="Browser-printable summary grounded in the Evidence Graph. Use your browser’s print dialog for a PDF."
    >
      <div className="mb-8 no-print">
        <PrintButton />
      </div>

      <article className="cv-document space-y-10">
        <header className="space-y-2 border-b border-[var(--stroke)] pb-6">
          <h2 className="text-2xl font-semibold tracking-tight">{profile.name}</h2>
          <p className="text-[var(--muted)]">
            {profile.positioning} · {profile.location}
          </p>
          <p className="text-sm text-[var(--muted)]">{profile.proposition}</p>
          <p className="text-sm">
            <a className="underline underline-offset-4" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            {" · "}
            <a
              className="underline underline-offset-4"
              href={profile.links.github}
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            {" · "}
            <a
              className="underline underline-offset-4"
              href={profile.links.linkedin}
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </p>
        </header>

        <section aria-labelledby="cv-experience">
          <h3
            id="cv-experience"
            className="mb-4 text-sm uppercase tracking-wide text-[var(--muted)]"
          >
            Experience
          </h3>
          <ul className="space-y-6">
            {experience.map((role) => {
              const metrics = getNodesByIds(role.impactMetricIds);
              // The printed PDF is the one artifact that leaves this site, so the
              // attribution has to travel with the numbers rather than living on
              // /experience. Read from the source notes, same as that page does.
              const metricSources = getSourcesForIds([
                ...new Set(metrics.flatMap((m) => m.sourceIds)),
              ]);
              const notes = metricSources.filter((s) => s.note);
              return (
                <li key={role.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">
                      {role.title} · {role.company}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {role.start} — {role.end}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{role.location}</p>
                  {metrics.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {metrics.map((m) => (
                        <li key={m.id}>{m.title}</li>
                      ))}
                    </ul>
                  ) : null}
                  {/* Prints. A figure that travels without its sourcing is the
                      overclaim, not the figure itself. */}
                  {notes.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                      {notes.map((s) => (
                        <li key={s.id}>{s.note}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-2">
                    <EvidenceBadge state={role.evidenceState} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="cv-projects">
          <h3
            id="cv-projects"
            className="mb-4 text-sm uppercase tracking-wide text-[var(--muted)]"
          >
            Selected projects
          </h3>
          <ul className="space-y-4">
            {projects.map((project) => (
              <li key={project.id}>
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-[var(--muted)]">{project.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cv-education">
          <h3
            id="cv-education"
            className="mb-4 text-sm uppercase tracking-wide text-[var(--muted)]"
          >
            Education
          </h3>
          <ul className="space-y-4">
            {education.map((item) => (
              <li key={item.id}>
                <p className="font-medium">
                  {item.degree}
                  {item.detail ? ` (${item.detail})` : ""}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {item.institution} · {item.start} — {item.end}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </PageShell>
  );
}
