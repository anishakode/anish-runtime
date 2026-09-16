/**
 * Deterministic session signal heuristic (M19).
 * Distinct items only — repeated clicks on one item cannot fake interest.
 */

import {
  SESSION_CATEGORIES,
  SESSION_CATEGORY_LABEL,
  type SessionCategory,
} from "./categories";

export const MIN_MEANINGFUL_INTERACTIONS = 4;
export const MIN_LEADING_SHARE = 0.6;
export const MIN_DISTINCT_SUPPORTING = 2;

export type SessionTraceEvent = {
  /** Canonical distinct key — repeats of the same id do not inflate interest. */
  itemId: string;
  category: SessionCategory;
  reason: string;
  at: number;
};

export type CategoryShare = {
  category: SessionCategory;
  label: string;
  count: number;
  share: number;
  itemIds: string[];
};

export type SessionSignal = {
  detected: true;
  leading: SessionCategory;
  leadingLabel: string;
  share: number;
  interactionCount: number;
  supportingCount: number;
  shares: CategoryShare[];
  recentReasons: string[];
  /** Honesty: what we did not use. */
  unusedNotice: string;
};

export type SessionSignalResult =
  | SessionSignal
  | {
      detected: false;
      interactionCount: number;
      shares: CategoryShare[];
      reason: string;
    };

/** Collapse to first-seen event per itemId (distinct support). */
export function distinctEvents(
  events: readonly SessionTraceEvent[],
): SessionTraceEvent[] {
  const seen = new Set<string>();
  const out: SessionTraceEvent[] = [];
  for (const event of events) {
    if (seen.has(event.itemId)) continue;
    seen.add(event.itemId);
    out.push(event);
  }
  return out;
}

export function computeCategoryShares(
  events: readonly SessionTraceEvent[],
): CategoryShare[] {
  const distinct = distinctEvents(events);
  const byCategory = new Map<SessionCategory, string[]>();
  for (const cat of SESSION_CATEGORIES) byCategory.set(cat, []);
  for (const event of distinct) {
    byCategory.get(event.category)!.push(event.itemId);
  }
  const total = distinct.length || 1;
  return SESSION_CATEGORIES.map((category) => {
    const itemIds = byCategory.get(category) ?? [];
    return {
      category,
      label: SESSION_CATEGORY_LABEL[category],
      count: itemIds.length,
      share: itemIds.length / total,
      itemIds,
    };
  }).sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

/**
 * Handoff heuristic:
 * ≥4 distinct interactions, ≥60% leading share, clear winner, ≥2 supporting items.
 */
export function evaluateSessionSignal(
  events: readonly SessionTraceEvent[],
): SessionSignalResult {
  const distinct = distinctEvents(events);
  const shares = computeCategoryShares(events);
  const interactionCount = distinct.length;

  if (interactionCount < MIN_MEANINGFUL_INTERACTIONS) {
    return {
      detected: false,
      interactionCount,
      shares,
      reason: `Need at least ${MIN_MEANINGFUL_INTERACTIONS} distinct interactions (have ${interactionCount}).`,
    };
  }

  const leading = shares[0]!;
  const second = shares[1];
  // Defensive only, and deliberately kept: past the check above there are at
  // least MIN_MEANINGFUL_INTERACTIONS (4) distinct items across the three
  // SESSION_CATEGORIES, so by pigeonhole the leading bucket already holds 2.
  // This branch therefore states the rule rather than enforcing it today, and
  // would start enforcing it if either constant moved.
  if (leading.count < MIN_DISTINCT_SUPPORTING) {
    return {
      detected: false,
      interactionCount,
      shares,
      reason: `Leading category needs at least ${MIN_DISTINCT_SUPPORTING} distinct supporting items.`,
    };
  }
  if (leading.share < MIN_LEADING_SHARE) {
    return {
      detected: false,
      interactionCount,
      shares,
      reason: `Leading share ${(leading.share * 100).toFixed(0)}% is below ${MIN_LEADING_SHARE * 100}%.`,
    };
  }
  if (second && leading.count === second.count) {
    return {
      detected: false,
      interactionCount,
      shares,
      reason: "No clear winner — top categories are tied.",
    };
  }

  const recentReasons = [...distinct]
    .reverse()
    .slice(0, 5)
    .map((e) => e.reason);

  return {
    detected: true,
    leading: leading.category,
    leadingLabel: leading.label,
    share: leading.share,
    interactionCount,
    supportingCount: leading.count,
    shares,
    recentReasons,
    unusedNotice:
      "Session-only. No demographics, cookies beyond this tab’s memory, or persistent visitor profile. Evidence states are unchanged.",
  };
}
