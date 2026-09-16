import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import {
  DEEP_MIN_ACTIONS,
  DEEP_MIN_NODES,
  WHY_SIGNAL_EXCLUDED,
  buildEndingSignal,
  buildJourneyCatalog,
  classifyDensity,
} from "@/lib/ending";
import { createTraceEntry, type RuntimeTraceEntry } from "@/lib/runtime-trace";
import type { SessionTraceEvent } from "@/lib/session";

const catalog = buildJourneyCatalog(getGraph());

function event(
  itemId: string,
  category: SessionTraceEvent["category"],
  reason = `Opened ${itemId}`,
): SessionTraceEvent {
  return { itemId, category, reason, at: 1 };
}

function trace(
  action: RuntimeTraceEntry["action"],
  seq: number,
  note: string | null = null,
): RuntimeTraceEntry {
  const result = createTraceEntry({ action, status: "OK", note }, seq, 1000 + seq);
  if (!result.ok) throw new Error(result.error);
  return result.entry;
}

describe("journey catalogue (M23)", () => {
  it("resolves canonical items to graph-backed labels and hrefs", () => {
    expect(catalog["project:proj.mlops-governance"]).toMatchObject({
      href: "/work/mlops-governance-dashboard",
      evidenceState: "PUBLIC_CODE_VERIFIED",
    });
    expect(catalog["lab:malware"]).toMatchObject({
      label: "PDF Malware Explainability Lab",
      href: "/labs/malware",
      evidenceState: "PORTFOLIO_EXTENSION",
    });
    expect(catalog["route:cv"]).toMatchObject({ href: "/cv", evidenceState: null });
  });

  it("has no entry for free-text query refs", () => {
    expect(catalog["query:psi drift"]).toBeUndefined();
  });
});

describe("classifyDensity (M23)", () => {
  it("keeps an inactive session SHALLOW", () => {
    expect(classifyDensity(0, 0)).toBe("SHALLOW");
    expect(classifyDensity(2, 0)).toBe("SHALLOW");
  });

  it("promotes to STANDARD on modest exploration or a single action", () => {
    expect(classifyDensity(3, 0)).toBe("STANDARD");
    expect(classifyDensity(0, 1)).toBe("STANDARD");
  });

  it("requires both node and action depth for DEEP", () => {
    expect(classifyDensity(DEEP_MIN_NODES, DEEP_MIN_ACTIONS)).toBe("DEEP");
    expect(classifyDensity(DEEP_MIN_NODES, DEEP_MIN_ACTIONS - 1)).toBe("STANDARD");
    expect(classifyDensity(DEEP_MIN_NODES - 1, DEEP_MIN_ACTIONS)).toBe("STANDARD");
  });
});

describe("buildEndingSignal (M23)", () => {
  it("returns an empty, honest signal for a visitor who did nothing", () => {
    const signal = buildEndingSignal(catalog, [], []);
    expect(signal.density).toBe("SHALLOW");
    expect(signal.nodes).toEqual([]);
    expect(signal.actions).toEqual([]);
    expect(signal.challenges).toEqual([]);
    expect(signal.thread).toBeNull();
    expect(signal.integrity.canonicalNodesRepresented).toBe(0);
    expect(signal.integrity.fabricatedInteractions).toBe(0);
  });

  it("orders canonical nodes by first visit and keeps the visit reason", () => {
    const signal = buildEndingSignal(
      catalog,
      [
        event("lab:mlops", "ML_ENGINEERING", "Opened /labs/mlops"),
        event("project:proj.steward-ai", "AI_ENGINEERING", "Inspected steward"),
        event("lab:mlops", "ML_ENGINEERING", "Opened /labs/mlops again"),
      ],
      [],
    );
    expect(signal.nodes.map((n) => n.itemId)).toEqual([
      "lab:mlops",
      "project:proj.steward-ai",
    ]);
    expect(signal.nodes.map((n) => n.order)).toEqual([1, 2]);
    expect(signal.nodes[0]?.reason).toBe("Opened /labs/mlops");
  });

  it("discards non-canonical refs instead of rendering them", () => {
    const signal = buildEndingSignal(
      catalog,
      [
        event("query:what is psi", "ML_ENGINEERING"),
        event("lab:mlops", "ML_ENGINEERING"),
      ],
      [],
    );
    expect(signal.nodes).toHaveLength(1);
    expect(signal.discardedRefs).toEqual(["query:what is psi"]);
    expect(JSON.stringify(signal.nodes)).not.toMatch(/what is psi/);
  });

  it("separates completed challenges from ordinary runtime actions", () => {
    const signal = buildEndingSignal(
      catalog,
      [event("lab:mlops", "ML_ENGINEERING")],
      [
        trace("SIGNAL_INTERPRET", 1),
        trace("CHALLENGE_COMPLETED", 2, "MLOps controlled incident recovered"),
        trace("FORK_BRANCH", 3),
      ],
    );
    expect(signal.challenges.map((c) => c.label)).toEqual(["Challenge completed"]);
    expect(signal.actions.map((a) => a.label)).toEqual([
      "Signal interpretation",
      "Fork Anish branch",
    ]);
    expect(signal.integrity.sanitisedActionsRepresented).toBe(3);
  });

  it("reaches DEEP only when a real session earns it", () => {
    const events = [
      event("lab:mlops", "ML_ENGINEERING"),
      event("project:proj.mlops-governance", "ML_ENGINEERING"),
      event("lab:malware", "ML_ENGINEERING"),
      event("project:proj.malware-pdf", "ML_ENGINEERING"),
      event("project:proj.fraud-detection", "ML_ENGINEERING"),
      event("project:proj.feynn-ev", "ML_ENGINEERING"),
    ];
    const entries = [
      trace("SIGNAL_INTERPRET", 1),
      trace("FORK_BRANCH", 2),
      trace("CHALLENGE_COMPLETED", 3),
    ];
    const signal = buildEndingSignal(catalog, events, entries);
    expect(signal.density).toBe("DEEP");
    expect(signal.thread?.label).toBe("ML ENGINEERING");
  });

  it("omits the thread when no deterministic lead exists", () => {
    const signal = buildEndingSignal(
      catalog,
      [
        event("lab:mlops", "ML_ENGINEERING"),
        event("project:proj.steward-ai", "AI_ENGINEERING"),
      ],
      [],
    );
    expect(signal.thread).toBeNull();
  });

  it("publishes an integrity manifest with zeroed tracking and inference", () => {
    const signal = buildEndingSignal(
      catalog,
      [event("lab:mlops", "ML_ENGINEERING")],
      [trace("SIGNAL_INTERPRET", 1)],
    );
    expect(signal.integrity).toMatchObject({
      canonicalNodesRepresented: 1,
      sanitisedActionsRepresented: 1,
      externalTrackingUsed: 0,
      persistentProfilesCreated: 0,
      inferredPersonalTraits: 0,
      fabricatedInteractions: 0,
    });
  });

  it("declares the excluded inference categories", () => {
    for (const excluded of [
      "Employer identity",
      "Location inference",
      "Demographic inference",
      "Outside browsing history",
      "Raw job description text",
      "Raw Signal queries",
      "Persistent behaviour profiles",
    ]) {
      expect(WHY_SIGNAL_EXCLUDED).toContain(excluded);
    }
  });
});
