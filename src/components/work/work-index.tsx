"use client";

import { EvidenceLegend } from "@/components/evidence-legend";
import { TierSection } from "@/components/tier-section";
import { useSessionRuntimeOptional } from "@/components/session/session-runtime-context";
import { recompileBoundaryNotice, SESSION_CATEGORY_LABEL } from "@/lib/session";
import type { Project } from "@/lib/evidence/queries";
import { useMemo } from "react";

export function WorkIndex({
  flagship,
  supporting,
  archive,
}: {
  flagship: Project[];
  supporting: Project[];
  archive: Project[];
}) {
  const session = useSessionRuntimeOptional();
  const orderedFlagship = useMemo(
    () => (session ? session.orderProjects(flagship) : flagship),
    [session, flagship],
  );
  const orderedSupporting = useMemo(
    () => (session ? session.orderProjects(supporting) : supporting),
    [session, supporting],
  );
  const orderedArchive = useMemo(
    () => (session ? session.orderProjects(archive) : archive),
    [session, archive],
  );
  const note =
    session?.activeCategory != null
      ? recompileBoundaryNotice(SESSION_CATEGORY_LABEL[session.activeCategory])
      : null;

  return (
    <>
      {note ? (
        <p className="mb-8 text-sm text-[var(--muted)]" role="status">
          {note}
        </p>
      ) : null}
      <TierSection id="flagship-heading" label="Flagship" projects={orderedFlagship} />
      <TierSection
        id="supporting-heading"
        label="Supporting"
        projects={orderedSupporting}
      />
      <TierSection id="archive-heading" label="Archive" projects={orderedArchive} />
      <EvidenceLegend />
    </>
  );
}
