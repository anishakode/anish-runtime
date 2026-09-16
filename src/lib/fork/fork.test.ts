import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";
import {
  FORK_HONESTY_LINE,
  classifyRequirement,
  extractRequirements,
  forkFromJobDescription,
  sanitizeJobDescription,
} from "@/lib/fork";

describe("sanitizeJobDescription (M20)", () => {
  it("removes sensitive salary and demographic lines", () => {
    const result = sanitizeJobDescription(
      ["MLOps Engineer", "Salary: £90,000", "Must be under age 30", "- Python"].join(
        "\n",
      ),
    );
    expect(result.removedLineCount).toBe(2);
    expect(result.text).toMatch(/Python/);
    expect(result.text).not.toMatch(/Salary|age 30/i);
  });
});

describe("extractRequirements (M20)", () => {
  it("pulls bullets under a Requirements heading", () => {
    const extracted = extractRequirements(`Role: MLOps Engineer

Requirements:
- PSI and KS drift monitoring
- Python on AWS
`);
    expect(extracted.roleLabel).toMatch(/MLOps/i);
    expect(extracted.roleSlug).toMatch(/mlops/);
    expect(extracted.requirements.length).toBeGreaterThanOrEqual(2);
    expect(extracted.requirements.some((r) => /PSI|drift/i.test(r.text))).toBe(true);
  });

  it("deduplicates identical requirements", () => {
    const extracted = extractRequirements(`Requirements:
- Python
- Python
- Python
`);
    expect(extracted.requirements.filter((r) => /python/i.test(r.text))).toHaveLength(1);
  });
});

describe("classifyRequirement (M20)", () => {
  const documents = buildSearchIndex(getGraph());

  it("never upgrades semantic-only matches to VERIFIED", () => {
    // Force a query unlikely to exact-match but may semantic-hit
    const req = {
      id: "req-sem",
      text: "systems that watch model drift and explain pdf risk signals",
      source: "line" as const,
    };
    const result = classifyRequirement(req, documents);
    if (result.matchPath === "semantic") {
      expect(result.classification).not.toBe("VERIFIED");
      expect(result.classification).toBe("LIMITED");
    }
  });

  it("marks unknown skills as NOT_DEMONSTRATED", () => {
    const result = classifyRequirement(
      {
        id: "req-none",
        text: "xqz9-no-entity-zzz-foobar-98765-telepathy-cert",
        source: "bullet",
      },
      documents,
    );
    expect(result.classification).toBe("NOT_DEMONSTRATED");
    expect(result.evidence).toBeNull();
    expect(result.matchPath).toBe("none");
  });

  it("can VERIFIED-match public MLOps monitoring evidence deterministically", () => {
    const result = classifyRequirement(
      {
        id: "req-psi",
        text: "PSI data drift monitoring",
        source: "bullet",
      },
      documents,
    );
    expect(result.matchPath).toBe("deterministic");
    expect(["VERIFIED", "PROFESSIONAL", "LIMITED"]).toContain(result.classification);
    expect(result.evidence).not.toBeNull();
  });
});

describe("forkFromJobDescription (M20)", () => {
  const documents = buildSearchIndex(getGraph());

  it("builds a temporary branch with integrity manifest and no fit score", () => {
    const branch = forkFromJobDescription(
      `ML Platform Engineer
Requirements:
- PSI / KS drift detection
- Owner-confirmed professional cloud engineering at Cardstack
- Quantum blockchain oracle certification
Salary: $200k
`,
      documents,
    );
    expect(branch.honestyLine).toBe(FORK_HONESTY_LINE);
    expect(branch.integrity.overallFitScore).toBe("not generated");
    expect(branch.integrity.historicalClaimsChanged).toBe(0);
    expect(branch.integrity.evidenceStatesChanged).toBe(0);
    expect(branch.integrity.jobDescriptionPersistence).toBe("none");
    expect(branch.removedSensitiveLines).toBeGreaterThanOrEqual(1);
    expect(branch.counts.NOT_DEMONSTRATED).toBeGreaterThanOrEqual(1);
    expect(branch.branchRef).toMatch(/^anish\/main → role\//);
    expect(JSON.stringify(branch)).not.toMatch(/fit score|hiring decision|culture fit/i);
  });
});
