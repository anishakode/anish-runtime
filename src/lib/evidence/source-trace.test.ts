import { describe, expect, it } from "vitest";
import { getGraph } from "./queries";
import {
  ksLabSourceTrace,
  malwareReportLabSourceTrace,
  malwareShapLabSourceTrace,
  psiLabSourceTrace,
  resolveSourceTrace,
  stewardMcpLabSourceTrace,
  toTraceSourceView,
} from "./source-trace";
import { MLOPS_SOURCE_TRACE } from "@/lib/mlops/evidence";
import { MALWARE_SOURCE_TRACE } from "@/lib/malware/evidence";
import { STEWARD_SOURCE_TRACE } from "@/lib/steward/evidence";

describe("resolveSourceTrace", () => {
  const graph = getGraph();

  it("resolves SHA-pinned GitHub sources for a claim", () => {
    const resolved = resolveSourceTrace(
      {
        claimLabel: "PSI",
        nodeId: MLOPS_SOURCE_TRACE.psiNodeId,
        sourceIds: [MLOPS_SOURCE_TRACE.psiSourceId],
      },
      graph,
    );
    expect(resolved.sources).toHaveLength(1);
    expect(resolved.sources[0]?.path).toBe(MLOPS_SOURCE_TRACE.psiSourcePath);
    expect(resolved.sources[0]?.commitSha).toBe(MLOPS_SOURCE_TRACE.commitSha);
    expect(resolved.sources[0]?.pinned).toBe(true);
  });

  it("rejects empty claim labels", () => {
    expect(() =>
      resolveSourceTrace({ claimLabel: "  ", sourceIds: ["src.mlops.drift-py"] }, graph),
    ).toThrow(/claimLabel is required/);
  });

  it("rejects empty source ids", () => {
    expect(() => resolveSourceTrace({ claimLabel: "PSI", sourceIds: [] }, graph)).toThrow(
      /sourceIds must be non-empty/,
    );
  });

  it("rejects unknown source ids", () => {
    expect(() =>
      resolveSourceTrace({ claimLabel: "PSI", sourceIds: ["src.does-not-exist"] }, graph),
    ).toThrow(/unknown source id/);
  });

  it("marks unpinned sources when commitSha or url missing", () => {
    const source = graph.sources.find((s) => !s.commitSha || !s.url);
    expect(source).toBeDefined();
    if (!source) return;
    expect(toTraceSourceView(source).pinned).toBe(false);
  });
});

describe("lab source traces", () => {
  it("PSI and KS lab traces match Evidence Graph fingerprints", () => {
    const graph = getGraph();
    const psi = psiLabSourceTrace();
    const ks = ksLabSourceTrace();
    const fromGraphPsi = resolveSourceTrace(
      { claimLabel: psi.claimLabel, sourceIds: [MLOPS_SOURCE_TRACE.psiSourceId] },
      graph,
    );
    const fromGraphKs = resolveSourceTrace(
      { claimLabel: ks.claimLabel, sourceIds: [MLOPS_SOURCE_TRACE.ksSourceId] },
      graph,
    );
    expect(psi.sources[0]?.commitSha).toBe(fromGraphPsi.sources[0]?.commitSha);
    expect(psi.sources[0]?.path).toBe(fromGraphPsi.sources[0]?.path);
    expect(ks.sources[0]?.commitSha).toBe(fromGraphKs.sources[0]?.commitSha);
    expect(ks.sources[0]?.path).toBe(fromGraphKs.sources[0]?.path);
  });

  it("Steward MCP lab trace matches Evidence Graph fingerprints", () => {
    const graph = getGraph();
    const mcp = stewardMcpLabSourceTrace();
    const fromGraph = resolveSourceTrace(
      { claimLabel: mcp.claimLabel, sourceIds: [STEWARD_SOURCE_TRACE.mcpSourceId] },
      graph,
    );
    expect(mcp.sources[0]?.commitSha).toBe(fromGraph.sources[0]?.commitSha);
    expect(mcp.sources[0]?.path).toBe(STEWARD_SOURCE_TRACE.mcpSourcePath);
    expect(mcp.sources[0]?.path).toBe(fromGraph.sources[0]?.path);
  });

  it("Malware report and SHAP lab traces match Evidence Graph fingerprints", () => {
    const graph = getGraph();
    const report = malwareReportLabSourceTrace();
    const shap = malwareShapLabSourceTrace();
    const fromGraphReport = resolveSourceTrace(
      {
        claimLabel: report.claimLabel,
        sourceIds: [MALWARE_SOURCE_TRACE.reportSourceId],
      },
      graph,
    );
    const fromGraphShap = resolveSourceTrace(
      {
        claimLabel: shap.claimLabel,
        sourceIds: [MALWARE_SOURCE_TRACE.reportSourceId],
      },
      graph,
    );
    expect(report.sources[0]?.commitSha).toBe("ca79ecc8a013e96d5514243603b174bf86e52ecd");
    expect(report.sources[0]?.commitSha).toBe(fromGraphReport.sources[0]?.commitSha);
    expect(report.sources[0]?.path).toBe(MALWARE_SOURCE_TRACE.reportSourcePath);
    expect(report.sources[0]?.path).toBe(fromGraphReport.sources[0]?.path);
    expect(shap.sources[0]?.commitSha).toBe(fromGraphShap.sources[0]?.commitSha);
    expect(shap.sources[0]?.path).toBe(fromGraphShap.sources[0]?.path);
  });
});
