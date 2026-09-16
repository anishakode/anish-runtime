import { EvidenceBadge } from "@/components/evidence-badge";
import { EvidenceLegend } from "@/components/evidence-legend";
import { PageShell } from "@/components/page-shell";
import {
  getExperience,
  getGraph,
  getNodesByIds,
  getSourcesForIds,
} from "@/lib/evidence/queries";

export const metadata = {
  title: "Experience",
  alternates: { canonical: "/experience" },
  description: "Professional experience with evidence-backed impact metrics.",
};

export default function ExperiencePage() {
  const roles = getExperience();
  const graph = getGraph();

  return (
    <PageShell
      title="Experience"
      description="Roles and impact claims are tied to Evidence Graph states — professional confirmation is labeled, not inflated."
    >
      {roles.length === 0 ? (
        <p className="text-[var(--muted)]">
          No experience records in the Evidence Graph.
        </p>
      ) : (
        <ul className="space-y-12">
          {roles.map((role) => {
            const metrics = getNodesByIds(role.impactMetricIds, graph);
            const metricSourceIds = [...new Set(metrics.flatMap((m) => m.sourceIds))];
            const sources = getSourcesForIds(metricSourceIds, graph);
            return (
              <li key={role.id} className="measure-rule border-b pb-10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">{role.title}</h2>
                    <p className="text-[var(--muted)]">
                      {role.company} · {role.location}
                    </p>
                    <p className="instrument-label text-sm text-[var(--muted)]">
                      {role.start} — {role.end}
                    </p>
                  </div>
                  <EvidenceBadge state={role.evidenceState} />
                </div>
                {role.technologies.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {role.technologies.map((tech) => (
                      <li key={tech} className="chip">
                        {tech}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {metrics.length > 0 ? (
                  <section aria-labelledby={`${role.id}-metrics`} className="mt-6">
                    <h3 id={`${role.id}-metrics`} className="eyebrow mb-3">
                      Impact metrics
                    </h3>
                    <ul className="space-y-3">
                      {metrics.map((metric) => (
                        <li
                          key={metric.id}
                          className="flex flex-wrap items-start justify-between gap-3"
                        >
                          <span>{metric.title}</span>
                          <EvidenceBadge state={metric.state} />
                        </li>
                      ))}
                    </ul>
                    {sources.some((s) => s.note) ? (
                      <ul className="mt-4 space-y-2 text-xs text-[var(--muted)]">
                        {sources
                          .filter((s) => s.note)
                          .map((s) => (
                            <li key={s.id}>{s.note}</li>
                          ))}
                      </ul>
                    ) : null}
                  </section>
                ) : (
                  <p className="mt-4 text-sm text-[var(--muted)]">
                    No impact metrics linked for this role.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <EvidenceLegend />
    </PageShell>
  );
}
