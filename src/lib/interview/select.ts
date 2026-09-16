/**
 * Interview set selection (M21).
 * Only canonical evidence interactions count — free-text queries cannot create questions.
 */

import { SESSION_ITEM_CATEGORY } from "@/lib/session/categories";
import { distinctEvents, type SessionTraceEvent } from "@/lib/session/trace";
import {
  ANSWER_KEY_NOTICE,
  MAX_INTERVIEW_QUESTIONS,
  type InterviewArchetype,
  type InterviewTopic,
} from "./catalog";
import type { ResolvedInterviewQuestion } from "./resolve";

export type SelectedInterviewQuestion = ResolvedInterviewQuestion & {
  /** Canonical session item ids that earned this question. */
  matchedTriggerIds: string[];
};

export type InterviewSet = {
  generated: boolean;
  questions: SelectedInterviewQuestion[];
  /** Canonical item ids that were eligible inputs. */
  consideredItemIds: string[];
  /** Inputs deliberately ignored (free text, unknown ids). */
  ignoredInputs: string[];
  reason: string | null;
  answerKey: readonly string[];
};

export const NO_TRAIL_REASON =
  "No canonical evidence was inspected in this session yet. Open a project or run a lab, then build the set.";

export const NO_CATALOG_MATCH_REASON =
  "Your trail did not reach a topic with an evidence-bounded question set. RUNTIME will not invent questions for it.";

function isCanonicalItem(itemId: string): boolean {
  return Object.hasOwn(SESSION_ITEM_CATEGORY, itemId);
}

/** Deterministic: catalogue order breaks every tie. */
function rank(
  candidates: readonly SelectedInterviewQuestion[],
): SelectedInterviewQuestion[] {
  return [...candidates].sort(
    (a, b) => b.matchedTriggerIds.length - a.matchedTriggerIds.length,
  );
}

export function selectInterviewSet(
  catalog: readonly ResolvedInterviewQuestion[],
  events: readonly SessionTraceEvent[],
): InterviewSet {
  const distinct = distinctEvents(events);
  const considered: string[] = [];
  const ignored: string[] = [];

  for (const event of distinct) {
    if (isCanonicalItem(event.itemId)) considered.push(event.itemId);
    else ignored.push(event.itemId);
  }

  const base = {
    consideredItemIds: considered,
    ignoredInputs: ignored,
    answerKey: ANSWER_KEY_NOTICE,
  };

  if (considered.length === 0) {
    return { generated: false, questions: [], reason: NO_TRAIL_REASON, ...base };
  }

  const consideredSet = new Set(considered);
  const candidates: SelectedInterviewQuestion[] = [];
  for (const question of catalog) {
    const matchedTriggerIds = question.triggerItemIds.filter((id) =>
      consideredSet.has(id),
    );
    if (matchedTriggerIds.length === 0) continue;
    candidates.push({ ...question, matchedTriggerIds });
  }

  if (candidates.length === 0) {
    return { generated: false, questions: [], reason: NO_CATALOG_MATCH_REASON, ...base };
  }

  const ranked = rank(candidates);
  const picked: SelectedInterviewQuestion[] = [];
  const usedArchetypes = new Set<InterviewArchetype>();
  const usedTopics = new Set<InterviewTopic>();

  const take = (question: SelectedInterviewQuestion) => {
    picked.push(question);
    usedArchetypes.add(question.archetype);
    usedTopics.add(question.topic);
  };

  for (const question of ranked) {
    if (picked.length >= MAX_INTERVIEW_QUESTIONS) break;
    if (!usedArchetypes.has(question.archetype) && !usedTopics.has(question.topic)) {
      take(question);
    }
  }
  for (const question of ranked) {
    if (picked.length >= MAX_INTERVIEW_QUESTIONS) break;
    if (picked.includes(question)) continue;
    if (!usedArchetypes.has(question.archetype)) take(question);
  }
  for (const question of ranked) {
    if (picked.length >= MAX_INTERVIEW_QUESTIONS) break;
    if (picked.includes(question)) continue;
    take(question);
  }

  return { generated: true, questions: picked, reason: null, ...base };
}
