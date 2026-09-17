import { describe, expect, it } from "vitest";
import { buildJourneyCatalog } from "@/lib/ending/catalog";
import { getGraph } from "@/lib/evidence/queries";
import { RUNTIME_LABS, buildRuntimeLabViews } from "./catalog";
import { STATIC_INDEXABLE_ROUTES } from "@/lib/seo/routes";

describe("Runtime Lab registry", () => {
  it("resolves every lab against the graph — none silently omitted", () => {
    const views = buildRuntimeLabViews();
    // buildRuntimeLabViews skips labs whose node is missing. Pinning the count
    // to the registry length is what turns a silent omission into a failure.
    expect(views).toHaveLength(RUNTIME_LABS.length);
    expect(views).toHaveLength(3);
    expect(views.map((v) => v.itemId)).toEqual([
      "lab:mlops",
      "lab:steward",
      "lab:malware",
    ]);
  });

  it("omits a lab whose node is absent rather than inventing copy", () => {
    const graph = getGraph();
    const without = {
      ...graph,
      nodes: graph.nodes.filter((n) => n.id !== "ev.steward.runtime-lab"),
    };
    const views = buildRuntimeLabViews(without);
    expect(views).toHaveLength(2);
    expect(views.map((v) => v.itemId)).not.toContain("lab:steward");
    for (const view of views) {
      expect(view.summary.length).toBeGreaterThan(0);
    }
  });

  it("omits a lab whose node carries no summary, rather than rendering a blank", () => {
    // `summary` is optional on an evidence node, so this is reachable without
    // deleting anything — a card with an empty description would be the page
    // papering over a corpus gap.
    const graph = getGraph();
    const stripped = {
      ...graph,
      nodes: graph.nodes.map((n) =>
        n.id === "ev.malware.runtime-lab" ? { ...n, summary: undefined } : n,
      ),
    };
    const views = buildRuntimeLabViews(stripped);
    expect(views).toHaveLength(2);
    expect(views.map((v) => v.itemId)).not.toContain("lab:malware");
  });

  it("reads summary and state from the graph, never from local copy", () => {
    const graph = getGraph();
    const views = buildRuntimeLabViews(graph);
    expect(views.length).toBeGreaterThan(0);

    for (const view of views) {
      const node = graph.nodes.find((n) => n.id === view.nodeId);
      expect(node, `${view.nodeId} missing from the graph`).toBeDefined();
      expect(view.summary).toBe(node!.summary);
      expect(view.evidenceState).toBe(node!.state);
      // Every lab is a simulation and must badge as one. A lab that ever
      // claimed a stronger state than PORTFOLIO_EXTENSION would be claiming
      // the browser sim is the production runtime.
      expect(view.evidenceState).toBe("PORTFOLIO_EXTENSION");
    }
  });

  it("describes each lab in operating verbs, with no production claim", () => {
    for (const lab of RUNTIME_LABS) {
      expect(lab.action.length).toBeGreaterThan(0);
      expect(lab.action).not.toMatch(/\bproduction\b|\buptime\b|\bSLA\b/i);
    }
  });

  it("is the single source the journey catalog also uses", () => {
    // LAB_REFS in ending/catalog.ts is derived from RUNTIME_LABS. If someone
    // reintroduces a second hardcoded list, these labels and hrefs drift apart.
    const catalog = buildJourneyCatalog();
    for (const lab of RUNTIME_LABS) {
      const ref = catalog[lab.itemId];
      expect(ref, `${lab.itemId} missing from the journey catalog`).toBeDefined();
      expect(ref!.label).toBe(lab.label);
      expect(ref!.href).toBe(lab.href);
    }
  });

  it("keeps every lab href indexable and actually routed", () => {
    for (const lab of RUNTIME_LABS) {
      expect(STATIC_INDEXABLE_ROUTES).toContain(lab.href);
    }
    // The index itself must be indexable — it is now a primary nav entry.
    expect(STATIC_INDEXABLE_ROUTES).toContain("/labs");
  });
});
