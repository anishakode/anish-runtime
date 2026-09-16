import type { EvidenceGraph } from "./schema";

export type TraceSourceView = {
  id: string;
  title: string;
  type: string;
  repo?: string;
  path?: string;
  commitSha?: string;
  url?: string;
  note?: string;
  pinned: boolean;
};

export type ResolvedSourceTrace = {
  claimLabel: string;
  nodeId?: string;
  listAnchorId?: string;
  sources: TraceSourceView[];
};

/** Claim input for server-side resolution from the Evidence Graph. */
export type SourceTraceClaimInput = {
  claimLabel: string;
  nodeId?: string;
  sourceIds: string[];
  listAnchorId?: string;
};

export function toTraceSourceView(
  source: EvidenceGraph["sources"][number],
): TraceSourceView {
  const pinned = Boolean(source.commitSha && source.url);
  return {
    id: source.id,
    title: source.title ?? source.id,
    type: source.type,
    repo: source.repo,
    path: source.path,
    commitSha: source.commitSha,
    url: source.url,
    note: source.note,
    pinned,
  };
}

export function resolveSourceTrace(
  claim: SourceTraceClaimInput,
  graph: EvidenceGraph,
): ResolvedSourceTrace {
  if (!claim.claimLabel.trim()) {
    throw new Error("resolveSourceTrace: claimLabel is required");
  }
  if (claim.sourceIds.length === 0) {
    throw new Error("resolveSourceTrace: sourceIds must be non-empty");
  }

  const sources = claim.sourceIds.map((id) => {
    const source = graph.sources.find((s) => s.id === id);
    if (!source) {
      throw new Error(`resolveSourceTrace: unknown source id ${id}`);
    }
    return toTraceSourceView(source);
  });

  return {
    claimLabel: claim.claimLabel,
    nodeId: claim.nodeId,
    listAnchorId: claim.listAnchorId,
    sources,
  };
}

import { MLOPS_SOURCE_TRACE } from "@/lib/mlops/evidence";
import { MALWARE_SOURCE_TRACE } from "@/lib/malware/evidence";
import { STEWARD_SOURCE_TRACE } from "@/lib/steward/evidence";

/** Client-safe lab claims — fingerprints match content/evidence/sources.json. */
export function psiLabSourceTrace(): ResolvedSourceTrace {
  const sha = MLOPS_SOURCE_TRACE.commitSha;
  const path = MLOPS_SOURCE_TRACE.psiSourcePath;
  return {
    claimLabel: "Population Stability Index (PSI)",
    nodeId: MLOPS_SOURCE_TRACE.psiNodeId,
    listAnchorId: "source-trace-heading",
    sources: [
      {
        id: MLOPS_SOURCE_TRACE.psiSourceId,
        title: "Drift / PSI utilities",
        type: "github_file",
        repo: "anishakode/MLOps-Governance-Dashboard",
        path,
        commitSha: sha,
        url: `https://github.com/anishakode/MLOps-Governance-Dashboard/blob/${sha}/${path}`,
        pinned: true,
      },
    ],
  };
}

export function ksLabSourceTrace(): ResolvedSourceTrace {
  const sha = MLOPS_SOURCE_TRACE.commitSha;
  const path = MLOPS_SOURCE_TRACE.ksSourcePath;
  return {
    claimLabel: "Kolmogorov–Smirnov D",
    nodeId: MLOPS_SOURCE_TRACE.ksNodeId,
    listAnchorId: "source-trace-heading",
    sources: [
      {
        id: MLOPS_SOURCE_TRACE.ksSourceId,
        title: "Stats / KS utilities",
        type: "github_file",
        repo: "anishakode/MLOps-Governance-Dashboard",
        path,
        commitSha: sha,
        url: `https://github.com/anishakode/MLOps-Governance-Dashboard/blob/${sha}/${path}`,
        pinned: true,
      },
    ],
  };
}

export function stewardMcpLabSourceTrace(): ResolvedSourceTrace {
  const sha = STEWARD_SOURCE_TRACE.commitSha;
  const path = STEWARD_SOURCE_TRACE.mcpSourcePath;
  return {
    claimLabel: "Steward MCP tool server",
    nodeId: STEWARD_SOURCE_TRACE.mcpNodeId,
    listAnchorId: "steward-source-trace",
    sources: [
      {
        id: STEWARD_SOURCE_TRACE.mcpSourceId,
        title: "Steward MCP server",
        type: "github_file",
        repo: "anishakode/Steward_AI",
        path,
        commitSha: sha,
        url: `https://github.com/anishakode/Steward_AI/blob/${sha}/${path}`,
        pinned: true,
      },
    ],
  };
}

export function stewardSafetyLabSourceTrace(): ResolvedSourceTrace {
  const sha = STEWARD_SOURCE_TRACE.commitSha;
  const path = STEWARD_SOURCE_TRACE.readmeSourcePath;
  return {
    claimLabel: "Steward safety / prototype boundary",
    nodeId: STEWARD_SOURCE_TRACE.safetyNodeId,
    listAnchorId: "steward-source-trace",
    sources: [
      {
        id: STEWARD_SOURCE_TRACE.readmeSourceId,
        title: "Steward_AI README (boundaries + architecture)",
        type: "github_file",
        repo: "anishakode/Steward_AI",
        path,
        commitSha: sha,
        url: `https://github.com/anishakode/Steward_AI/blob/${sha}/${path}`,
        pinned: true,
      },
    ],
  };
}

export function malwareReportLabSourceTrace(): ResolvedSourceTrace {
  const sha = MALWARE_SOURCE_TRACE.commitSha;
  const path = MALWARE_SOURCE_TRACE.reportSourcePath;
  return {
    claimLabel: "Public malware explainability report",
    nodeId: MALWARE_SOURCE_TRACE.reportNodeId,
    listAnchorId: "malware-source-trace",
    sources: [
      {
        id: MALWARE_SOURCE_TRACE.reportSourceId,
        title:
          "Explainable Machine Learning Models for Detecting PDF Malware (public PDF)",
        type: "report",
        repo: "anishakode/Malware-Detection-Using-ML",
        path,
        commitSha: sha,
        url: `https://github.com/anishakode/Malware-Detection-Using-ML/blob/${sha}/${encodeURIComponent(path)}`,
        pinned: true,
      },
    ],
  };
}

export function malwareShapLabSourceTrace(): ResolvedSourceTrace {
  const sha = MALWARE_SOURCE_TRACE.commitSha;
  const path = MALWARE_SOURCE_TRACE.reportSourcePath;
  return {
    claimLabel: "Detailed SHAP / model internals (limited)",
    nodeId: MALWARE_SOURCE_TRACE.shapNodeId,
    listAnchorId: "malware-source-trace",
    sources: [
      {
        id: MALWARE_SOURCE_TRACE.reportSourceId,
        title:
          "Explainable Machine Learning Models for Detecting PDF Malware (public PDF)",
        type: "report",
        repo: "anishakode/Malware-Detection-Using-ML",
        path,
        commitSha: sha,
        url: `https://github.com/anishakode/Malware-Detection-Using-ML/blob/${sha}/${encodeURIComponent(path)}`,
        pinned: true,
        note: "LIMITED_EVIDENCE — detailed SHAP/model internals are not fully verified in public sources.",
      },
    ],
  };
}
