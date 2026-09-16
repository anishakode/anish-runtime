"use client";

import Link from "next/link";
import { useState } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import { useRuntimeTraceOptional } from "@/components/runtime-trace/runtime-trace-context";
import { useSessionRuntimeOptional } from "@/components/session/session-runtime-context";
import {
  ANSWER_KEY_NOTICE,
  INTERVIEW_ENTRY_LINE,
  INTERVIEW_TOPIC_LABEL,
  MAX_INTERVIEW_QUESTIONS,
} from "@/lib/interview/catalog";
import type { ResolvedInterviewQuestion } from "@/lib/interview/resolve";
import { selectInterviewSet, type InterviewSet } from "@/lib/interview/select";

type InterviewMyWorkProps = {
  catalog: ResolvedInterviewQuestion[];
};

export function InterviewMyWork({ catalog }: InterviewMyWorkProps) {
  const session = useSessionRuntimeOptional();
  const runtimeTrace = useRuntimeTraceOptional();
  const [set, setSet] = useState<InterviewSet | null>(null);
  const [openWhy, setOpenWhy] = useState<string | null>(null);

  function build() {
    const next = selectInterviewSet(catalog, session?.events ?? []);
    setSet(next);
    runtimeTrace?.record({
      action: "INTERVIEW_SET",
      status: next.generated ? "OK" : "GAP",
      evidenceCount: next.questions.reduce((sum, q) => sum + q.evidence.length, 0),
      architectureStages: ["SESSION", "TRUTH", "INTERFACE"],
      note: `${next.questions.length} questions from ${next.consideredItemIds.length} canonical items`,
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3" aria-labelledby="interview-intro-heading">
        <h2 id="interview-intro-heading" className="text-lg font-semibold">
          {INTERVIEW_ENTRY_LINE}
        </h2>
        <p className="text-sm text-[var(--muted)]">
          RUNTIME reads the canonical evidence you actually inspected in this session and
          returns at most {MAX_INTERVIEW_QUESTIONS} technical questions. Search text alone
          does not count. Nothing is stored.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary text-xs" onClick={build}>
            BUILD QUESTION SET
          </button>
          {set ? (
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => {
                setSet(null);
                setOpenWhy(null);
              }}
            >
              Clear set
            </button>
          ) : null}
        </div>
      </section>

      {set ? (
        <section className="space-y-6" aria-label="Interview question set">
          <p className="text-sm text-[var(--muted)]">
            Canonical items used: {set.consideredItemIds.length}
            {set.ignoredInputs.length > 0
              ? ` · non-canonical inputs ignored: ${set.ignoredInputs.length}`
              : ""}
          </p>

          {set.generated ? (
            <ol className="space-y-6" aria-label="Questions">
              {set.questions.map((question) => (
                <li key={question.id} className="border border-[var(--stroke)] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="instrument-label text-xs tracking-wide">
                      {question.archetype}
                    </span>
                    <span className="instrument-label text-xs text-[var(--muted)]">
                      {INTERVIEW_TOPIC_LABEL[question.topic]}
                    </span>
                  </div>
                  <p className="mt-3 font-medium text-[var(--on-surface)]">
                    {question.lead}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Follow-up: {question.followUp}
                  </p>

                  <button
                    type="button"
                    className="btn-secondary mt-3 text-xs"
                    aria-expanded={openWhy === question.id}
                    onClick={() =>
                      setOpenWhy((prev) => (prev === question.id ? null : question.id))
                    }
                  >
                    WHY THIS QUESTION?
                  </button>

                  {openWhy === question.id ? (
                    <div className="mt-3 space-y-2 border-t border-[var(--stroke)] pt-3">
                      <p className="text-sm">{question.why}</p>
                      <p className="text-sm text-[var(--muted)]">{question.fairness}</p>
                      <p className="font-mono text-xs text-[var(--muted)]">
                        matched triggers: {question.matchedTriggerIds.join(" · ")}
                      </p>
                      <p className="font-mono text-xs text-[var(--muted)]">
                        canonical sources: {question.sourceCount}
                      </p>
                    </div>
                  ) : null}

                  <ul className="mt-3 space-y-2" aria-label="Supporting evidence">
                    {question.evidence.map((item) => (
                      <li key={item.id} className="text-sm">
                        <EvidenceBadge state={item.state} />
                        <p className="mt-1">
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="underline underline-offset-4"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            item.title
                          )}{" "}
                          <span className="text-[var(--muted)]">
                            · {item.sourceCount} source
                            {item.sourceCount === 1 ? "" : "s"}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm" role="status">
              {set.reason}
            </p>
          )}
        </section>
      ) : null}

      {/*
       * Outside the `set` guard on purpose: the boundary is a standing claim
       * about what this surface will never produce, so it has to be readable
       * before a set is built and after one is cleared — not only alongside
       * questions.
       */}
      <div className="border border-[var(--stroke)] p-4" aria-label="Answer key">
        {ANSWER_KEY_NOTICE.map((line, index) => (
          <p
            key={line}
            className={
              index === 0
                ? "instrument-label text-xs tracking-wide"
                : "mt-1 text-sm text-[var(--muted)]"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
