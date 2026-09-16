"use client";

import Link from "next/link";
import { EvidenceBadge } from "@/components/evidence-badge";
import type { EvidenceState } from "@/lib/evidence/schema";
import type { ComposedView, RehydratedBlock } from "@/lib/signal/compose-types";

function BlockShell({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <article className="signal-compose-block border border-[var(--stroke)] p-3">
      <p className="instrument-label text-xs text-[var(--muted)]">{label}</p>
      <div className="mt-2">{children}</div>
    </article>
  );
}

function EvidenceItems({
  items,
  onNavigate,
}: {
  items: {
    id: string;
    title: string;
    evidenceState: EvidenceState;
    summary: string;
    href: string;
    kind?: string;
  }[];
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="block no-underline hover:underline"
            onClick={onNavigate}
          >
            <span className="flex flex-wrap items-center gap-2">
              <EvidenceBadge state={item.evidenceState} />
              {item.kind ? (
                <span className="instrument-label text-xs text-[var(--muted)]">
                  {item.kind}
                </span>
              ) : null}
            </span>
            <span className="mt-1 block font-medium text-[var(--on-surface)]">
              {item.title}
            </span>
            {item.summary ? (
              <span className="mt-1 block text-sm text-[var(--muted)]">
                {item.summary}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RenderBlock({
  block,
  onNavigate,
}: {
  block: RehydratedBlock;
  onNavigate: () => void;
}) {
  switch (block.type) {
    case "EvidenceMap":
      return (
        <BlockShell label="EvidenceMap">
          <EvidenceItems items={block.items} onNavigate={onNavigate} />
        </BlockShell>
      );
    case "ProjectCard":
      return (
        <BlockShell label={`ProjectCard · ${block.tier}`}>
          <Link href={block.href} className="no-underline" onClick={onNavigate}>
            <div className="flex flex-wrap items-center gap-2">
              <EvidenceBadge state={block.evidenceState} />
              <span className="font-medium text-[var(--on-surface)]">{block.title}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{block.summary}</p>
          </Link>
        </BlockShell>
      );
    case "ArchitectureStrip":
      return (
        <BlockShell label="ArchitectureStrip">
          <p className="text-sm font-medium text-[var(--on-surface)]">{block.label}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--muted)]">
            {block.stages.map((stage) => (
              <li key={stage.id}>
                {stage.title}{" "}
                <span className="instrument-label text-xs">({stage.reality})</span>
              </li>
            ))}
          </ol>
          <Link
            href={block.href}
            className="mt-2 inline-block text-sm underline"
            onClick={onNavigate}
          >
            Open reversible architecture
          </Link>
        </BlockShell>
      );
    case "MetricBlock":
      return (
        <BlockShell label="MetricBlock">
          <Link href={block.href} className="no-underline" onClick={onNavigate}>
            <div className="flex flex-wrap items-center gap-2">
              <EvidenceBadge state={block.evidenceState} />
              <span className="font-medium">{block.title}</span>
            </div>
            {block.summary ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{block.summary}</p>
            ) : null}
          </Link>
        </BlockShell>
      );
    case "SourceBadge":
      return (
        <BlockShell label="SourceBadge">
          <p className="font-medium text-[var(--on-surface)]">{block.title}</p>
          <p className="mt-1 font-mono text-xs text-[var(--muted)]">
            {block.typeLabel}
            {block.path ? ` · ${block.path}` : ""}
            {block.commitSha ? ` · ${block.commitSha.slice(0, 12)}…` : ""}
          </p>
          {block.url ? (
            <a
              href={block.url}
              className="mt-2 inline-block text-sm underline"
              target="_blank"
              rel="noreferrer"
            >
              Open source
            </a>
          ) : null}
        </BlockShell>
      );
    case "Timeline":
      return (
        <BlockShell label="Timeline">
          <ol className="space-y-2">
            {block.items.map((item) => (
              <li key={item.experienceId}>
                <Link href={item.href} className="no-underline" onClick={onNavigate}>
                  <EvidenceBadge state={item.evidenceState} />
                  <span className="ml-2 font-medium">
                    {item.title} · {item.company}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--muted)]">
                    {item.start} – {item.end}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </BlockShell>
      );
    case "Comparison":
      return (
        <BlockShell label="Comparison">
          <EvidenceItems items={block.items} onNavigate={onNavigate} />
          <p className="mt-2 text-sm text-[var(--muted)]">{block.note}</p>
        </BlockShell>
      );
    case "GapNotice":
      return (
        <BlockShell label="GapNotice">
          <p className="text-sm text-[var(--muted)]">{block.message}</p>
        </BlockShell>
      );
    case "ExperienceCard":
      return (
        <BlockShell label="ExperienceCard">
          <Link href={block.href} className="no-underline" onClick={onNavigate}>
            <div className="flex flex-wrap items-center gap-2">
              <EvidenceBadge state={block.evidenceState} />
              <span className="font-medium">{block.title}</span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {block.company} · {block.location}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {block.start} – {block.end}
            </p>
          </Link>
        </BlockShell>
      );
    case "SkillEvidence":
      return (
        <BlockShell label="SkillEvidence">
          <Link href={block.href} className="no-underline" onClick={onNavigate}>
            <div className="flex flex-wrap items-center gap-2">
              <EvidenceBadge state={block.evidenceState} />
              <span className="font-medium">{block.title}</span>
            </div>
            {block.summary ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{block.summary}</p>
            ) : null}
          </Link>
        </BlockShell>
      );
    default:
      return null;
  }
}

/**
 * Renders a fully rehydrated Signal compose view — never accepts raw planner facts.
 */
export function SignalComposedView({
  view,
  onNavigate,
}: {
  view: ComposedView;
  onNavigate: () => void;
}) {
  return (
    <div
      className={
        view.layout === "grid"
          ? "signal-compose-grid grid gap-3 sm:grid-cols-2"
          : "signal-compose-stack space-y-3"
      }
      aria-label="Composed evidence UI"
    >
      {view.blocks.map((block, index) => (
        <RenderBlock
          key={`${block.type}-${index}`}
          block={block}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
