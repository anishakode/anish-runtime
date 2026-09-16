"use client";

import { EvidenceBadge } from "@/components/evidence-badge";
import { SourceTraceProvider } from "@/components/source-trace/source-trace-context";
import { SourceTraceTrigger } from "@/components/source-trace/source-trace-trigger";
import type { EvidenceState } from "@/lib/evidence/schema";
import type { TraceSourceView } from "@/lib/evidence/source-trace";

export type ProjectEvidenceNodeView = {
  id: string;
  title: string;
  summary?: string;
  state: EvidenceState;
  sources: TraceSourceView[];
};

export function ProjectEvidenceSection({ nodes }: { nodes: ProjectEvidenceNodeView[] }) {
  return (
    <SourceTraceProvider>
      <section aria-labelledby="evidence-heading" className="space-y-6">
        <h2 id="evidence-heading" className="page-title text-xl">
          Evidence
        </h2>
        {nodes.length === 0 ? (
          <p className="text-[var(--muted)]">No linked evidence nodes yet.</p>
        ) : (
          <ul className="space-y-6">
            {nodes.map((node) => {
              const trace =
                node.sources.length > 0
                  ? {
                      claimLabel: node.title,
                      nodeId: node.id,
                      listAnchorId: `evidence-node-${node.id}`,
                      sources: node.sources,
                    }
                  : null;
              return (
                <li
                  key={node.id}
                  id={`evidence-node-${node.id}`}
                  className="border-b border-[var(--stroke)] pb-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-medium">{node.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <EvidenceBadge state={node.state} />
                      {trace ? <SourceTraceTrigger trace={trace} /> : null}
                    </div>
                  </div>
                  {node.summary ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">{node.summary}</p>
                  ) : null}
                  {node.sources.length > 0 ? (
                    <ul
                      className="mt-3 space-y-1 text-sm text-[var(--muted)]"
                      aria-label={`${node.title} sources`}
                    >
                      {node.sources.map((source) => (
                        <li key={source.id} id={`source-${source.id}`}>
                          {source.url ? (
                            <a
                              className="underline underline-offset-4"
                              href={source.url}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {source.title}
                            </a>
                          ) : (
                            <span>{source.title}</span>
                          )}
                          {source.commitSha ? (
                            <span className="ml-2 font-mono text-xs">
                              @{source.commitSha.slice(0, 7)}
                            </span>
                          ) : null}
                          {source.note ? (
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {source.note}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </SourceTraceProvider>
  );
}
