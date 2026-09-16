import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  REALITY_LABELS,
  SURFACE_LAYERS,
  SURFACE_LAYER_IDS,
  countByReality,
  getSurfaceLayer,
} from "@/lib/surface";
import {
  NEVER_RECORDED,
  ALLOWED_TRACE_FIELDS,
  MAX_NOTE_LENGTH,
  NOT_COLLECTED,
  NOT_MEASURED,
  RUNTIME_TRACE_LIMIT,
  appendTraceEntry,
  createTraceEntry,
  formatMetric,
  formatStages,
  formatToolNames,
  type RuntimeTraceEntry,
} from "@/lib/runtime-trace";

describe("Under the Surface layers (M22)", () => {
  it("exposes exactly the five handoff layers in order", () => {
    expect(SURFACE_LAYER_IDS).toEqual([
      "INTERFACE",
      "ORCHESTRATION",
      "TRUTH",
      "SESSION",
      "RUNTIME",
    ]);
    expect(SURFACE_LAYERS.map((l) => l.id)).toEqual([...SURFACE_LAYER_IDS]);
  });

  it("labels every subsystem with an allowed reality label", () => {
    for (const layer of SURFACE_LAYERS) {
      expect(layer.subsystems.length).toBeGreaterThan(0);
      for (const sub of layer.subsystems) {
        expect(REALITY_LABELS).toContain(sub.reality);
      }
    }
  });

  it("points every subsystem at a path that exists in this repository", () => {
    for (const layer of SURFACE_LAYERS) {
      for (const sub of layer.subsystems) {
        expect(existsSync(sub.path), `${sub.id} → ${sub.path}`).toBe(true);
      }
    }
  });

  it("never presents a lab as real production runtime", () => {
    const labs = SURFACE_LAYERS.flatMap((l) => l.subsystems).filter((s) =>
      /lab|incident/i.test(s.name),
    );
    expect(labs.length).toBeGreaterThan(0);
    for (const lab of labs) {
      expect(lab.reality).toBe("PORTFOLIO_SIMULATION");
    }
  });

  it("marks the hosted LLM as an optional provider, not real runtime", () => {
    const llm = getSurfaceLayer("ORCHESTRATION").subsystems.find(
      (s) => s.id === "sub.llm",
    );
    expect(llm?.reality).toBe("OPTIONAL_PROVIDER");
  });

  it("keeps graph validation a build-time system", () => {
    const graph = getSurfaceLayer("TRUTH").subsystems.find((s) => s.id === "sub.graph");
    expect(graph?.reality).toBe("BUILD_TIME_SYSTEM");
  });

  it("rejects an unknown layer id", () => {
    // @ts-expect-error — exercising the runtime guard
    expect(() => getSurfaceLayer("MARKETING")).toThrow(/Unknown surface layer/);
  });

  it("counts subsystems across all four reality labels", () => {
    const counts = countByReality();
    const total = SURFACE_LAYERS.reduce((sum, l) => sum + l.subsystems.length, 0);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(total);
    expect(counts.PORTFOLIO_SIMULATION).toBeGreaterThan(0);
    expect(counts.OPTIONAL_PROVIDER).toBeGreaterThan(0);
    expect(counts.BUILD_TIME_SYSTEM).toBeGreaterThan(0);
  });
});

describe("Runtime trace safety (M22)", () => {
  function entry(overrides: Record<string, unknown> = {}) {
    return createTraceEntry(
      {
        action: "SIGNAL_INTERPRET",
        status: "OK",
        evidenceCount: 3,
        toolNames: ["search_evidence", "fetch_evidence"],
        architectureStages: ["INTERFACE", "ORCHESTRATION"],
        durationMs: 42,
        ...overrides,
      },
      1,
      1000,
    );
  }

  it("builds a labelled entry from safe fields", () => {
    const result = entry();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entry.id).toBe("trace-1");
    expect(result.entry.label).toBe("Signal interpretation");
    expect(result.entry.evidenceCount).toBe(3);
    expect(result.entry.durationMs).toBe(42);
  });

  it("rejects a raw Signal query", () => {
    const result = entry({ query: "what is PSI" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Rejected unsafe or malformed trace entry/);
  });

  it("rejects raw pasted job description text", () => {
    const result = entry({ action: "FORK_BRANCH", jobDescription: "Senior MLOps..." });
    expect(result.ok).toBe(false);
  });

  it("rejects prompts, model reasoning, and IP address fields", () => {
    for (const unsafe of [
      { prompt: "you are..." },
      { reasoning: "chain of thought" },
      { ip: "203.0.113.4" },
      { secret: "sk-live-1" },
    ]) {
      expect(entry(unsafe).ok).toBe(false);
    }
  });

  it("rejects an unknown action or status", () => {
    expect(entry({ action: "EXFILTRATE" }).ok).toBe(false);
    expect(entry({ status: "GREAT" }).ok).toBe(false);
  });

  it("names the field it refused so a rejection is explainable", () => {
    const result = entry({ jobDescription: "Senior MLOps..." });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('unrecognized field "jobDescription"');
  });

  it("refuses anything that is not a plain object", () => {
    for (const input of ["SIGNAL_INTERPRET", 42, null, undefined, [], [{}]]) {
      const result = createTraceEntry(input, 1, 1000);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/expected an object/);
    }
  });

  it("rejects malformed values in otherwise allowed fields", () => {
    const cases: [Record<string, unknown>, RegExp][] = [
      [{ evidenceCount: -1 }, /non-negative integer/],
      [{ evidenceCount: 2.5 }, /non-negative integer/],
      [{ evidenceCount: "3" }, /non-negative integer/],
      [{ toolNames: "search_evidence" }, /toolNames must be an array/],
      [{ toolNames: [""] }, /toolNames must contain non-empty strings/],
      [{ toolNames: [1] }, /toolNames must contain non-empty strings/],
      [{ architectureStages: {} }, /architectureStages must be an array/],
      [{ durationMs: -5 }, /durationMs must be a non-negative number/],
      [{ durationMs: "42" }, /durationMs must be a non-negative number/],
      [{ note: 12 }, /note must be a string/],
      [{ note: "x".repeat(MAX_NOTE_LENGTH + 1) }, /note exceeds 120 characters/],
    ];
    for (const [overrides, message] of cases) {
      const result = entry(overrides);
      expect(result.ok, JSON.stringify(overrides)).toBe(false);
      if (!result.ok) expect(result.error).toMatch(message);
    }
  });

  it("accepts the edges the contract does allow", () => {
    const zero = entry({ evidenceCount: 0, durationMs: 0, note: null });
    expect(zero.ok).toBe(true);
    if (!zero.ok) return;
    // Measured zero is a real value and must not be reported as NOT MEASURED.
    expect(zero.entry.evidenceCount).toBe(0);
    expect(formatMetric(zero.entry.evidenceCount)).toBe("0");

    const maxNote = entry({ note: "x".repeat(MAX_NOTE_LENGTH) });
    expect(maxNote.ok).toBe(true);
  });

  it("keeps the allowlist and the accepted fields in step", () => {
    const result = entry({ note: "ok" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const field of ALLOWED_TRACE_FIELDS) {
      expect(result.entry).toHaveProperty(field);
    }
  });

  it("defaults missing telemetry to null rather than zero", () => {
    const result = createTraceEntry(
      { action: "RECOMPILE_ACCEPTED", status: "OK" },
      2,
      1000,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entry.evidenceCount).toBeNull();
    expect(result.entry.durationMs).toBeNull();
    expect(result.entry.toolNames).toEqual([]);
  });

  it("bounds history to the last RUNTIME_TRACE_LIMIT actions", () => {
    let history: RuntimeTraceEntry[] = [];
    for (let i = 1; i <= RUNTIME_TRACE_LIMIT + 5; i += 1) {
      const result = createTraceEntry(
        { action: "INTERVIEW_SET", status: "OK" },
        i,
        1000 + i,
      );
      if (result.ok) history = appendTraceEntry(history, result.entry);
    }
    expect(history).toHaveLength(RUNTIME_TRACE_LIMIT);
    expect(history[0]?.id).toBe("trace-6");
    expect(history[history.length - 1]?.id).toBe(`trace-${RUNTIME_TRACE_LIMIT + 5}`);
  });

  it("says NOT MEASURED / NOT COLLECTED instead of inventing numbers", () => {
    expect(formatMetric(null)).toBe(NOT_MEASURED);
    expect(formatMetric(null, "ms")).toBe(NOT_MEASURED);
    expect(formatMetric(0)).toBe("0");
    expect(formatMetric(12, "ms")).toBe("12ms");
    expect(formatToolNames([])).toBe(NOT_COLLECTED);
    expect(formatToolNames(["search_evidence"])).toBe("search_evidence");
    expect(formatStages([])).toBe(NOT_COLLECTED);
    expect(formatStages(["TRUTH", "INTERFACE"])).toBe("TRUTH → INTERFACE");
  });

  it("declares what is never recorded", () => {
    expect(NEVER_RECORDED).toContain("Raw Signal queries");
    expect(NEVER_RECORDED).toContain("Raw pasted job description text");
    expect(NEVER_RECORDED).toContain("Prompts or hidden model reasoning");
  });
});
