import { describe, expect, it } from "vitest";
import { CANONICAL_FAILURE_EXHIBITS, listPublishedExhibits } from "./exhibits";
import {
  canPublishExhibit,
  evaluatePublicationGate,
  FAILURE_PUBLICATION_REQUIREMENTS,
} from "./gate";
import { getFailureMuseum } from "./museum";
import type { FailureExhibit } from "./schema";

const completeFixture: FailureExhibit = {
  id: "fail.fixture.gate",
  title: "Gate fixture",
  summary: "Test-only complete exhibit.",
  evidenceState: "PUBLIC_DOCUMENT_VERIFIED",
  publicationStatus: "published",
  artifacts: [
    {
      id: "art.report",
      kind: "report",
      title: "Public report",
      url: "https://example.com/report.pdf",
    },
  ],
  claimedMetrics: [],
};

describe("Failure Museum gate + dataset (M14)", () => {
  it("keeps the canonical exhibit dataset empty", () => {
    expect(CANONICAL_FAILURE_EXHIBITS).toEqual([]);
    expect(listPublishedExhibits()).toEqual([]);
    expect(CANONICAL_FAILURE_EXHIBITS).toHaveLength(0);
  });

  it("lists publication requirements that encode the artifact gate", () => {
    expect(FAILURE_PUBLICATION_REQUIREMENTS).toHaveLength(4);
    expect(FAILURE_PUBLICATION_REQUIREMENTS.join(" ")).toMatch(/artifact-grade/i);
    expect(FAILURE_PUBLICATION_REQUIREMENTS.join(" ")).toMatch(/claimed metric/i);
  });

  it("rejects fabricated remembered-failure drafts at the gate", () => {
    const result = evaluatePublicationGate({
      id: "fail.fabricated",
      title: "Severe minority-class failure",
      summary: "Remembered metrics without artifacts.",
      evidenceState: "LIMITED_EVIDENCE",
      publicationStatus: "published",
      artifacts: [],
      claimedMetrics: [{ label: "Dice", value: "0.12", artifactId: "nowhere" }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons.some((r) => /artifact/i.test(r))).toBe(true);
    }
    expect(canPublishExhibit({ title: "nope" })).toBe(false);
  });

  it("accepts a complete artifact-backed exhibit that is not in the canonical set", () => {
    const result = evaluatePublicationGate(completeFixture);
    expect(result.ok).toBe(true);
    expect(canPublishExhibit(completeFixture)).toBe(true);
    // Canonical museum stays empty even when a fixture would pass:
    expect(listPublishedExhibits()).toEqual([]);
  });

  it("projects an empty museum from the Evidence Graph boundary node", () => {
    const museum = getFailureMuseum();
    expect(museum.empty).toBe(true);
    expect(museum.publishedCount).toBe(0);
    expect(museum.exhibits).toEqual([]);
    expect(museum.state).toBe("NOT_DEMONSTRATED");
    expect(museum.boundaryNodeId).toBe("ev.boundary.failure-museum-empty");
    expect(museum.summary).toMatch(/Empty truthful museum/i);
    expect(museum.publicationRequirements).toEqual([...FAILURE_PUBLICATION_REQUIREMENTS]);
  });

  it("would surface published exhibits only when supplied (future renderer path)", () => {
    const museum = getFailureMuseum([completeFixture]);
    expect(museum.empty).toBe(false);
    expect(museum.publishedCount).toBe(1);
    expect(museum.exhibits[0]?.id).toBe("fail.fixture.gate");
  });
});
