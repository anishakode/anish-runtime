import { describe, expect, it } from "vitest";
import {
  MIN_LEADING_SHARE,
  MIN_MEANINGFUL_INTERACTIONS,
  distinctEvents,
  evaluateSessionSignal,
  orderProjectsByCategory,
  type SessionTraceEvent,
} from "@/lib/session";

function event(
  itemId: string,
  category: SessionTraceEvent["category"],
  reason = itemId,
): SessionTraceEvent {
  return { itemId, category, reason, at: 1 };
}

describe("session distinct events (M19)", () => {
  it("collapses repeated clicks on the same item", () => {
    const events = [
      event("lab:mlops", "ML_ENGINEERING"),
      event("lab:mlops", "ML_ENGINEERING"),
      event("lab:mlops", "ML_ENGINEERING"),
      event("project:proj.malware-pdf", "ML_ENGINEERING"),
    ];
    expect(distinctEvents(events)).toHaveLength(2);
  });
});

describe("evaluateSessionSignal (M19)", () => {
  it("does not detect below interaction threshold", () => {
    const result = evaluateSessionSignal([
      event("lab:mlops", "ML_ENGINEERING"),
      event("project:proj.malware-pdf", "ML_ENGINEERING"),
      event("project:proj.fraud-detection", "ML_ENGINEERING"),
    ]);
    expect(result.detected).toBe(false);
    if (!result.detected) {
      expect(result.interactionCount).toBeLessThan(MIN_MEANINGFUL_INTERACTIONS);
    }
  });

  it("rejects when repeated clicks fake volume without distinct support", () => {
    const events = Array.from({ length: 10 }, () => event("lab:mlops", "ML_ENGINEERING"));
    const result = evaluateSessionSignal(events);
    expect(result.detected).toBe(false);
    expect(distinctEvents(events)).toHaveLength(1);
  });

  it("detects a clear ML ENGINEERING lean with ≥60% share", () => {
    const events = [
      event("lab:mlops", "ML_ENGINEERING"),
      event("project:proj.mlops-governance", "ML_ENGINEERING"),
      event("project:proj.malware-pdf", "ML_ENGINEERING"),
      event("lab:malware", "ML_ENGINEERING"),
      event("lab:steward", "AI_ENGINEERING"),
    ];
    const result = evaluateSessionSignal(events);
    expect(result.detected).toBe(true);
    if (result.detected) {
      expect(result.leading).toBe("ML_ENGINEERING");
      expect(result.share).toBeGreaterThanOrEqual(MIN_LEADING_SHARE);
      expect(result.supportingCount).toBeGreaterThanOrEqual(2);
      expect(result.unusedNotice).toMatch(/Session-only/);
    }
  });

  it("fires at exactly the 60% threshold, not just above it", () => {
    // 3 of 5 distinct items is exactly MIN_LEADING_SHARE. The comparison is
    // `share < MIN_LEADING_SHARE`, so the boundary must count as detected —
    // flipping it to `<=` would break here and nowhere else.
    const events = [
      event("lab:mlops", "ML_ENGINEERING"),
      event("project:proj.mlops-governance", "ML_ENGINEERING"),
      event("project:proj.malware-pdf", "ML_ENGINEERING"),
      event("lab:steward", "AI_ENGINEERING"),
      event("project:proj.park-finder", "SOFTWARE_CLOUD"),
    ];
    const result = evaluateSessionSignal(events);
    expect(result.detected).toBe(true);
    if (result.detected) {
      expect(result.share).toBe(MIN_LEADING_SHARE);
      expect(result.leading).toBe("ML_ENGINEERING");
      expect(result.supportingCount).toBe(3);
    }
  });

  it("rejects a balanced split without a 60% winner", () => {
    const events = [
      event("lab:mlops", "ML_ENGINEERING"),
      event("project:proj.malware-pdf", "ML_ENGINEERING"),
      event("lab:steward", "AI_ENGINEERING"),
      event("project:proj.steward-ai", "AI_ENGINEERING"),
    ];
    const result = evaluateSessionSignal(events);
    expect(result.detected).toBe(false);
    if (!result.detected) {
      expect(result.reason).toMatch(/below 60%|tied|clear winner/i);
    }
  });
});

describe("orderProjectsByCategory (M19)", () => {
  it("prioritizes MLOps first for ML ENGINEERING without dropping projects", () => {
    const projects = [
      { slug: "steward-ai" },
      { slug: "mlops-governance-dashboard" },
      { slug: "park-finder" },
    ];
    const ordered = orderProjectsByCategory(projects, "ML_ENGINEERING");
    expect(ordered.map((p) => p.slug)).toEqual([
      "mlops-governance-dashboard",
      "steward-ai",
      "park-finder",
    ]);
    expect(ordered).toHaveLength(3);
  });

  it("returns original order when no category is active", () => {
    const projects = [{ slug: "b" }, { slug: "a" }];
    expect(orderProjectsByCategory(projects, null).map((p) => p.slug)).toEqual([
      "b",
      "a",
    ]);
  });
});
