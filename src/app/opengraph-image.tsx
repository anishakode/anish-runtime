import { ImageResponse } from "next/og";
import { getEvidenceStats } from "@/lib/evidence/load-graph";
import { getGraph } from "@/lib/evidence/queries";

/**
 * Social preview card (M26).
 *
 * Deferred from M24 on purpose: with no origin configured the URL stays relative and
 * no crawler can resolve it. Every word and number here is read from the Evidence
 * Graph, so the card cannot claim something the corpus does not — including the
 * counts, which are themselves frozen claims.
 */

export const alt = "ANISH // RUNTIME — an executable professional identity";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f4f4f2";
const INK = "#1a1a1a";
const MUTED = "#5b5b57";
const RULE = "#d6d6d1";

export default async function Image() {
  const graph = getGraph();
  const stats = getEvidenceStats(graph);
  const { profile } = graph;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: PAPER,
        color: INK,
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          ANISH // RUNTIME
        </div>
        <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.05 }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 34, color: MUTED }}>{profile.positioning}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 36, lineHeight: 1.25, maxWidth: 900 }}>
          {profile.tagline}
        </div>
        <div style={{ display: "flex", height: 1, backgroundColor: RULE }} />
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: MUTED,
            letterSpacing: 1,
          }}
        >
          {`${stats.projects} projects · ${stats.nodes} evidence nodes · ${stats.sources} sources`}
        </div>
      </div>
    </div>,
    size,
  );
}
