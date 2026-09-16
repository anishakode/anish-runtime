import { EvidenceBadge } from "@/components/evidence-badge";
import { PageShell } from "@/components/page-shell";
import { getEvidenceStats } from "@/lib/evidence/load-graph";
import { getEducation, getGraph, getProfile } from "@/lib/evidence/queries";

export const metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  description: "Public profile and education from the canonical Evidence Graph.",
};

export default function AboutPage() {
  const profile = getProfile();
  const education = getEducation();
  const stats = getEvidenceStats(getGraph());

  return (
    <PageShell title="About" description={`${profile.proposition} ${profile.tagline}`}>
      <section aria-labelledby="profile-heading" className="mb-12 space-y-3">
        <h2 id="profile-heading" className="text-lg font-semibold">
          Profile
        </h2>
        <p>
          <span className="font-medium">{profile.name}</span>
          <span className="text-[var(--muted)]"> · {profile.location}</span>
        </p>
        <p className="text-[var(--muted)]">{profile.positioning}</p>
        <p className="text-sm text-[var(--muted)]">
          Evidence corpus: {stats.nodes} nodes · {stats.projects} projects ·{" "}
          {stats.sources} sources
        </p>
      </section>

      <section aria-labelledby="education-heading">
        <h2 id="education-heading" className="mb-4 text-lg font-semibold">
          Education
        </h2>
        <ul className="space-y-6">
          {education.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--stroke)] pb-6"
            >
              <div className="space-y-1">
                <p className="font-medium">{item.degree}</p>
                <p className="text-[var(--muted)]">{item.institution}</p>
                {item.detail ? (
                  <p className="text-sm text-[var(--muted)]">{item.detail}</p>
                ) : null}
                <p className="text-sm text-[var(--muted)]">
                  {item.start} — {item.end}
                </p>
              </div>
              <EvidenceBadge state={item.evidenceState} />
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
