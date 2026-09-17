import Link from "next/link";
import { EvidenceBadge } from "@/components/evidence-badge";
import { FAILURE_PUBLICATION_REQUIREMENTS } from "@/lib/failures/requirements";
import type { FailureExhibit, FailureMuseumView } from "@/lib/failures";

type FailureMuseumProps = {
  museum: FailureMuseumView;
  /** When true, omit the self-link used on Autopsy (already on /failures). */
  hideMuseumLink?: boolean;
};

function ExhibitCard({ exhibit }: { exhibit: FailureExhibit }) {
  return (
    <article
      className="border border-[var(--stroke)] p-4"
      aria-labelledby={`failure-exhibit-${exhibit.id}`}
    >
      <div className="mb-2 flex flex-wrap items-start gap-2">
        <EvidenceBadge state={exhibit.evidenceState} />
        <span className="instrument-label text-xs">Published exhibit</span>
      </div>
      <h3 id={`failure-exhibit-${exhibit.id}`} className="font-medium">
        {exhibit.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{exhibit.summary}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {exhibit.artifacts.map((artifact) => (
          <li key={artifact.id}>
            {artifact.url ? (
              <a
                href={artifact.url}
                className="underline underline-offset-4"
                rel="noopener noreferrer"
                target="_blank"
              >
                {artifact.title}
              </a>
            ) : (
              artifact.title
            )}
          </li>
        ))}
      </ul>
      {exhibit.claimedMetrics.length > 0 ? (
        <dl className="mt-3 grid gap-1 text-sm">
          {exhibit.claimedMetrics.map((metric) => (
            <div key={`${metric.label}-${metric.artifactId}`} className="flex gap-2">
              <dt className="text-[var(--muted)]">{metric.label}</dt>
              <dd className="font-mono text-xs">{metric.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}

/**
 * Failure Museum surface — empty by default; renderer ready for future exhibits.
 * Presentational only: callers must supply a museum view (server or test).
 */
export function FailureMuseum({ museum, hideMuseumLink = false }: FailureMuseumProps) {
  const requirements =
    museum.publicationRequirements.length > 0
      ? museum.publicationRequirements
      : FAILURE_PUBLICATION_REQUIREMENTS;

  return (
    <div id="failure-museum" className="failure-museum space-y-6">
      <aside
        className={
          museum.empty
            ? "border border-[var(--stroke)] p-4 text-sm"
            : "border border-[var(--stroke)] bg-[var(--state-limited-bg)] p-4 text-sm text-[var(--state-limited-fg)]"
        }
        aria-label="Failure Museum evidence gate"
      >
        <div className="mb-2 flex flex-wrap items-start gap-2">
          <EvidenceBadge state={museum.state} />
          <span className="instrument-label text-xs">Failure Museum</span>
        </div>
        <h2 className="font-medium text-[var(--on-surface)]">{museum.title}</h2>
        <p className="mt-2 text-[var(--on-surface)]">{museum.summary}</p>
        <p className="mt-3 text-[var(--muted)]">
          Published exhibits: <strong>{museum.publishedCount}</strong>
          {museum.empty ? " — empty by design until artifact-grade proof exists." : "."}
        </p>
        <p className="mt-2 text-[var(--muted)]">
          No invented outage theatre. Proof outranks narrative quality.
        </p>
        {!hideMuseumLink ? (
          <p className="mt-3">
            <Link href="/failures" className="underline underline-offset-4">
              Open dedicated Failure Museum
            </Link>
          </p>
        ) : null}
      </aside>

      {museum.empty ? (
        <section aria-label="Publication requirements" className="space-y-3">
          <h3 className="text-lg font-semibold">Artifact-grade publication gate</h3>
          <p className="text-sm text-[var(--muted)]">
            Exhibits appear here only when they clear the evidence gate. Future renderer
            is ready; the canonical dataset is currently empty.
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {requirements.map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ol>
        </section>
      ) : (
        <section aria-label="Published failure exhibits" className="space-y-4">
          <h3 className="text-lg font-semibold">Published exhibits</h3>
          <ul className="space-y-4">
            {museum.exhibits.map((exhibit) => (
              <li key={exhibit.id}>
                <ExhibitCard exhibit={exhibit} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
