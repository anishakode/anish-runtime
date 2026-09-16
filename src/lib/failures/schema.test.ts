import { describe, expect, it } from "vitest";
import { FailureExhibitSchema } from "./schema";

const validPublished = {
  id: "fail.fixture.example",
  title: "Fixture failure with artifact",
  summary: "Synthetic fixture used only in tests — not a published museum exhibit.",
  projectSlug: "mlops-governance-dashboard",
  evidenceState: "PUBLIC_CODE_VERIFIED" as const,
  publicationStatus: "published" as const,
  artifacts: [
    {
      id: "art.fixture",
      kind: "github_file" as const,
      title: "Pinned drift script",
      repo: "anishakode/MLOps",
      path: "src/drift.py",
      commitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      url: "https://github.com/anishakode/MLOps/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/src/drift.py",
    },
  ],
  claimedMetrics: [{ label: "PSI", value: "0.42", artifactId: "art.fixture" }],
};

describe("FailureExhibitSchema (M14)", () => {
  it("accepts a fully artifact-backed published exhibit", () => {
    const parsed = FailureExhibitSchema.parse(validPublished);
    expect(parsed.publicationStatus).toBe("published");
    expect(parsed.artifacts).toHaveLength(1);
  });

  it("rejects published exhibits with zero artifacts", () => {
    const result = FailureExhibitSchema.safeParse({
      ...validPublished,
      artifacts: [],
      claimedMetrics: [],
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toMatch(/at least one artifact/i);
  });

  it("rejects published exhibits with NOT_DEMONSTRATED state", () => {
    const result = FailureExhibitSchema.safeParse({
      ...validPublished,
      evidenceState: "NOT_DEMONSTRATED",
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toMatch(/NOT_DEMONSTRATED/);
  });

  it("rejects claimed metrics that do not cite an artifact on the exhibit", () => {
    const result = FailureExhibitSchema.safeParse({
      ...validPublished,
      claimedMetrics: [{ label: "recall", value: "0.1", artifactId: "missing" }],
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toMatch(
      /artifactId is not on this exhibit/,
    );
  });

  it("rejects GitHub artifacts without immutable commit SHA", () => {
    const result = FailureExhibitSchema.safeParse({
      ...validPublished,
      artifacts: [
        {
          id: "art.bad",
          kind: "github_file",
          title: "Unpinned",
          repo: "anishakode/MLOps",
          path: "src/drift.py",
          url: "https://github.com/anishakode/MLOps/blob/main/src/drift.py",
        },
      ],
      claimedMetrics: [],
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toMatch(/commitSha/);
  });

  it("allows draft exhibits without artifacts (not publishable)", () => {
    const parsed = FailureExhibitSchema.parse({
      id: "fail.draft",
      title: "Draft only",
      summary: "Not shown until gate passes.",
      evidenceState: "LIMITED_EVIDENCE",
      publicationStatus: "draft",
      artifacts: [],
      claimedMetrics: [],
    });
    expect(parsed.publicationStatus).toBe("draft");
  });
});
