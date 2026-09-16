import { describe, expect, it, vi } from "vitest";
import { getEvidenceStats } from "@/lib/evidence/load-graph";
import { getGraph } from "@/lib/evidence/queries";

/**
 * The card is the first thing a recruiter sees when the link is pasted into Slack or
 * LinkedIn, and it is the one surface with no visible evidence badges. These tests
 * pin it to the graph so it can never drift into a claim the corpus does not make.
 *
 * `next/og` renders through satori, which needs a browser-like environment; the
 * element tree is asserted instead of the PNG bytes. The route's ability to produce
 * an actual image is covered by the production e2e suite.
 */
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(
      public element: unknown,
      public options: unknown,
    ) {}
  },
}));

function textOf(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  const element = node as { props?: { children?: unknown } };
  return textOf(element.props?.children);
}

describe("social preview card (M26)", () => {
  it("declares the dimensions the platforms expect", async () => {
    const { size, contentType, alt } = await import("@/app/opengraph-image");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    expect(alt.length).toBeGreaterThan(0);
  });

  it("says only what the Evidence Graph says", async () => {
    const Image = (await import("@/app/opengraph-image")).default;
    const response = (await Image()) as unknown as { element: unknown };
    const text = textOf(response.element);

    const { profile } = getGraph();
    const stats = getEvidenceStats(getGraph());

    expect(text).toContain(profile.name);
    expect(text).toContain(profile.tagline);
    expect(text).toContain(profile.positioning);
    // Counts are frozen claims; the card must render them, not round them.
    expect(text).toContain(`${stats.projects} projects`);
    expect(text).toContain(`${stats.nodes} evidence nodes`);
    expect(text).toContain(`${stats.sources} sources`);
  });

  it("makes no claim the corpus cannot back", async () => {
    const Image = (await import("@/app/opengraph-image")).default;
    const response = (await Image()) as unknown as { element: unknown };
    const text = textOf(response.element).toLowerCase();

    for (const inflated of [
      "senior",
      "expert",
      "years of experience",
      "production at scale",
      "award",
      "best",
    ]) {
      expect(text, `card claims "${inflated}"`).not.toContain(inflated);
    }
  });
});
