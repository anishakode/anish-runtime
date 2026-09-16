import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";
import {
  assertPlanHasNoFactualAuthority,
  composeFromEvidence,
  composeFromPlan,
  interpretWithSignal,
  planUiFromEvidence,
  validateUiPlan,
} from "@/lib/signal";

describe("ui_plan validation (M18)", () => {
  it("accepts a minimal GapNotice plan", () => {
    const result = validateUiPlan({
      version: 1,
      layout: "stack",
      blocks: [{ type: "GapNotice" }],
    });
    expect(result.ok).toBe(true);
  });

  it("rejects unknown component types", () => {
    const result = validateUiPlan({
      version: 1,
      layout: "stack",
      blocks: [{ type: "ChatBubble", text: "hi" }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects plans that smuggle factual title fields", () => {
    const result = assertPlanHasNoFactualAuthority({
      version: 1,
      layout: "stack",
      blocks: [
        {
          type: "ProjectCard",
          projectId: "proj.mlops-governance",
          title: "Invented title",
        } as never,
      ],
    });
    // The strict schema is the first line of defence.
    const validated = validateUiPlan({
      version: 1,
      layout: "stack",
      blocks: [
        {
          type: "ProjectCard",
          projectId: "proj.mlops-governance",
          title: "Invented title",
        },
      ],
    });
    expect(validated.ok).toBe(false);

    // The guard is the second, for a plan cast past the schema. Assert it by
    // name: if it ever stops refusing "title", this must fail rather than pass
    // on the schema's behalf.
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toContain("title");
  });

  it("rejects Comparison with fewer than two evidence ids", () => {
    const result = validateUiPlan({
      version: 1,
      layout: "stack",
      blocks: [
        {
          type: "Comparison",
          evidenceIds: ["project:proj.mlops-governance"],
        },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects empty blocks array", () => {
    const result = validateUiPlan({
      version: 1,
      layout: "stack",
      blocks: [],
    });
    expect(result.ok).toBe(false);
  });
});

describe("compose rehydration (M18)", () => {
  const graph = getGraph();
  const documents = buildSearchIndex(graph);

  it("composes a view from cardstack evidence with graph-backed titles", () => {
    const interpretation = interpretWithSignal("cardstack", documents);
    expect(interpretation.composeStatus).toBe("composed");
    expect(interpretation.composed).not.toBeNull();
    expect(interpretation.uiPlan).not.toBeNull();
    expect(interpretation.uiPlan?.blocks.every((b) => !("title" in b))).toBe(true);
    const titles = interpretation.composed!.blocks.flatMap((b) => {
      if (b.type === "ProjectCard" || b.type === "ExperienceCard") return [b.title];
      if (b.type === "EvidenceMap") return b.items.map((i) => i.title);
      return [];
    });
    expect(titles.some((t) => /cardstack|data|cloud|engineer/i.test(t))).toBe(true);
  });

  it("returns gap compose for nonsense queries", () => {
    const interpretation = interpretWithSignal("zzzznotanentity", documents);
    expect(interpretation.composeStatus).toBe("gap");
    expect(interpretation.composed?.blocks[0]?.type).toBe("GapNotice");
  });

  it("falls back entirely when plan references unknown project id", () => {
    const result = composeFromPlan(
      {
        version: 1,
        layout: "stack",
        blocks: [{ type: "ProjectCard", projectId: "proj.does-not-exist" }],
      },
      graph,
    );
    expect(result.status).toBe("fallback");
    expect(result.composed).toBeNull();
    expect(result.fallbackReason).toMatch(/unknown projectId/);
  });

  it("falls back when ArchitectureStrip targets a non-MLOps project", () => {
    const result = composeFromPlan(
      {
        version: 1,
        layout: "stack",
        blocks: [{ type: "ArchitectureStrip", projectId: "proj.steward-ai" }],
      },
      graph,
    );
    expect(result.status).toBe("fallback");
    expect(result.composed).toBeNull();
  });

  it("never upgrades LIMITED_EVIDENCE through composition", () => {
    const interpretation = interpretWithSignal("shap", documents);
    expect(interpretation.composeStatus).toBe("composed");
    const states: string[] = [];
    for (const block of interpretation.composed!.blocks) {
      if ("evidenceState" in block && block.evidenceState) {
        states.push(block.evidenceState);
      }
      if (block.type === "EvidenceMap" || block.type === "Comparison") {
        for (const item of block.items) states.push(item.evidenceState);
      }
    }
    expect(states).toContain("LIMITED_EVIDENCE");
  });

  it("planUiFromEvidence emits only allowlisted component types", () => {
    const interpretation = interpretWithSignal("mlops", documents);
    const plan = planUiFromEvidence(interpretation.evidence, graph);
    for (const block of plan.blocks) {
      expect([
        "EvidenceMap",
        "ProjectCard",
        "ArchitectureStrip",
        "MetricBlock",
        "SourceBadge",
        "Timeline",
        "Comparison",
        "GapNotice",
        "ExperienceCard",
        "SkillEvidence",
      ]).toContain(block.type);
    }
    const composed = composeFromEvidence(interpretation.evidence, graph);
    expect(composed.status).not.toBe("fallback");
  });
});
