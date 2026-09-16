import { loadEvidenceGraph, getEvidenceStats } from "../src/lib/evidence/load-graph";
import {
  buildPublicEvidenceManifest,
  PUBLIC_EVIDENCE_SCHEMA_ID,
} from "../src/lib/evidence/public-manifest";

try {
  const graph = loadEvidenceGraph();
  const stats = getEvidenceStats(graph);
  console.log("Evidence graph OK");
  console.log(JSON.stringify(stats, null, 2));

  const manifest = buildPublicEvidenceManifest(graph);
  if (manifest.schema !== PUBLIC_EVIDENCE_SCHEMA_ID) {
    throw new Error("Unexpected public manifest schema id");
  }
  if (manifest.stats.nodes !== stats.nodes) {
    throw new Error("Public manifest node count diverges from graph");
  }
  console.log("Public evidence manifest OK");
  console.log(
    JSON.stringify(
      {
        schema: manifest.schema,
        schemaVersion: manifest.schemaVersion,
        stats: manifest.stats,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error("Evidence validation failed:");
  console.error(error);
  process.exit(1);
}
