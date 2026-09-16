"use client";

import Link from "next/link";
import { useState } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import { useRuntimeTraceOptional } from "@/components/runtime-trace/runtime-trace-context";
import { useSessionRuntimeOptional } from "@/components/session/session-runtime-context";
import type { JourneyCatalog } from "@/lib/ending/catalog";
import {
  ENDING_HEADING,
  ENDING_LAST_NODE,
  ENDING_SESSION_DISCLAIMER,
  ENDING_UNTESTABLE_ANSWER,
  ENDING_UNTESTABLE_LINE,
  buildEndingSignal,
} from "@/lib/ending/signal";

export type EndingContact = {
  email: string;
  github: string;
  linkedin: string;
};

type EndingSignalViewProps = {
  catalog: JourneyCatalog;
  contact: EndingContact;
};

export function EndingSignalView({ catalog, contact }: EndingSignalViewProps) {
  const session = useSessionRuntimeOptional();
  const trace = useRuntimeTraceOptional();
  const [whyOpen, setWhyOpen] = useState(false);

  const signal = buildEndingSignal(catalog, session?.events ?? [], trace?.entries ?? []);

  return (
    <div className="space-y-10">
      <section className="space-y-3" aria-labelledby="ending-heading">
        <h2 id="ending-heading" className="page-title text-xl">
          {ENDING_HEADING}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="instrument-label text-xs tracking-wide">{signal.density}</span>
          <p className="text-sm text-[var(--muted)]">{signal.densitySummary}</p>
        </div>
        <p className="text-sm font-medium">{ENDING_SESSION_DISCLAIMER}</p>
      </section>

      <section className="space-y-3" aria-label="Evidence route">
        <h3 className="text-lg font-semibold">Evidence route</h3>
        {signal.nodes.length === 0 ? (
          <p className="text-sm" role="status">
            No canonical evidence was opened in this session. There is no path to replay,
            and RUNTIME will not invent one.
          </p>
        ) : (
          <ol className="space-y-3" aria-label="Journey nodes">
            {signal.nodes.map((node) => (
              <li key={node.itemId} className="border border-[var(--stroke)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="instrument-label text-xs text-[var(--muted)]">
                    {String(node.order).padStart(2, "0")}
                  </span>
                  <Link
                    href={node.href}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {node.label}
                  </Link>
                  {node.evidenceState ? (
                    <EvidenceBadge state={node.evidenceState} />
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{node.reason}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {signal.thread ? (
        <section
          className="border border-[var(--stroke)] p-4"
          aria-label="Exploration thread"
        >
          <h3 className="instrument-label text-xs tracking-wide">Strongest thread</h3>
          <p className="mt-2 text-sm">
            {signal.thread.label} — {Math.round(signal.thread.share * 100)}% of distinct
            items, across {signal.thread.supportingCount} supporting item
            {signal.thread.supportingCount === 1 ? "" : "s"}.
          </p>
        </section>
      ) : null}

      {signal.challenges.length > 0 ? (
        <section className="space-y-2" aria-label="Completed challenges">
          <h3 className="text-lg font-semibold">Challenges you carried through</h3>
          <ul className="space-y-2">
            {signal.challenges.map((challenge) => (
              <li
                key={challenge.id}
                className="border border-[var(--stroke)] p-3 text-sm"
              >
                <span className="font-medium">{challenge.label}</span>
                {challenge.detail ? (
                  <span className="text-[var(--muted)]"> — {challenge.detail}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {signal.actions.length > 0 ? (
        <section className="space-y-2" aria-label="Runtime actions">
          <h3 className="text-lg font-semibold">Runtime actions</h3>
          <ul className="space-y-2">
            {signal.actions.map((action) => (
              <li key={action.id} className="border border-[var(--stroke)] p-3 text-sm">
                <span className="font-medium">{action.label}</span>
                <span className="instrument-label ml-2 text-xs">{action.status}</span>
                {action.detail ? (
                  <p className="mt-1 text-[var(--muted)]">{action.detail}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3" aria-label="Signal provenance">
        <button
          type="button"
          className="btn-secondary text-xs"
          aria-expanded={whyOpen}
          onClick={() => setWhyOpen((prev) => !prev)}
        >
          WHY THIS SIGNAL?
        </button>
        {whyOpen ? (
          <div className="space-y-4 border border-[var(--stroke)] p-4">
            <div>
              <h3 className="instrument-label text-xs tracking-wide">What informed it</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                {signal.why.inputs.map((input) => (
                  <li key={input}>{input}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="instrument-label text-xs tracking-wide">
                What it explicitly excludes
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                {signal.why.excluded.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {signal.discardedRefs.length > 0 ? (
              <p className="font-mono text-xs text-[var(--muted)]">
                non-canonical refs discarded: {signal.discardedRefs.length}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section
        className="border border-[var(--stroke)] p-4"
        aria-label="Journey integrity manifest"
      >
        <h3 className="text-sm font-semibold">Journey integrity manifest</h3>
        <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--muted)]">
          <li>
            canonical nodes represented: {signal.integrity.canonicalNodesRepresented}
          </li>
          <li>
            sanitised runtime actions represented:{" "}
            {signal.integrity.sanitisedActionsRepresented}
          </li>
          <li>external tracking used: {signal.integrity.externalTrackingUsed}</li>
          <li>
            persistent profiles created: {signal.integrity.persistentProfilesCreated}
          </li>
          <li>inferred personal traits: {signal.integrity.inferredPersonalTraits}</li>
          <li>fabricated interactions: {signal.integrity.fabricatedInteractions}</li>
        </ul>
      </section>

      <section className="space-y-4" aria-label="The last node">
        <h3 className="page-title text-xl">{ENDING_UNTESTABLE_LINE}</h3>
        <p className="text-lg font-medium">{ENDING_UNTESTABLE_ANSWER}</p>
        <p className="text-sm text-[var(--muted)]">{ENDING_LAST_NODE}</p>
        <ul className="flex flex-wrap gap-4 text-sm" aria-label="Contact actions">
          <li>
            <a className="underline underline-offset-4" href={`mailto:${contact.email}`}>
              Email
            </a>
          </li>
          <li>
            <Link className="underline underline-offset-4" href="/cv">
              CV
            </Link>
          </li>
          <li>
            <a
              className="underline underline-offset-4"
              href={contact.linkedin}
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              className="underline underline-offset-4"
              href={contact.github}
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
