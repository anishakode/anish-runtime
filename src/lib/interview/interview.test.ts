import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import {
  ANSWER_KEY_NOTICE,
  INTERVIEW_CATALOG,
  MAX_INTERVIEW_QUESTIONS,
  buildInterviewCatalog,
  selectInterviewSet,
  NO_CATALOG_MATCH_REASON,
  NO_TRAIL_REASON,
} from "@/lib/interview";
import type { SessionTraceEvent } from "@/lib/session";

const graph = getGraph();
const catalog = buildInterviewCatalog(graph);

function event(
  itemId: string,
  category: SessionTraceEvent["category"],
): SessionTraceEvent {
  return { itemId, category, reason: itemId, at: 1 };
}

describe("interview catalogue binding (M21)", () => {
  it("binds every catalogue question to canonical evidence nodes", () => {
    expect(catalog).toHaveLength(INTERVIEW_CATALOG.length);
    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    for (const question of INTERVIEW_CATALOG) {
      for (const id of question.evidenceIds) {
        expect(nodeIds.has(id)).toBe(true);
      }
    }
  });

  it("reports real source counts from the graph", () => {
    const psiQuestion = catalog.find((q) => q.id === "q.mlops.verify-drift-math");
    expect(psiQuestion?.evidence.map((e) => e.id)).toEqual([
      "ev.mlops.psi",
      "ev.mlops.ks",
    ]);
    expect(psiQuestion?.sourceCount).toBe(2);
    expect(psiQuestion?.evidence[0]?.href).toBe("/work/mlops-governance-dashboard");
  });

  it("drops questions whose evidence is absent from the graph", () => {
    const resolved = buildInterviewCatalog(graph, [
      {
        ...INTERVIEW_CATALOG[0],
        id: "q.phantom",
        evidenceIds: ["ev.does-not-exist"],
      },
    ]);
    expect(resolved).toEqual([]);
  });

  it("never carries an answer key", () => {
    expect(ANSWER_KEY_NOTICE).toContain("Not generated.");
    const text = JSON.stringify(catalog).toLowerCase();
    expect(text).not.toContain("model answer");
    expect(text).not.toContain("fit score");
    expect(text).not.toContain("hiring recommendation");
  });
});

describe("selectInterviewSet (M21)", () => {
  it("returns no questions for an empty trail", () => {
    const set = selectInterviewSet(catalog, []);
    expect(set.generated).toBe(false);
    expect(set.questions).toEqual([]);
    expect(set.reason).toBe(NO_TRAIL_REASON);
  });

  it("ignores free-text query inputs — search alone cannot create questions", () => {
    const set = selectInterviewSet(catalog, [
      event("query:psi drift", "ML_ENGINEERING"),
      event("query:mcp", "AI_ENGINEERING"),
    ]);
    expect(set.generated).toBe(false);
    expect(set.reason).toBe(NO_TRAIL_REASON);
    expect(set.ignoredInputs).toEqual(["query:psi drift", "query:mcp"]);
    expect(set.consideredItemIds).toEqual([]);
  });

  it("explains honestly when the trail has no catalogued topic", () => {
    const set = selectInterviewSet(catalog, [
      event("project:proj.park-finder", "SOFTWARE_CLOUD"),
      event("route:cv", "SOFTWARE_CLOUD"),
    ]);
    expect(set.generated).toBe(false);
    expect(set.reason).toBe(NO_CATALOG_MATCH_REASON);
    expect(set.consideredItemIds).toEqual(["project:proj.park-finder", "route:cv"]);
  });

  it("caps the set at three questions and keeps archetypes distinct", () => {
    const set = selectInterviewSet(catalog, [
      event("lab:mlops", "ML_ENGINEERING"),
      event("project:proj.mlops-governance", "ML_ENGINEERING"),
      event("lab:steward", "AI_ENGINEERING"),
      event("project:proj.steward-ai", "AI_ENGINEERING"),
      event("lab:malware", "ML_ENGINEERING"),
      event("project:proj.malware-pdf", "ML_ENGINEERING"),
    ]);
    expect(set.generated).toBe(true);
    expect(set.questions).toHaveLength(MAX_INTERVIEW_QUESTIONS);
    const archetypes = set.questions.map((q) => q.archetype);
    expect(new Set(archetypes).size).toBe(MAX_INTERVIEW_QUESTIONS);
    const topics = set.questions.map((q) => q.topic);
    expect(new Set(topics).size).toBe(MAX_INTERVIEW_QUESTIONS);
  });

  it("is deterministic for the same trail", () => {
    const events = [
      event("lab:malware", "ML_ENGINEERING"),
      event("project:proj.malware-pdf", "ML_ENGINEERING"),
    ];
    const first = selectInterviewSet(catalog, events);
    const second = selectInterviewSet(catalog, events);
    expect(first.questions.map((q) => q.id)).toEqual(second.questions.map((q) => q.id));
    expect(first.questions.map((q) => q.id)).toEqual([
      "q.malware.defend-explainability",
      "q.malware.boundary-static-features",
    ]);
  });

  it("collapses repeated visits to one canonical item", () => {
    const set = selectInterviewSet(catalog, [
      event("lab:mlops", "ML_ENGINEERING"),
      event("lab:mlops", "ML_ENGINEERING"),
      event("lab:mlops", "ML_ENGINEERING"),
    ]);
    expect(set.consideredItemIds).toEqual(["lab:mlops"]);
    for (const question of set.questions) {
      expect(question.matchedTriggerIds).toEqual(["lab:mlops"]);
    }
  });

  it("records the canonical triggers that earned each question", () => {
    const set = selectInterviewSet(catalog, [
      event("lab:steward", "AI_ENGINEERING"),
      event("project:proj.steward-ai", "AI_ENGINEERING"),
    ]);
    expect(set.generated).toBe(true);
    for (const question of set.questions) {
      expect(question.matchedTriggerIds.length).toBeGreaterThan(0);
      for (const id of question.matchedTriggerIds) {
        expect(set.consideredItemIds).toContain(id);
      }
    }
  });

  it("passes weak evidence states through without upgrading them", () => {
    const set = selectInterviewSet(catalog, [event("lab:malware", "ML_ENGINEERING")]);
    const states = set.questions.flatMap((q) => q.evidence.map((e) => e.state));
    expect(states).toContain("LIMITED_EVIDENCE");
    expect(states).toContain("PORTFOLIO_EXTENSION");
  });
});
